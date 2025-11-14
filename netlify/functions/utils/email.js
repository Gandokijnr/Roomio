// Email utility for Netlify functions
import nodemailer from 'nodemailer'

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

export const sendEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createTransporter()

    // Verify connection configuration
    await transporter.verify()

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"${process.env.HOTEL_NAME || 'Roomio Hotel'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html
    })

    console.log('Message sent: %s', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export default { sendEmail }
