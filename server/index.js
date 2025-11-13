import express from 'express'
import cors from 'cors'
import { pool } from './db.js'

const app = express()
app.use(cors())
app.use(express.json())

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
    res.status(500).json({ error: 'Failed to fetch category' })
  }
})

app.post('/api/categories', async (req, res) => {
  const { title, image } = req.body
  try {
    const [result] = await pool.query('INSERT INTO categories (title, image) VALUES (?, ?)', [title, image])
    res.json({ id: result.insertId, title, image })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' })
  }
})

app.put('/api/categories/:id', async (req, res) => {
  const { title, image } = req.body
  try {
    await pool.query('UPDATE categories SET title=?, image=? WHERE id=?', [title, image, req.params.id])
    res.json({ id: req.params.id, title, image })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' })
  }
})

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id=?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
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
    const [badges] = await pool.query('SELECT * FROM item_badges')

    const fullFoods = foods.map(food => {
      const foodPrices = prices
        .filter(p => p.food_id === food.id)
        .map(p => ({
          label: p.label,
          price: p.price
        }))

      const foodBadges = badges
        .filter(b => b.food_id === food.id)
        .map(b => b.badge)

      return {
        ...food,
        prices: foodPrices,
        badges: foodBadges
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
    res.json(rows[0] || null)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food' })
  }
})

app.post('/api/foods', async (req, res) => {
  const { title, description, image, categoryId, active, prices, badges } = req.body
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
          'INSERT INTO item_prices (food_id, label, price) VALUES (?, ?, ?)',
          [foodId, price.label, price.price]
        )
      }
    }

    // Insert badges
    if (badges && Array.isArray(badges)) {
      for (const badge of badges) {
        await pool.query(
          'INSERT INTO item_badges (food_id, badge) VALUES (?, ?)',
          [foodId, badge]
        )
      }
    }

    res.json({ id: foodId, title, description, image, categoryId, active, prices, badges })
  } catch (err) {
    console.error('Error creating food:', err)
    res.status(500).json({ error: 'Failed to create food' })
  }
})

app.put('/api/foods/:id', async (req, res) => {
  const { title, description, image, categoryId, active, prices, badges } = req.body
  const foodId = req.params.id

  try {
    await pool.query(
      'UPDATE menu_items SET title=?, description=?, image=?, category_id=?, active=? WHERE id=?',
      [title, description, image, categoryId, active, foodId]
    )

    // Update prices - delete old and insert new
    await pool.query('DELETE FROM item_prices WHERE food_id=?', [foodId])
    if (prices && Array.isArray(prices)) {
      for (const price of prices) {
        await pool.query(
          'INSERT INTO item_prices (food_id, label, price) VALUES (?, ?, ?)',
          [foodId, price.label, price.price]
        )
      }
    }

    // Update badges - delete old and insert new
    await pool.query('DELETE FROM item_badges WHERE food_id=?', [foodId])
    if (badges && Array.isArray(badges)) {
      for (const badge of badges) {
        await pool.query(
          'INSERT INTO item_badges (food_id, badge) VALUES (?, ?)',
          [foodId, badge]
        )
      }
    }

    res.json({ id: foodId, title, description, image, categoryId, active, prices, badges })
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
    res.status(500).json({ error: 'Failed to delete food' })
  }
})

app.patch('/api/foods/:id/toggle-active', async (req, res) => {
  try {
    await pool.query('UPDATE menu_items SET active = NOT active WHERE id=?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle food' })
  }
})

// item prices
app.get('/api/item-prices/:foodId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM item_prices WHERE food_id=?', [req.params.foodId])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item prices' })
  }
})

app.post('/api/item-prices', async (req, res) => {
  const { foodId, label, price } = req.body
  try {
    const [result] = await pool.query('INSERT INTO item_prices (food_id, label, price) VALUES (?, ?, ?)', [foodId, label, price])
    res.json({ id: result.insertId, foodId, label, price })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create price' })
  }
})

// item badges
app.get('/api/item-badges/:foodId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM item_badges WHERE food_id=?', [req.params.foodId])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch badges' })
  }
})

app.post('/api/item-badges', async (req, res) => {
  const { foodId, badge } = req.body
  try {
    const [result] = await pool.query('INSERT INTO item_badges (food_id, badge) VALUES (?, ?)', [foodId, badge])
    res.json({ id: result.insertId, foodId, badge })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create badge' })
  }
})

// orders
app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC')
    // Fetch all order items with food details
    const [items] = await pool.query(`
      SELECT oi.*, mi.title as foodTitle
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.food_id = mi.id
    `)

    // Map items to orders
    const fullOrders = orders.map(order => {
      const orderItems = items.filter(item => item.order_id === order.id)
      return {
        id: order.id.toString(),
        items: orderItems.map(item => ({
          foodId: item.food_id,
          foodTitle: item.foodTitle || 'Unknown Item',
          priceLabel: item.priceLabel || '',
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
        foodTitle: item.foodTitle || 'Unknown Item',
        priceLabel: item.priceLabel || '',
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
      barionPaymentId: null,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    })
  } catch (err) {
    console.error('Error fetching order:', err)
    res.status(500).json({ error: 'Failed to fetch order' })
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
        status || 'pending',
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
          status || 'pending',
          method
        ]
      )
    }

    // Insert order items — fill all available columns
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
        foodTitle: item.foodTitle || 'Unknown Item',
        priceLabel: item.priceLabel || '',
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
    console.error('Error creating order:', err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

app.patch('/api/orders/:id', async (req, res) => {
  const { status } = req.body
  try {
    const updates = []
    const values = []

    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
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
        LEFT JOIN menu_items ON order_items.food_id = menu_items.id
      WHERE order_items.order_id = ?
    `, [order.id])

    res.json({
      id: order.id.toString(),
      items: items.map(item => ({
        foodId: item.food_id,
        foodTitle: item.foodTitle || 'Unknown Item',
        priceLabel: item.priceLabel || '',
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
    res.status(500).json({ error: 'Failed to create order item' })
  }
})

//policies
app.get('/api/policies', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM policies')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch policies' })
  }
})

app.put('/api/policies/:id', async (req, res) => {
  const { content } = req.body
  try {
    await pool.query('UPDATE policies SET content=? WHERE id=?', [content, req.params.id])
    res.json({ id: req.params.id, content })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update policy' })
  }
})

// test endpoint to verify DB connection
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SHOW TABLES')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'DB connection failed' })
  }
})

// start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
