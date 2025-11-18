import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import { pool } from './db.js'

const app = express()
app.use(cors())
app.use(express.json())

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

await ensureMenuMetaTables()

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

app.post('/api/foods', async (req, res) => {
  const { title, description, image, categoryId, active, prices } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO menu_items (title, description, image, category_id, active) VALUES (?, ?, ?, ?, ?)',
      [title, description, image, categoryId, active ?? 1]
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

    res.json({ id: foodId, title, description, image, categoryId, active, prices, badges: [] })
  } catch (err) {
    console.error('Error creating food:', err)
    res.status(500).json({ error: 'Failed to create food' })
  }
})

app.put('/api/foods/:id', async (req, res) => {
  const { title, description, image, categoryId, active, prices } = req.body
  const foodId = req.params.id

  try {
    await pool.query(
      'UPDATE menu_items SET title=?, description=?, image=?, category_id=?, active=? WHERE id=?',
      [title, description, image, categoryId, active, foodId]
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

    res.json({ id: foodId, title, description, image, categoryId, active, prices, badges: [] })
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
    await pool.query('UPDATE menu_items SET active = NOT active WHERE id=?', [req.params.id])
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
      LEFT JOIN menu_items mi ON oi.food_id = mi.id
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
          foodId: item.food_id,
          foodTitle: item.foodTitle || item.food_title || 'Unknown Item',
          priceLabel: item.price_label || '',
          price: item.price,
          quantity: item.quantity
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
      LEFT JOIN menu_items mi ON oi.food_id = mi.id
      WHERE oi.order_id = ?
    `, [order.id])

    res.json({
      id: order.id.toString(),
      items: items.map(item => ({
        foodId: item.food_id,
        foodTitle: item.foodTitle || item.food_title || 'Unknown Item',
        priceLabel: item.price_label || '',
        price: item.price,
        quantity: item.quantity
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

    // Insert order items — fill all available columns (use food_id to match schema)
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await pool.query(
          'INSERT INTO order_items (order_id, food_id, food_title, price_label, price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
          [
            orderId,
            item.foodId ?? item.itemId ?? null,
            item.foodTitle ?? item.name ?? '',
            item.priceLabel ?? '',
            item.price ?? 0,
            item.quantity ?? 1
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
      LEFT JOIN menu_items mi ON oi.food_id = mi.id
      WHERE oi.order_id = ?
    `, [orderId])

    res.json({
      id: orderId.toString(),
      items: orderItems.map(item => ({
        foodId: item.food_id,
        foodTitle: item.foodTitle || item.food_title || 'Unknown Item',
        priceLabel: item.price_label || '',
        price: item.price,
        quantity: item.quantity
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
    })
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
        foodId: item.food_id,
        foodTitle: item.foodTitle || item.food_title || 'Unknown Item',
        priceLabel: item.price_label || '',
        price: item.price,
        quantity: item.quantity
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
  const { orderId, foodId, quantity, price } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO order_items (order_id, food_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, foodId, quantity, price]
    )
    res.json({ id: result.insertId, orderId, foodId, quantity, price })
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

app.put('/api/policies/:id', async (req, res) => {
  const { content } = req.body
  try {
    await pool.query('UPDATE policies SET content=? WHERE id=?', [content, req.params.id])
    res.json({ id: req.params.id, content })
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
      // Only Succeeded payments are marked as confirmed and will appear in admin
      console.log(`Payment ${PaymentRequestId} succeeded, marking as confirmed`)
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
