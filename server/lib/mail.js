import nodemailer from 'nodemailer';
import { run } from '../db.js';

let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const FROM = process.env.MAIL_FROM || 'The Ocean Watches <no-reply@oceanwatches.local>';

function logEmail(to, subject, status) {
  try {
    run('INSERT INTO email_log (to_email, subject, status, created_at) VALUES (?, ?, ?, ?)',
      to, subject, status, new Date().toISOString());
  } catch (err) { /* ignore */ }
}

export async function sendMail(to, subject, html) {
  logEmail(to, subject, 'queued');
  if (!transporter) {
    console.log(`[MAIL dev] -> ${to} | ${subject}\n${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300)}`);
    logEmail(to, subject, 'logged');
    return { ok: true, dev: true };
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    logEmail(to, subject, 'sent');
    return { ok: true };
  } catch (err) {
    logEmail(to, subject, 'error: ' + (err.message || ''));
    console.error('[MAIL error]', err.message);
    return { ok: false, error: err.message };
  }
}

export const MAIL_ENABLED = !!transporter;
