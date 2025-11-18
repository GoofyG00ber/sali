import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

async function testSMTP() {
  console.log('Testing SMTP connection...')
  console.log('Host:', process.env.SMTP_HOST)
  console.log('Port:', process.env.SMTP_PORT)
  console.log('User:', process.env.SMTP_USER)
  console.log('Secure:', process.env.SMTP_SECURE)
  console.log('')

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP credentials missing in .env file')
    process.exit(1)
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    await transporter.verify()
    console.log('✅ SMTP connection successful!')
    console.log('✅ Ready to send emails from:', process.env.FROM_EMAIL || process.env.SMTP_USER)
    console.log('✅ Messages will be sent to:', process.env.SEND_TO_EMAIL || 'orders@example.com')
    process.exit(0)
  } catch (err) {
    console.error('❌ SMTP connection failed:', err.message)
    process.exit(1)
  }
}

testSMTP()
