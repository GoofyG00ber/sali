import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { pool } from './db.js'
import { printOrder } from './printer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/static_images')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

function sanitizePriceEntry(entry) {
  if (!entry) return null
  const label = typeof entry.label === 'string' && entry.label.trim().length ? entry.label.trim() : ''
  const num = Number(entry.price)
  if (!Number.isFinite(num)) return null
  return { label: label || 'Alap', price: num }
}

function parseStoredPriceArray(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map(sanitizePriceEntry).filter(Boolean)
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return parseStoredPriceArray(parsed)
    } catch {
      return []
    }
  }
  if (typeof raw === 'object') {
    return Object.entries(raw)
      .map(([key, value]) => sanitizePriceEntry({
        label: key,
        price: value
      }))
      .filter(Boolean)
  }
  return []
}

function buildPricesForFood(food, priceRows = []) {
  const normalizedFromRows = priceRows
    .map((row) => sanitizePriceEntry({ label: row.label, price: row.price }))
    .filter(Boolean)

  if (normalizedFromRows.length) {
    return normalizedFromRows
  }

  const fallback = parseStoredPriceArray(
    food?.prices ?? food?.prices_json ?? food?.price_options ?? food?.priceOptions
  )

  if (fallback.length) {
    return fallback
  }

  const candidate = food?.price ?? food?.base_price ?? food?.default_price
  if (candidate !== undefined && candidate !== null) {
    const num = Number(candidate)
    if (Number.isFinite(num)) {
      return [{ label: 'Alap', price: num }]
    }
  }

  return []
}

async function ensureMenuMetaTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS item_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        label VARCHAR(64) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_item_prices_item_id (item_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
  } catch (err) {
    console.error('Failed to ensure item_prices table exists:', err)
  }
}

async function ensureSettingsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(64) PRIMARY KEY,
        setting_value VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // Insert default manual_open status if not exists
    const [rows] = await pool.query('SELECT * FROM settings WHERE setting_key = ?', ['manual_open'])
    if (rows.length === 0) {
      await pool.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', ['manual_open', 'true'])
    }
  } catch (err) {
    console.error('Failed to ensure settings table exists:', err)
  }
}

async function ensureOpeningHoursTable() {
  try {
    // The table already exists with from_time and til_time columns as timestamps
    // We just need to ensure it has data if empty
    const [rows] = await pool.query('SELECT * FROM open_hours')
    if (rows.length === 0) {
      const defaults = [
        { day: 'Hétfő', open: '10:00', close: '21:00' },
        { day: 'Kedd', open: '10:00', close: '21:00' },
        { day: 'Szerda', open: '10:00', close: '21:00' },
        { day: 'Csütörtök', open: '10:00', close: '21:00' },
        { day: 'Péntek', open: '10:00', close: '22:00' },
        { day: 'Szombat', open: '10:00', close: '22:00' },
        { day: 'Vasárnap', open: '14:00', close: '21:00' }
      ]

      // Use a dummy date for the timestamp
      const baseDate = '2000-01-01'

      for (const d of defaults) {
        await pool.query(
          'INSERT INTO open_hours (name_of_day, from_time, til_time) VALUES (?, ?, ?)',
          [d.day, `${baseDate} ${d.open}:00`, `${baseDate} ${d.close}:00`]
        )
      }
    }
  } catch (err) {
    console.error('Failed to ensure open_hours table exists:', err)
  }
}

async function ensureOrderItemsExtras() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM order_items LIKE 'extras'")
    if (cols.length === 0) {
      await pool.query('ALTER TABLE order_items ADD COLUMN extras JSON DEFAULT NULL')
    }
  } catch (err) {
    console.error('Failed to ensure extras column in order_items:', err)
  }
}

async function ensureOrderItemsPriceLabel() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM order_items LIKE 'price_label'")
    if (cols.length === 0) {
      await pool.query('ALTER TABLE order_items ADD COLUMN price_label VARCHAR(64) DEFAULT NULL')
    }
  } catch (err) {
    console.error('Failed to ensure price_label column in order_items:', err)
  }
}

await ensureMenuMetaTables()
await ensureSettingsTable()
await ensureOpeningHoursTable()
await ensureOrderItemsExtras()
await ensureOrderItemsPriceLabel()

// Restaurant Status & Opening Hours
app.get('/api/restaurant-status', async (req, res) => {
  try {
    // 1. Get Manual Override Status
    const [settings] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', ['manual_open'])
    const manualOpen = settings.length > 0 ? settings[0].setting_value === 'true' : true

    // 2. Get Current Time in Hungary
    const now = new Date()
    const hungaryTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }))
    const currentDay = hungaryTime.getDay() // 0 = Sunday, 1 = Monday, ...
    const currentHour = hungaryTime.getHours()
    const currentMinute = hungaryTime.getMinutes()
    const currentTimeValue = currentHour * 60 + currentMinute

    // Map JS getDay() to Hungarian day names in DB
    const dayNames = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat']
    const todayName = dayNames[currentDay]

    // 3. Get Opening Hours for Today
    const [hours] = await pool.query('SELECT * FROM open_hours WHERE name_of_day = ?', [todayName])

    let isOpenBySchedule = false
    let schedule = null

    if (hours.length > 0) {
      const todayHours = hours[0]

      // Parse DB times (timestamps)
      const fromDate = new Date(todayHours.from_time)
      const tilDate = new Date(todayHours.til_time)

      // Convert DB times to Hungary time components
      const fromHungary = new Date(fromDate.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }))
      const tilHungary = new Date(tilDate.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }))

      const fromValue = fromHungary.getHours() * 60 + fromHungary.getMinutes()
      const tilValue = tilHungary.getHours() * 60 + tilHungary.getMinutes()

      // If fromValue == tilValue, it's considered closed
      if (fromValue !== tilValue) {
        isOpenBySchedule = currentTimeValue >= fromValue && currentTimeValue < tilValue
      }

      schedule = {
        day: todayName,
        from: `${fromHungary.getHours().toString().padStart(2, '0')}:${fromHungary.getMinutes().toString().padStart(2, '0')}`,
        to: `${tilHungary.getHours().toString().padStart(2, '0')}:${tilHungary.getMinutes().toString().padStart(2, '0')}`,
        isOpen: fromValue !== tilValue
      }
    }

    // 4. Determine Final Status
    // If manual switch is OFF, we are closed regardless of schedule.
    // If manual switch is ON, we follow the schedule.
    const isOpen = manualOpen && isOpenBySchedule

    res.json({
      isOpen,
      manualOpen,
      isOpenBySchedule,
      schedule,
      message: isOpen ? 'Nyitva vagyunk' : (manualOpen ? 'Jelenleg zárva vagyunk (nyitvatartási időn kívül)' : 'Jelenleg zárva vagyunk (technikai okok miatt)')
    })

  } catch (err) {
    console.error('Error checking restaurant status:', err)
    res.status(500).json({ error: 'Failed to check status' })
  }
})

app.get('/api/opening-hours', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM open_hours')
    // Sort by day index to ensure correct order (Monday first)
    const dayOrder = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap']
    rows.sort((a, b) => dayOrder.indexOf(a.name_of_day) - dayOrder.indexOf(b.name_of_day))
    res.json(rows)
  } catch (err) {
    console.error('Error fetching opening hours:', err)
    res.status(500).json({ error: 'Failed to fetch opening hours' })
  }
})

app.put('/api/opening-hours', async (req, res) => {
  const { hours } = req.body
  if (!Array.isArray(hours)) {
    return res.status(400).json({ error: 'Invalid data format' })
  }

  try {
    // Use a dummy date for the timestamp construction
    const baseDate = '2000-01-01'

    for (const h of hours) {
      // h.open_time and h.close_time are expected to be "HH:mm" strings
      const fromTime = `${baseDate} ${h.open_time}:00`
      const tilTime = `${baseDate} ${h.close_time}:00`

      await pool.query(
        'UPDATE open_hours SET from_time = ?, til_time = ? WHERE name_of_day = ?',
        [fromTime, tilTime, h.name_of_day]
      )
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Error updating opening hours:', err)
    res.status(500).json({ error: 'Failed to update opening hours' })
  }
})

app.post('/api/restaurant-status', async (req, res) => {
  const { manualOpen } = req.body
  try {
    await pool.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      ['manual_open', String(manualOpen), String(manualOpen)]
    )
    res.json({ success: true, manualOpen })
  } catch (err) {
    console.error('Error updating restaurant status:', err)
    res.status(500).json({ error: 'Failed to update status' })
  }
})

// categories
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories')
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

app.get('/api/categories/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id=?', [req.params.id])
    res.json(rows[0] || null)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch category' })
  }
})

app.get('/api/top-pizzas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT tp.id as top_id, mi.*
      FROM top_pizzas tp
      JOIN menu_items mi ON tp.item_id = mi.id
      WHERE mi.active = 1
    `)

    if (rows.length === 0) {
      return res.json([])
    }

    // Fetch prices for these items
    const itemIds = rows.map(r => r.id)
    const [prices] = await pool.query('SELECT * FROM item_prices WHERE item_id IN (?)', [itemIds])

    const priceMap = new Map()
    for (const price of prices) {
      const key = String(price.item_id)
      if (!priceMap.has(key)) {
        priceMap.set(key, [])
      }
      priceMap.get(key).push(price)
    }

    const topPizzas = rows.map(food => {
      const foodPrices = buildPricesForFood(food, priceMap.get(String(food.id)) || [])
      return {
        ...food,
        prices: foodPrices,
        badges: Array.isArray(food?.badges) ? food.badges : []
      }
    })

    res.json(topPizzas)
  } catch (err) {
    console.error('Error fetching top pizzas:', err)
    res.status(500).json({ error: 'Failed to fetch top pizzas' })
  }
})

app.post('/api/top-pizzas', async (req, res) => {
  const { itemId } = req.body
  try {
    // Check if already exists
    const [existing] = await pool.query('SELECT * FROM top_pizzas WHERE item_id=?', [itemId])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Item already in top pizzas' })
    }

    // Check if item exists and is a pizza (category_id=1)
    const [item] = await pool.query('SELECT * FROM menu_items WHERE id=? AND category_id=1', [itemId])
    if (item.length === 0) {
      return res.status(400).json({ error: 'Item not found or not a pizza' })
    }

    const [result] = await pool.query('INSERT INTO top_pizzas (item_id) VALUES (?)', [itemId])
    res.json({ id: result.insertId, itemId })
  } catch (err) {
    console.error('Error adding top pizza:', err)
    res.status(500).json({ error: 'Failed to add top pizza' })
  }
})

app.delete('/api/top-pizzas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM top_pizzas WHERE id=?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting top pizza:', err)
    res.status(500).json({ error: 'Failed to delete top pizza' })
  }
})

app.post('/api/categories', async (req, res) => {
  const { title, image } = req.body
  try {
    const [result] = await pool.query('INSERT INTO categories (title, image) VALUES (?, ?)', [title, image])
    res.json({ id: result.insertId, title, image })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

app.put('/api/categories/:id', async (req, res) => {
  const { title, image } = req.body
  try {
    await pool.query('UPDATE categories SET title=?, image=? WHERE id=?', [title, image, req.params.id])
    res.json({ id: req.params.id, title, image })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update category' })
  }
})

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id=?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

app.get('/api/foods', async (req, res) => {
  try {
    const [foods] = await pool.query(`
      SELECT menu_items.*, categories.title AS categoryTitle
      FROM menu_items
      LEFT JOIN categories ON menu_items.category_Id = categories.id
    `)
    const [prices] = await pool.query('SELECT * FROM item_prices')

    const priceMap = new Map()
    for (const price of prices) {
      const key = String(price.item_id ?? price.item_id)
      if (!priceMap.has(key)) {
        priceMap.set(key, [])
      }
      priceMap.get(key).push(price)
    }

    const fullFoods = foods.map(food => {
      const foodPrices = buildPricesForFood(food, priceMap.get(String(food.id)) || [])

      return {
        ...food,
        prices: foodPrices,
        badges: Array.isArray(food?.badges) ? food.badges : []
      }
    })

    res.json(fullFoods)
  } catch (err) {
    console.error('Error fetching foods:', err)
    res.status(500).json({ error: 'Failed to fetch foods' })
  }
})


app.get('/api/foods/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items WHERE id=?', [req.params.id])
    if (!rows.length) {
      return res.status(404).json({ error: 'Food not found' })
    }

    const food = rows[0]
  const [priceRows] = await pool.query('SELECT * FROM item_prices WHERE item_id=?', [food.id])
    const prices = buildPricesForFood(food, priceRows)

    res.json({
      ...food,
      prices,
      badges: Array.isArray(food?.badges) ? food.badges : []
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch food' })
  }
})

app.post('/api/foods', upload.single('image'), async (req, res) => {
  const { title, description, categoryId, active } = req.body
  let prices = req.body.prices

  // Parse prices if it's a string (from FormData)
  if (typeof prices === 'string') {
    try {
      prices = JSON.parse(prices)
    } catch (e) {
      prices = []
    }
  }

  // Handle image path
  let imagePath = req.body.image || '/placeholder.png' // Fallback
  if (req.file) {
    imagePath = '/static_images/' + req.file.filename
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO menu_items (title, description, image, category_id, active) VALUES (?, ?, ?, ?, ?)',
      [title, description, imagePath, categoryId, active ?? 1]
    )

    const foodId = result.insertId

    // Insert prices
    if (prices && Array.isArray(prices)) {
      for (const price of prices) {
        await pool.query(
          'INSERT INTO item_prices (item_id, label, price) VALUES (?, ?, ?)',
          [foodId, price.label, price.price]
        )
      }
    }

    res.json({ id: foodId, title, description, image: imagePath, categoryId, active, prices, badges: [] })
  } catch (err) {
    console.error('Error creating food:', err)
    res.status(500).json({ error: 'Failed to create food' })
  }
})

app.put('/api/foods/:id', upload.single('image'), async (req, res) => {
  const { title, description, categoryId, active } = req.body
  let prices = req.body.prices
  const foodId = req.params.id

  // Parse prices
  if (typeof prices === 'string') {
    try {
      prices = JSON.parse(prices)
    } catch (e) {
      prices = []
    }
  }

  // Handle image path
  let imagePath = req.body.image
  if (req.file) {
    imagePath = '/static_images/' + req.file.filename
  }

  try {
    await pool.query(
      'UPDATE menu_items SET title=?, description=?, image=?, category_id=?, active=? WHERE id=?',
      [title, description, imagePath, categoryId, active, foodId]
    )

    // Update prices - delete old and insert new
  await pool.query('DELETE FROM item_prices WHERE item_id=?', [foodId])
    if (prices && Array.isArray(prices)) {
      for (const price of prices) {
        await pool.query(
          'INSERT INTO item_prices (item_id, label, price) VALUES (?, ?, ?)',
          [foodId, price.label, price.price]
        )
      }
    }

    res.json({ id: foodId, title, description, image: imagePath, categoryId, active, prices, badges: [] })
  } catch (err) {
    console.error('Error updating food:', err)
    res.status(500).json({ error: 'Failed to update food' })
  }
})

app.delete('/api/foods/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id=?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete food' })
  }
})

app.patch('/api/foods/:id/toggle-active', async (req, res) => {
  try {
    await pool.query('UPDATE menu_items SET active = IF(active = 1, 0, 1) WHERE id=?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to toggle food' })
  }
})

// item prices
app.get('/api/item-prices/:foodId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM item_prices WHERE item_id=?', [req.params.foodId])
    res.json(rows)
  } catch (err) {
    console.error('Error fetching item prices:', err)
    res.status(500).json({ error: 'Failed to fetch item prices' })
  }
})

app.post('/api/item-prices', async (req, res) => {
  const { foodId, label, price } = req.body
  try {
    const [result] = await pool.query('INSERT INTO item_prices (item_id, label, price) VALUES (?, ?, ?)', [foodId, label, price])
    res.json({ id: result.insertId, foodId, label, price })
  } catch (err) {
    console.error('Error creating price:', err)
    res.status(500).json({ error: 'Failed to create price' })
  }
})

// orders
app.get('/api/orders', async (req, res) => {
  try {
    // Only show cash orders immediately, and show Barion (online) orders only after they've been confirmed
    const [orders] = await pool.query("SELECT * FROM orders WHERE payment_method='cash' OR (payment_method='barion' AND status <> 'pending') ORDER BY created_at DESC")
    // Fetch all order items with food details
    const [items] = await pool.query(`
      SELECT oi.*, mi.title as foodTitle
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.item_id = mi.id
    `)

    // Map items to orders
    const fullOrders = orders.map(order => {
      const orderItems = items.filter(item => item.order_id === order.id)
      // derive paymentStatus from payment_method and status
      const paymentStatus = (order.payment_method === 'barion')
        ? (order.status === 'confirmed' ? 'paid' : (order.status === 'cancelled' ? 'failed' : 'pending'))
        : 'pending'

      return {
        id: order.id.toString(),
        items: orderItems.map(item => ({
          itemId: item.item_id,
          foodTitle: item.item_title || 'Unknown Item',
          priceLabel: item.price_label || '',
          price: item.price,
          quantity: item.quantity,
          extras: typeof item.extras === 'string' ? JSON.parse(item.extras) : item.extras
        })),
        deliveryType: order.delivery_type || 'pickup',
        deliveryInfo: {
          name: order.name || '',
          email: order.email || '',
          phone: order.phone || '',
          address: order.address || '',
          city: order.city || '',
          zip: order.zip || '',
          note: order.note || ''
        },
        totalPrice: order.total_price,
        status: order.status || 'pending',
        paymentStatus,
        paymentMethod: order.payment_method || 'cash',
        barionPaymentId: null,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }
    })
    res.json(fullOrders)
  } catch (err) {
    console.error('Error fetching orders:', err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

app.get('/api/orders/:id', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id=?', [req.params.id])
    if (!orders.length) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = orders[0]
    const [items] = await pool.query(`
      SELECT oi.*, mi.title as foodTitle
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.item_id = mi.id
      WHERE oi.order_id = ?
    `, [order.id])

    res.json({
      id: order.id.toString(),
      items: items.map(item => ({
        itemId: item.item_id,
        foodTitle: item.item_title || item.food_title || 'Unknown Item',
        priceLabel: item.price_label || '',
        price: item.price,
        quantity: item.quantity,
        extras: typeof item.extras === 'string' ? JSON.parse(item.extras) : item.extras
      })),
      deliveryType: order.delivery_type || 'pickup',
      deliveryInfo: {
        name: order.name || '',
        email: order.email || '',
        phone: order.phone || '',
        address: order.address || '',
        city: order.city || '',
        zip: order.zip || '',
        note: order.note || ''
      },
      totalPrice: order.total_price,
      status: order.status || 'pending',
      paymentStatus: (order.payment_method === 'barion')
        ? (order.status === 'paid' ? 'paid' : (order.status === 'cancelled' ? 'failed' : 'pending'))
        : 'pending',
      paymentMethod: order.payment_method || 'cash',
      barionPaymentId: null,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    })
  } catch (err) {
    console.error('Error fetching order:', err)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
  })

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const orderId = req.params.id

    if (!status || !['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, orderId])

    res.json({ success: true, orderId, status })
  } catch (err) {
    console.error('Error updating order status:', err)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// Print order manually
app.post('/api/orders/:id/print', async (req, res) => {
  try {
    const orderId = req.params.id
    const [orders] = await pool.query('SELECT * FROM orders WHERE id=?', [orderId])

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = orders[0]
    const [items] = await pool.query(`
      SELECT oi.*, mi.title as foodTitle
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.item_id = mi.id
      WHERE oi.order_id = ?
    `, [order.id])

    const fullOrder = {
      id: order.id.toString(),
      items: items.map(item => ({
        foodTitle: item.item_title || item.foodTitle || 'Unknown Item',
        priceLabel: item.price_label || '',
        price: item.price,
        quantity: item.quantity,
        extras: typeof item.extras === 'string' ? JSON.parse(item.extras) : item.extras
      })),
      deliveryType: order.delivery_type || 'pickup',
      deliveryInfo: {
        name: order.name || '',
        phone: order.phone || '',
        address: order.address || '',
        city: order.city || '',
        zip: order.zip || '',
        note: order.note || ''
      },
      totalPrice: order.total_price,
      paymentMethod: order.payment_method || 'cash',
      createdAt: order.created_at
    }

    await printOrder(fullOrder)
    res.json({ success: true, message: 'Print command sent' })
  } catch (err) {
    console.error('Error printing order:', err)
    res.status(500).json({ error: 'Failed to print order' })
  }
})

  app.post('/api/orders', async (req, res) => {
  // Map camelCase to snake_case
  const {
    items = [],
    deliveryType,
    deliveryInfo = {},
    totalPrice,
    paymentMethod,
    // Also support snake_case for backward compatibility
    customer_name,
    customer_email,
    customer_phone,
    delivery_type,
    delivery_address,
    delivery_city,
    delivery_zip,
    order_notes,
    total_price,
    status,
    payment_method,
  } = req.body

  // Use camelCase values if provided, otherwise fall back to snake_case
  const name = customer_name || deliveryInfo?.name || ''
  const email = customer_email || deliveryInfo?.email || ''
  const phone = customer_phone || deliveryInfo?.phone || ''
  const type = delivery_type || deliveryType || 'pickup'
  const address = delivery_address || deliveryInfo?.address || ''
  const city = delivery_city || deliveryInfo?.city || ''
  const zip = delivery_zip || deliveryInfo?.zip || ''
  const notes = order_notes || deliveryInfo?.note || ''
  const price = total_price || totalPrice || 0
  const method = payment_method || paymentMethod || 'cash'
  const orderStatus = status || 'pending'  // Accept status from request body

  console.log('Creating order with:', { method, orderStatus, price })

  try {
    // Check restaurant status before creating order
    // 1. Get Manual Override Status
    const [settings] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', ['manual_open'])
    const manualOpen = settings.length > 0 ? settings[0].setting_value === 'true' : true

    // 2. Get Current Time in Hungary
    const now = new Date()
    const hungaryTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }))
    const currentDay = hungaryTime.getDay() // 0 = Sunday, 1 = Monday, ...
    const currentHour = hungaryTime.getHours()
    const currentMinute = hungaryTime.getMinutes()
    const currentTimeValue = currentHour * 60 + currentMinute

    // Map JS getDay() to Hungarian day names in DB
    const dayNames = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat']
    const todayName = dayNames[currentDay]

    // 3. Get Opening Hours for Today
    const [hours] = await pool.query('SELECT * FROM open_hours WHERE name_of_day = ?', [todayName])

    let isOpenBySchedule = false
    if (hours.length > 0) {
      const todayHours = hours[0]

      const fromDate = new Date(todayHours.from_time)
      const tilDate = new Date(todayHours.til_time)
      const fromHungary = new Date(fromDate.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }))
      const tilHungary = new Date(tilDate.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }))
      const fromValue = fromHungary.getHours() * 60 + fromHungary.getMinutes()
      const tilValue = tilHungary.getHours() * 60 + tilHungary.getMinutes()

      if (fromValue !== tilValue) {
        isOpenBySchedule = currentTimeValue >= fromValue && currentTimeValue < tilValue
      }
    }

    const isOpen = manualOpen && isOpenBySchedule

    if (!isOpen) {
      return res.status(403).json({ error: 'Az étterem jelenleg zárva tart, rendelés nem adható le.' })
    }

    // Determine orders.id column type so we generate a compatible id
    const [idCols] = await pool.query("SHOW COLUMNS FROM orders WHERE Field='id'")
    const idColType = (idCols && idCols[0] && idCols[0].Type) ? idCols[0].Type.toLowerCase() : ''
    const idIsNumeric = /int|decimal|float|double|numeric|bigint/.test(idColType)

    let orderId
    if (idIsNumeric) {
      // generate a numeric id by taking max(id)+1 (safe-ish for low-concurrency dev environment)
      const [maxRows] = await pool.query('SELECT MAX(id) as maxId FROM orders')
      const maxId = maxRows && maxRows[0] && maxRows[0].maxId ? Number(maxRows[0].maxId) : 0
      orderId = maxId + 1
      await pool.query(
      `INSERT INTO orders (
          id,
          name,
          email,
          phone,
          delivery_type,
          address,
          city,
          zip,
          note,
          total_price,
          status,
          payment_method,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        orderId,
        name,
        email,
        phone,
        type,
        address,
        city,
        zip,
        notes,
        price,
        orderStatus,
        method
      ]
    )
    } else {
      // string id (UUID-like)
      const generatedId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
      orderId = generatedId
      await pool.query(
          `INSERT INTO orders (
            id,
            name,
            email,
            phone,
            delivery_type,
            address,
            city,
            zip,
            note,
            total_price,
            status,
            payment_method,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          orderId,
          name,
          email,
          phone,
          type,
          address,
          city,
          zip,
          notes,
          price,
          orderStatus,
          method
        ]
      )
    }

    // Insert order items — fill all available columns (use item_id to match schema)
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const extrasJson = item.extras ? JSON.stringify(item.extras) : null
        await pool.query(
          'INSERT INTO order_items (order_id, item_id, item_title, quantity, price, extras, price_label) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            orderId,
            item.itemId ?? item.foodId ?? null,
            item.foodTitle ?? item.item_title ?? item.title ?? 'Unknown Item',
            item.quantity ?? 1,
            item.price ?? 0,
            extrasJson,
            item.priceLabel ?? item.price_label ?? null
          ]
        )
      }
    }

    // Fetch and return the complete order
    const [orders] = await pool.query('SELECT * FROM orders WHERE id=?', [orderId])
    if (!orders.length) {
      return res.status(500).json({ error: 'Order created but could not be retrieved' })
    }

    const order = orders[0]
    const [orderItems] = await pool.query(`
      SELECT oi.*, mi.title as foodTitle
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.item_id = mi.id
      WHERE oi.order_id = ?
    `, [orderId])

    const responseOrder = {
      id: orderId.toString(),
      items: orderItems.map(item => ({
        itemId: item.item_id,
        foodTitle: item.item_title || 'Unknown Item',
        priceLabel: item.price_label || '',
        price: item.price,
        quantity: item.quantity,
        extras: typeof item.extras === 'string' ? JSON.parse(item.extras) : item.extras
      })),
      deliveryType: order.delivery_type || 'pickup',
      deliveryInfo: {
          name: order.name || '',
          email: order.email || '',
          phone: order.phone || '',
          address: order.address || '',
          city: order.city || '',
          zip: order.zip || '',
          note: order.note || ''
      },
      totalPrice: order.total_price,
      status: order.status || 'pending',
        paymentStatus: (order.payment_method === 'barion')
          ? (order.status === 'paid' ? 'paid' : (order.status === 'cancelled' ? 'failed' : 'pending'))
          : 'pending',
      paymentMethod: order.payment_method || 'cash',
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }

    res.json(responseOrder)

    // Auto-print cash orders
    if (responseOrder.paymentMethod === 'cash') {
      printOrder(responseOrder).catch(err => console.error('Auto-print failed:', err))
    }
  } catch (err) {
    console.error('Error creating order:', err && err.stack ? err.stack : err)
    // In development return the error message for easier debugging. In production avoid leaking internals.
    const message = err && err.message ? err.message : 'Failed to create order'
    res.status(500).json({ error: 'Failed to create order', details: message })
  }
})

app.patch('/api/orders/:id', async (req, res) => {
  const { status, paymentStatus } = req.body
  try {
    const updates = []
    const values = []

    // paymentStatus can be provided by frontend (paid/failed/pending) and will be mapped to internal order status
    let finalStatus
    if (paymentStatus !== undefined) {
      if (paymentStatus === 'paid') finalStatus = 'paid'
      else if (paymentStatus === 'failed') finalStatus = 'cancelled'
      else if (paymentStatus === 'pending') finalStatus = 'pending'
    } else if (status !== undefined) {
      finalStatus = status
    }

    if (finalStatus !== undefined) {
      updates.push('status = ?')
      values.push(finalStatus)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    values.push(req.params.id)

    await pool.query(
      `UPDATE orders SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    )

    // Fetch updated order
    const [orders] = await pool.query('SELECT * FROM orders WHERE id=?', [req.params.id])
    if (!orders.length) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = orders[0]
    const [items] = await pool.query(`
      SELECT order_items.*, menu_items.title as foodTitle
      FROM order_items
        LEFT JOIN menu_items ON order_items.item_id = menu_items.id
      WHERE order_items.order_id = ?
    `, [order.id])

    res.json({
      id: order.id.toString(),
      items: items.map(item => ({
        itemId: item.item_id,
        foodTitle: item.item_title || 'Unknown Item',
        priceLabel: '',
        price: item.price,
        quantity: item.quantity,
        extras: typeof item.extras === 'string' ? JSON.parse(item.extras) : item.extras
      })),
      deliveryType: order.delivery_type || 'pickup',
      deliveryInfo: {
          name: order.name || '',
          email: order.email || '',
          phone: order.phone || '',
          address: order.address || '',
          city: order.city || '',
          zip: order.zip || '',
          note: order.note || ''
      },
      totalPrice: order.total_price,
      status: order.status || 'pending',
        paymentStatus: 'pending',
      paymentMethod: order.payment_method || 'cash',
      createdAt: order.created_at,
      updatedAt: order.updated_at
    })
  } catch (err) {
    console.error('Error updating order:', err)
    res.status(500).json({ error: 'Failed to update order' })
  }
})

// order items
app.get('/api/order-items/:orderId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM order_items WHERE order_id=?', [req.params.orderId])
    res.json(rows)
  } catch (err) {
    console.error('Error fetching order items:', err)
    res.status(500).json({ error: 'Failed to fetch order items' })
  }
})

app.post('/api/order-items', async (req, res) => {
  const { orderId, itemId, quantity, price } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO order_items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, itemId, quantity, price]
    )
    res.json({ id: result.insertId, orderId, itemId, quantity, price })
  } catch (err) {
    console.error('Error creating order item:', err)
    res.status(500).json({ error: 'Failed to create order item' })
  }
})

//policies
app.get('/api/policies', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM policies')
    res.json(rows)
  } catch (err) {
    console.error('Error fetching policies:', err)
    res.status(500).json({ error: 'Failed to fetch policies' })
  }
})

app.get('/api/policies/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM policies WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' })
    }
    // Map snake_case to camelCase for frontend
    const policy = rows[0]
    res.json({
      id: policy.id,
      title: policy.title,
      content: policy.content,
      lastUpdated: policy.last_updated
    })
  } catch (err) {
    console.error('Error fetching policy:', err)
    res.status(500).json({ error: 'Failed to fetch policy' })
  }
})

app.put('/api/policies/:id', async (req, res) => {
  const { content } = req.body
  try {
    await pool.query('UPDATE policies SET content=?, last_updated=NOW() WHERE id=?', [content, req.params.id])

    // Fetch updated policy to return
    const [rows] = await pool.query('SELECT * FROM policies WHERE id = ?', [req.params.id])
    const policy = rows[0]

    res.json({
      id: policy.id,
      title: policy.title,
      content: policy.content,
      lastUpdated: policy.last_updated
    })
  } catch (err) {
    console.error('Error updating policy:', err)
    res.status(500).json({ error: 'Failed to update policy' })
  }
})

// test endpoint to verify DB connection
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SHOW TABLES')
    res.json(rows)
  } catch (err) {
    console.error('DB connection failed:', err)
    res.status(500).json({ error: 'DB connection failed' })
  }
})

// Barion payment state check endpoint
app.post('/api/barion/check-payment', async (req, res) => {
  try {
    const { paymentId } = req.body

    if (!paymentId) {
      return res.status(400).json({ error: 'Missing paymentId' })
    }

    console.log('Checking Barion payment state for:', paymentId)

    // Call Barion GetPaymentState API from backend - USES GET METHOD
    const posKey = '4926b2ca-633f-420a-b1dc-c2d03e669fdf'
    const barionUrl = `https://api.test.barion.com/v2/Payment/GetPaymentState?POSKey=${posKey}&PaymentId=${paymentId}`

    const barionResponse = await fetch(barionUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    const result = await barionResponse.json()
    console.log('Barion GetPaymentState full response:', JSON.stringify(result, null, 2))
    console.log('Barion payment state:', result.Status)

    // Check for Barion API errors
    if (result.Errors && result.Errors.length > 0) {
      console.error('Barion API Errors:', result.Errors)
      return res.status(400).json({ error: 'Barion API error', details: result.Errors })
    }

    // If payment is successful, update order status and print
    if (result.Status === 'Succeeded') {
      const PaymentRequestId = result.PaymentRequestId

      // Check if order is already confirmed to avoid double printing
      const [existing] = await pool.query('SELECT status FROM orders WHERE id = ?', [PaymentRequestId])
      if (existing.length > 0 && existing[0].status !== 'confirmed') {
        console.log(`Payment ${PaymentRequestId} verified as Succeeded via check-payment, updating and printing`)

        await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', ['confirmed', PaymentRequestId])

        // Store Barion Payment ID if possible
        try {
          const [cols] = await pool.query("SHOW COLUMNS FROM orders LIKE 'barion_payment_id'")
          if (cols && cols.length) {
            await pool.query('UPDATE orders SET barion_payment_id = ? WHERE id = ?', [paymentId, PaymentRequestId])
          }
        } catch {
          // ignore
        }

        // Auto-print
        try {
          const [orders] = await pool.query('SELECT * FROM orders WHERE id=?', [PaymentRequestId])
          if (orders.length > 0) {
            const order = orders[0]
            const [items] = await pool.query(`
              SELECT oi.*, mi.title as foodTitle
              FROM order_items oi
              LEFT JOIN menu_items mi ON oi.item_id = mi.id
              WHERE oi.order_id = ?
            `, [order.id])

            const fullOrder = {
              id: order.id.toString(),
              items: items.map(item => ({
                foodTitle: item.item_title || item.foodTitle || 'Unknown Item',
                priceLabel: item.price_label || '',
                price: item.price,
                quantity: item.quantity,
                extras: typeof item.extras === 'string' ? JSON.parse(item.extras) : item.extras
              })),
              deliveryType: order.delivery_type || 'pickup',
              deliveryInfo: {
                name: order.name || '',
                phone: order.phone || '',
                address: order.address || '',
                city: order.city || '',
                zip: order.zip || '',
                note: order.note || ''
              },
              totalPrice: order.total_price,
              paymentMethod: 'barion',
              createdAt: order.created_at
            }

            printOrder(fullOrder).catch(err => console.error('Auto-print failed:', err))
          }
        } catch (err) {
          console.error('Error preparing print for Barion order:', err)
        }
      }
    }

    res.json(result)
  } catch (err) {
    console.error('Error checking Barion payment:', err)
    res.status(500).json({ error: 'Failed to check payment state' })
  }
})

// Barion callback endpoint - Barion will call this after payment state changes
app.post('/api/barion/callback', async (req, res) => {
  try {
    const payload = req.body || {}
    const PaymentId = payload.PaymentId || payload.paymentId || payload.paymentID || null
    const PaymentRequestId = payload.PaymentRequestId || payload.paymentRequestId || payload.PaymentRequestID || payload.PaymentRequest || payload.PaymentRequestExternalId || payload.PaymentRequestExternalId || null
    const State = payload.State || payload.state || payload.Status || payload.status || payload.PaymentStatus || payload.PaymentState || null

    console.log('Barion callback received:', { PaymentId, PaymentRequestId, State })

    if (!PaymentRequestId) {
      return res.status(400).json({ error: 'Missing PaymentRequestId' })
    }

    // Barion states: Prepared, Started, InProgress, Waiting, Reserved, Authorized, Succeeded, Canceled, Expired, Failed
    const stateStr = (State || '').toString()

    if (stateStr === 'Succeeded') {
      // Check if already confirmed to avoid double printing
      const [existing] = await pool.query('SELECT status FROM orders WHERE id = ?', [PaymentRequestId])

      if (existing.length > 0 && existing[0].status !== 'confirmed') {
        // Only Succeeded payments are marked as confirmed and will appear in admin
        console.log(`Payment ${PaymentRequestId} succeeded (callback), marking as confirmed`)
        await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', ['confirmed', PaymentRequestId])

        // if orders table has barion_payment_id column, store PaymentId
        try {
          const [cols] = await pool.query("SHOW COLUMNS FROM orders LIKE 'barion_payment_id'")
          if (cols && cols.length) {
            await pool.query('UPDATE orders SET barion_payment_id = ? WHERE id = ?', [PaymentId, PaymentRequestId])
          }
        } catch {
          // ignore if column doesn't exist
        }

        // Auto-print confirmed Barion orders
        try {
          const [orders] = await pool.query('SELECT * FROM orders WHERE id=?', [PaymentRequestId])
          if (orders.length > 0) {
            const order = orders[0]
            const [items] = await pool.query(`
              SELECT oi.*, mi.title as foodTitle
              FROM order_items oi
              LEFT JOIN menu_items mi ON oi.item_id = mi.id
              WHERE oi.order_id = ?
            `, [order.id])

            const fullOrder = {
              id: order.id.toString(),
              items: items.map(item => ({
                foodTitle: item.item_title || item.foodTitle || 'Unknown Item',
                priceLabel: item.price_label || '',
                price: item.price,
                quantity: item.quantity,
                extras: typeof item.extras === 'string' ? JSON.parse(item.extras) : item.extras
              })),
              deliveryType: order.delivery_type || 'pickup',
              deliveryInfo: {
                name: order.name || '',
                phone: order.phone || '',
                address: order.address || '',
                city: order.city || '',
                zip: order.zip || '',
                note: order.note || ''
              },
              totalPrice: order.total_price,
              paymentMethod: 'barion',
              createdAt: order.created_at
            }

            printOrder(fullOrder).catch(err => console.error('Auto-print failed:', err))
          }
        } catch (err) {
          console.error('Error preparing print for Barion order:', err)
        }
      } else {
        console.log(`Payment ${PaymentRequestId} already confirmed, skipping update/print in callback`)
      }
    } else if (['Canceled', 'Expired', 'Failed'].includes(stateStr)) {
      // Failed/canceled payments are marked as cancelled and won't appear in admin
      console.log(`Payment ${PaymentRequestId} ${stateStr}, marking as cancelled`)
      await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', ['cancelled', PaymentRequestId])
    } else {
      // For Prepared, Started, InProgress, Waiting, etc. - keep pending
      console.log(`Payment ${PaymentRequestId} in state ${stateStr}, keeping as pending`)
      // Do not update status - it stays 'pending' and won't appear in admin until Succeeded
    }

    res.json({ ok: true })
  } catch (err) {
    console.error('Error handling Barion callback:', err)
    res.status(500).json({ error: 'Failed to process Barion callback' })
  }
})

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  try {
    const { name, email, message } = req.body
    if (!message || !email) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP not configured, logging message instead')
      console.log('Message from:', name || email, `<${email}>`)
      console.log('Message:', message)
      return res.json({ ok: true, message: 'Üzenet elküldve (dev mode)' })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    const recipient = process.env.SEND_TO_EMAIL || 'orders@example.com'
    const subject = `Website message from ${name || email}`
    const text = `From: ${name || 'N/A'} <${email}>\n\n${message}`

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || email,
      to: recipient,
      subject,
      text
    })

    res.json({ ok: true, message: 'Üzenet elküldve' })
  } catch (err) {
    console.error('Email send error:', err)
    res.status(500).json({ error: 'Failed to send email' })
  }
})

// start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
