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

// menu items
app.get('/api/foods', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, c.title AS categoryTitle
      FROM menu_items m
      LEFT JOIN categories c ON m.categoryId = c.id
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
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
  const { title, description, image, categoryId, active } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO menu_items (title, description, image, categoryId, active) VALUES (?, ?, ?, ?, ?)',
      [title, description, image, categoryId, active ?? 1]
    )
    res.json({ id: result.insertId, title, description, image, categoryId, active })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create food' })
  }
})

app.put('/api/foods/:id', async (req, res) => {
  const { title, description, image, categoryId, active } = req.body
  try {
    await pool.query(
      'UPDATE menu_items SET title=?, description=?, image=?, categoryId=?, active=? WHERE id=?',
      [title, description, image, categoryId, active, req.params.id]
    )
    res.json({ id: req.params.id, title, description, image, categoryId, active })
  } catch (err) {
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
    const [rows] = await pool.query('SELECT * FROM item_prices WHERE foodId=?', [req.params.foodId])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item prices' })
  }
})

app.post('/api/item-prices', async (req, res) => {
  const { foodId, label, price } = req.body
  try {
    const [result] = await pool.query('INSERT INTO item_prices (foodId, label, price) VALUES (?, ?, ?)', [foodId, label, price])
    res.json({ id: result.insertId, foodId, label, price })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create price' })
  }
})

// item badges
app.get('/api/item-badges/:foodId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM item_badges WHERE foodId=?', [req.params.foodId])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch badges' })
  }
})

app.post('/api/item-badges', async (req, res) => {
  const { foodId, badge } = req.body
  try {
    const [result] = await pool.query('INSERT INTO item_badges (foodId, badge) VALUES (?, ?)', [foodId, badge])
    res.json({ id: result.insertId, foodId, badge })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create badge' })
  }
})

// orders
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

app.post('/api/orders', async (req, res) => {
  const { customer_name, total_price, status } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO orders (customer_name, total_price, status) VALUES (?, ?, ?)',
      [customer_name, total_price, status ?? 'pending']
    )
    res.json({ id: result.insertId, customer_name, total_price, status })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// order items
app.get('/api/order-items/:orderId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM order_items WHERE orderId=?', [req.params.orderId])
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order items' })
  }
})

app.post('/api/order-items', async (req, res) => {
  const { orderId, foodId, quantity, price } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO order_items (orderId, foodId, quantity, price) VALUES (?, ?, ?, ?)',
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
