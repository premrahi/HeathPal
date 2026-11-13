// Test-only harness: ephemeral MongoDB, captured development mail, and a fake AI provider.
// This file is never imported by the application server.
import express from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from '../src/config/env.js';
config.production = false; config.clientUrl = 'http://127.0.0.1:5173';
config.mailMode = 'console'; config.geminiKey = 'browser-test-key';
const { app } = await import('../src/app.js');
const { User } = await import('../src/models/User.js');
const { Session } = await import('../src/models/Session.js');
const { Challenge } = await import('../src/models/Challenge.js');
const mongo = await MongoMemoryServer.create({ binary: { downloadDir: path.resolve('.cache/mongodb') } });
await mongoose.connect(mongo.getUri());
await Promise.all([User.init(), Session.init(), Challenge.init()]);
const mail = new Map();
const originalLog = console.log;
console.log = (...args) => {
  const text = args.join(' '), match = text.match(/^\[Development mail to (.+?)\][\s\S]*?code is (\d{6})/);
  if (match) mail.set(match[1], match[2]); else originalLog(...args);
};
global.fetch = async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({
  is_medical_report: true, summary: 'A sample blood test report, used for automated testing.',
  english: 'This sample report lists laboratory measurements. Review the original values with your clinician.',
  romanUrdu: 'Is namoona report mein laboratory ki measurements hain. Asal values apne doctor ke saath dekhein.',
  questions: ['Which values should we discuss?'],
}) }] } }] }) });
const harness = express();
harness.get('/__test/mail', (req, res) => res.json({ code: mail.get(req.query.email) }));
harness.use(app);
const server = harness.listen(5000, '127.0.0.1', () => console.log('Browser test API ready'));
async function stop() { server.close(); await mongoose.disconnect(); await mongo.stop(); process.exit(0); }
process.on('SIGTERM', stop); process.on('SIGINT', stop);
