// Mock API server for frontend development
// Run: node server/mock-server.js

import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 3001

// Mock data
const mockFoods = [
  {
    id: 1,
    title: 'Margherita',
    description: 'Paradicsom, mozzarella, bazsalikom',
    image: '/placeholder.png',
    category_id: 1,
    categoryId: 1,
    categoryTitle: 'Pizza',
    active: 1,
    prices: [
      { label: '32cm', price: 2500 },
      { label: '45cm', price: 3500 }
    ],
    badges: []
  }
]

const mockCategories = [
  { id: 1, title: 'Pizza', image: '/pizza.jpg' },
  { id: 2, title: 'Italok', image: '/drinks.jpg' }
]

// Mock endpoints
app.get('/api/foods', (req, res) => res.json(mockFoods))
app.get('/api/categories', (req, res) => res.json(mockCategories))
app.get('/api/top-pizzas', (req, res) => res.json([]))
app.get('/api/orders', (req, res) => res.json([]))
app.get('/api/policies/:id', (req, res) => res.json({
  id: req.params.id,
  title: 'Policy',
  content: 'Mock content',
  lastUpdated: new Date().toISOString()
}))

app.get('/api/restaurant-status', (req, res) => res.json({
  isOpen: true,
  manualOpen: true,
  isOpenBySchedule: true,
  schedule: { day: 'Hétfő', from: '10:00', to: '21:00' },
  message: 'Nyitva vagyunk'
}))

app.get('/api/opening-hours', (req, res) => res.json([
  { name_of_day: 'Hétfő', from_time: '10:00', til_time: '21:00' }
]))

app.post('/api/orders', (req, res) => res.json({
  id: Date.now().toString(),
  ...req.body,
  status: 'pending',
  createdAt: new Date().toISOString()
}))

app.post('/api/admin/verify', (req, res) => res.json({ valid: true }))

app.listen(PORT, () => console.log(`Mock server running on http://localhost:${PORT}`))
