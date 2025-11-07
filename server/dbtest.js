import { pool } from './db.js'

try {
  const [rows] = await pool.query('SHOW TABLES')
  console.log('✅ Tables:', rows)
  process.exit(0)
} catch (err) {
  console.error('❌ DB connection failed:', err.message)
  process.exit(1)
}
