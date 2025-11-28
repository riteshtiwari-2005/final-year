const nodemailer = require("nodemailer");

let transporter = null;

/**
 * Create a transporter using ONLY real SMTP credentials.
 * If missing, throw an error.
 */
async function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP credentials missing. Set SMTP_HOST, SMTP_USER, SMTP_PASS.");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: (function(){ const p = parseInt(process.env.SMTP_PORT || "587", 10); return p; })(),
    secure: (function(){ const p = parseInt(process.env.SMTP_PORT || "587", 10); return (process.env.SMTP_SECURE === "true") || p === 465; })(),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
    },
  });
}

/**
 * Send an email using the configured SMTP server.
 */
async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    transporter = await createTransporter();
  }

  const from =
    process.env.FROM_EMAIL ||
    process.env.SMTP_USER ||
    "no-reply@example.com";

  const message = { from, to, subject, text, html };

  try {
    return await transporter.sendMail(message);
  } catch (err) {
    console.error("SMTP send failed:", err.message || err);
    throw err;
  }
}

module.exports = { sendMail };
