import 'dotenv/config';
export const config = {
  production: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI,
  trustProxy: process.env.TRUST_PROXY === '1',
  sessionDays: 7,
  mailMode: process.env.MAIL_MODE || (process.env.NODE_ENV === 'production' ? 'smtp' : 'console'),
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  mailFrom: process.env.MAIL_FROM || 'HealthPal <noreply@localhost>',
  geminiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
};

export function validateEnvironment() {
  if (!config.mongoUri)
    throw new Error('MONGO_URI is required; copy backend/.env.example to backend/.env.');
  let client;
  try {
    client = new URL(config.clientUrl);
  } catch {
    throw new Error('CLIENT_URL must be a valid HTTP or HTTPS origin.');
  }
  if (!['http:', 'https:'].includes(client.protocol) || client.origin !== config.clientUrl)
    throw new Error('CLIENT_URL must be an origin without a path or trailing slash.');
  if (
    config.production &&
    (!process.env.CLIENT_URL?.startsWith('https://') ||
      config.mailMode !== 'smtp' ||
      !config.smtp.host)
  ) {
    throw new Error('Production requires an HTTPS CLIENT_URL and SMTP mail configuration.');
  }
}
