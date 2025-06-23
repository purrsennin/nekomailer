import express from 'express'
import fs from 'fs'
import path from 'path'
import os from 'os'
import nodemailer from 'nodemailer'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { body, validationResult } from 'express-validator'
import slowDown from 'express-slow-down'
import favicon from 'serve-favicon'
import dotenv from 'dotenv'
dotenv.config()

const app = express()

app.use(helmet())
app.use(express.json({ limit: '10kb' }))
app.use(favicon(path.join(import.meta.dirname, 'favicon.ico')))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many requests, please try again in 15 minutes'
})

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 5,
  delayMs: hits => hits * 200
})

const validateEmail = [
  body('to').isEmail().normalizeEmail(),
  body('subject').trim().isLength({ max: 100 }).escape(),
  body('message').trim().isLength({ max: 2000 }).escape()
]

const requestCache = new Map()
const CACHE_TTL = 5 * 60 * 1000

const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  maxConnections: 1,
  maxMessages: 10,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const htmlTemplate = (type, subject, message, to) => {
  const footer = `<hr style="margin: 20px 0;">
    <p style="font-size: 14px; color: #888;">Dikirim oleh <b><a href="https://saweria.co/nekochii" style="text-decoration: none; color: #f78fb3">@nekochii</a></b></p>`

  switch (type) {
    case 'announcement':
      return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #fffbea; border: 1px solid #f1c40f; border-radius: 8px;">
          <img src="https://raw.githubusercontent.com/senochii/DB/main/storage/d4cefbb9.jpeg" width="100" alt="announcement">
          <h2 style="color: #d35400;">${subject}</h2>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">${message}</p>
          ${footer}
        </div>
      `
    case 'registration':
      return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f0f9ff; border: 1px solid #3498db; border-radius: 8px;">
          <h2 style="color: #2980b9;">${subject}</h2>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">
            ${message}
          </p>
          <p style="font-size: 14px; color: #555;">Email terdaftar: <b>${to}</b></p>
          ${footer}
        </div>
      `
    default:
      return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2c3e50;">${subject}</h2>
          <p style="color: #333; font-size: 16px; line-height: 1.5;">${message}</p>
          ${footer}
        </div>
      `
  }
}

app.get('/', (req, res) => {
  res.json({
    message: 'Nekomailer API',
    endpoint: {
      method: 'POST',
      path: '/send-email',
      description: 'nekomailer is an api that helps send a message to someone quickly, accurately and verified.',
      note: 'nekomailer is under senochii surveillance'
    }
  })
})

app.post('/send-email', limiter, speedLimiter, validateEmail, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { to, subject, message, template = 'default' } = req.body

    const requestKey = `${to}-${subject}-${message.substring(0, 50)}`
    if (requestCache.has(requestKey)) return res.status(429).json({ message: 'A similar email has just been sent. Please wait a moment.~' })
    requestCache.set(requestKey, Date.now())

    const blockedDomains = ['example.com', 'test.com']
    const recipientDomain = to.split('@')[1]
    if (blockedDomains.includes(recipientDomain)) return res.status(400).json({ message: 'This email domain is not allowed' })

    const mailOptions = {
      from: `\"NekoMail\" <${process.env.EMAIL_USER}>`,
      to,
      subject: `[NekoMail] ${subject}`,
      html: htmlTemplate(template, subject, message, to),
      priority: 'low'
    }

    const sendMailPromise = transporter.sendMail(mailOptions)
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), 10000))
    await Promise.race([sendMailPromise, timeoutPromise])

    res.json({ message: 'Meow~ Email sent successfully!' })
  } catch (error) {
    console.error('Email error:', error.message)
    if (error.message.includes('timeout')) {
      res.status(504).json({ message: 'Meow~ Email took too long to send :<' })
    } else if (error.code === 'ECONNECTION') {
      res.status(503).json({ message: 'Email service is currently unavailable' })
    } else {
      res.status(500).json({ message: 'Failed to send email :(' })
    }
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`📮 NekoMail is active on port ${PORT}`))

setInterval(() => {
  const now = Date.now()
  requestCache.forEach((timestamp, key) => {
    if (now - timestamp > CACHE_TTL) requestCache.delete(key)
  })
}, CACHE_TTL)
