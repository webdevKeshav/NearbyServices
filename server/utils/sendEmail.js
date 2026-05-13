const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})


const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"ServeNear" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`📧 Email sent to ${to}`)
  } catch (err) {
    console.error('Email send error:', err.message)
  }
}



const bookingConfirmedEmail = ({ userName, serviceName, providerName, date, time, bookingId, amount }) => `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a0f;color:#f0ede8;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#f0b429,#ff6b35);padding:24px 32px">
    <h1 style="margin:0;font-size:22px;color:#0a0a0f">ServeNear</h1>
    <p style="margin:4px 0 0;color:#0a0a0f;opacity:0.7;font-size:13px">Booking Confirmation</p>
  </div>
  <div style="padding:32px">
    <h2 style="margin:0 0 8px;font-size:20px">Booking Confirmed! 🎉</h2>
    <p style="color:#a8a5b0;margin:0 0 24px">Hi ${userName}, your booking has been confirmed.</p>
    <div style="background:#14141f;border-radius:10px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 10px;display:flex;justify-content:space-between"><span style="color:#6b6878">Booking ID</span><strong>#${bookingId}</strong></p>
      <p style="margin:0 0 10px;display:flex;justify-content:space-between"><span style="color:#6b6878">Service</span><strong>${serviceName}</strong></p>
      <p style="margin:0 0 10px;display:flex;justify-content:space-between"><span style="color:#6b6878">Provider</span><strong>${providerName}</strong></p>
      <p style="margin:0 0 10px;display:flex;justify-content:space-between"><span style="color:#6b6878">Date</span><strong>${date}</strong></p>
      <p style="margin:0 0 10px;display:flex;justify-content:space-between"><span style="color:#6b6878">Time</span><strong>${time}</strong></p>
      <p style="margin:0;display:flex;justify-content:space-between;border-top:1px solid #22223a;padding-top:10px"><span style="color:#6b6878">Amount</span><strong style="color:#f0b429;font-size:18px">₹${amount}</strong></p>
    </div>
    <p style="color:#6b6878;font-size:13px">The provider will contact you before the appointment. For support, reply to this email.</p>
  </div>
</div>
`

const bookingCancelledEmail = ({ userName, serviceName, date }) => `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a0f;color:#f0ede8;border-radius:12px;overflow:hidden">
  <div style="background:#ef4444;padding:24px 32px">
    <h1 style="margin:0;font-size:22px;color:#fff">ServeNear</h1>
  </div>
  <div style="padding:32px">
    <h2 style="margin:0 0 8px">Booking Cancelled</h2>
    <p style="color:#a8a5b0">Hi ${userName}, your booking for <strong>${serviceName}</strong> on ${date} has been cancelled.</p>
    <p style="color:#6b6878;font-size:13px;margin-top:16px">If you did not cancel this, please contact our support team immediately.</p>
  </div>
</div>
`

const welcomeEmail = ({ userName, role }) => `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a0f;color:#f0ede8;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#f0b429,#ff6b35);padding:24px 32px">
    <h1 style="margin:0;font-size:22px;color:#0a0a0f">Welcome to ServeNear 👋</h1>
  </div>
  <div style="padding:32px">
    <h2 style="margin:0 0 8px">Hello, ${userName}!</h2>
    <p style="color:#a8a5b0">Your account as a <strong>${role}</strong> has been created successfully.</p>
    ${role === 'provider'
      ? `<p style="color:#a8a5b0;margin-top:12px">Start by adding your services from the Provider Dashboard to receive bookings.</p>`
      : `<p style="color:#a8a5b0;margin-top:12px">Browse hundreds of services near you and book with just a few clicks.</p>`
    }
  </div>
</div>
`

module.exports = {
  sendEmail,
  bookingConfirmedEmail,
  bookingCancelledEmail,
  welcomeEmail,
}
