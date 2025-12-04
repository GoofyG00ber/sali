import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Try to load .env from server directory or root directory
const envPathServer = join(__dirname, '.env')
const envPathRoot = join(__dirname, '../.env')

if (fs.existsSync(envPathServer)) {
  dotenv.config({ path: envPathServer })
} else if (fs.existsSync(envPathRoot)) {
  dotenv.config({ path: envPathRoot })
} else {
  console.warn('No .env file found in server or root directory!')
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
})
