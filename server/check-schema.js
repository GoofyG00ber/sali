import { pool } from './db.js'

try {
  console.log('=== order_items columns ===')
  const [cols] = await pool.query('SHOW COLUMNS FROM order_items')
  cols.forEach(col => {
    console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`)
  })
  
  console.log('\n=== orders columns ===')
  const [orderCols] = await pool.query('SHOW COLUMNS FROM orders')
  orderCols.forEach(col => {
    console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`)
  })
  
  process.exit(0)
} catch (err) {
  console.error('Error:', err.message)
  process.exit(1)
}
