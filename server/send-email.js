import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Predetermined recipient
const RECIPIENT = process.env.SEND_TO_EMAIL || 'orders@example.com'

// Create transporter from env vars; if not provided, use a stub that logs
function createTransporter(){
  if(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS){
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  }
  // fallback: console logger transport
  return { sendMail: async (opts) => { console.log('sendMail (stub):', opts); return { accepted: [RECIPIENT] } } }
}

const transporter = createTransporter()

// If transporter supports verify, attempt to verify to show config errors early
if(typeof transporter.verify === 'function'){
  transporter.verify().then(() => console.log('Email transporter verified')).catch(err => console.warn('Transporter verify failed:', err && err.message ? err.message : err))
}

app.post('/send-email', async (req, res) => {
  try{
    const { name, email, message } = req.body
    if(!message || !email) return res.status(400).json({ error: 'Missing fields' })

    const subject = `Website message from ${name || email}`
    const text = `From: ${name || 'N/A'} <${email}>\n\n${message}`

    const info = await transporter.sendMail({ from: process.env.FROM_EMAIL || email, to: RECIPIENT, subject, text })
    res.json({ ok: true, message: 'Üzenet elküldve', info })
  }catch(err){ console.error(err); res.status(500).json({ error: 'Failed to send' }) }
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Email server running on ${port}`))
