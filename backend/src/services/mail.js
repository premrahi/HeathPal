import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { ApiError } from '../lib/errors.js';

// Console delivery is development-only; production configuration enforces SMTP.
export async function sendCode(email, code, purpose) {
  const subject = purpose === 'verify' ? 'Verify your HealthPal email' : 'Reset your HealthPal password';
  const text = `${subject}\n\nYour code is ${code}. It expires in 10 minutes.\nIf you did not request this, ignore this email.`;
  if (config.mailMode === 'console' && !config.production) {
    console.log(`[Development mail to ${email}]\n${text}`);
    return;
  }
  if (!config.smtp.host) throw new ApiError(503, 'Email delivery is not configured. Contact the administrator.');
  const transport = nodemailer.createTransport({
    host: config.smtp.host, port: config.smtp.port, secure: config.smtp.port === 465,
    ...(config.smtp.user ? { auth: { user: config.smtp.user, pass: config.smtp.pass } } : {}),
    connectionTimeout: 10000, socketTimeout: 15000,
  });
  try { await transport.sendMail({ from: config.mailFrom, to: email, subject, text }); }
  catch { throw new ApiError(503, 'Email could not be delivered. Please try resending later.'); }
}
