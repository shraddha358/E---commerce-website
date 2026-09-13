const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  return info;
};

const orderConfirmationEmail = (order, user) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee">
    <h2 style="color:#e53e3e">ShopEase</h2>
    <h3>Order Confirmed! 🎉</h3>
    <p>Hi ${user.name}, your order has been placed successfully.</p>
    <table width="100%" cellpadding="8" style="border-collapse:collapse;margin:16px 0">
      <tr style="background:#f7f7f7"><th align="left">Order #</th><td>${order.order_number}</td></tr>
      <tr><th align="left">Total</th><td>₹${order.total}</td></tr>
      <tr style="background:#f7f7f7"><th align="left">Status</th><td>${order.status}</td></tr>
      <tr><th align="left">Payment</th><td>${order.payment_method.toUpperCase()}</td></tr>
    </table>
    <p>Thank you for shopping with ShopEase!</p>
  </div>
`;

const passwordResetEmail = (name, resetUrl) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee">
    <h2 style="color:#e53e3e">ShopEase</h2>
    <h3>Password Reset Request</h3>
    <p>Hi ${name}, click the button below to reset your password. This link expires in 1 hour.</p>
    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#e53e3e;color:#fff;text-decoration:none;border-radius:4px;margin:16px 0">Reset Password</a>
    <p style="color:#666;font-size:12px">If you didn't request this, please ignore this email.</p>
  </div>
`;

module.exports = { sendEmail, orderConfirmationEmail, passwordResetEmail };
