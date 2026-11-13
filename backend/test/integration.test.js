import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app.js';
import { config } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Session } from '../src/models/Session.js';
import { Challenge } from '../src/models/Challenge.js';
import { Report } from '../src/models/Report.js';
import { Vital } from '../src/models/Vital.js';

const header = ['X-HealthPal', '1'];
const credentials = { name: 'Test Person', email: 'person@example.test', password: 'A-test-password-42' };
async function captureMail(action) {
  let code;
  const original = console.log;
  console.log = (...args) => {
    const message = args.join(' ');
    if (message.startsWith('[Development mail')) code = message.match(/code is (\d{6})/)?.[1];
    else original(...args);
  };
  try { const response = await action(); return { response, code }; }
  finally { console.log = original; }
}

test('MERN account and private health data journeys', { timeout: 240000 }, async t => {
  config.mailMode = 'console'; config.geminiKey = '';
  const mongo = await MongoMemoryServer.create({ binary: { downloadDir: path.resolve('.cache/mongodb') } });
  t.after(async () => { await mongoose.disconnect(); await mongo.stop(); });
  await mongoose.connect(mongo.getUri());
  await Promise.all([User.init(), Session.init(), Challenge.init(), Report.init(), Vital.init()]);
  const alice = request.agent(app), bob = request.agent(app);
  let reportId, vitalId;

  await t.test('requires a verification header and rejects foreign origins', async () => {
    await alice.post('/api/auth/signup').send(credentials).expect(403);
    await alice.post('/api/auth/signup').set(...header).set('Origin', 'https://foreign.test').send(credentials).expect(403);
    await alice.post('/api/auth/signup').set(...header).send({ ...credentials, password: 'short' }).expect(400);
  });
  await t.test('creates an account, verifies email and sets an HTTP-only cookie', async () => {
    const { response, code } = await captureMail(() => alice.post('/api/auth/signup').set(...header).send(credentials));
    assert.equal(response.status, 201); assert.match(code, /^\d{6}$/);
    await alice.post('/api/auth/login').set(...header).send(credentials).expect(403);
    const verified = await alice.post('/api/auth/verify-email').set(...header).send({ email: credentials.email, code }).expect(200);
    assert.match(verified.headers['set-cookie'][0], /HttpOnly/);
    assert.match(verified.headers['set-cookie'][0], /SameSite=Strict/);
    assert.equal(verified.body.user.passwordHash, undefined);
    await alice.post('/api/auth/verify-email').set(...header).send({ email: credentials.email, code }).expect(400);
    const current = await alice.get('/api/auth/me').expect(200);
    assert.equal(current.body.user.email, credentials.email);
    await alice.post('/api/auth/signup').set(...header).send(credentials).expect(409);
  });
  await t.test('creates a second owner and rejects unauthenticated records access', async () => {
    const other = { ...credentials, email: 'other@example.test' };
    const { code } = await captureMail(() => bob.post('/api/auth/signup').set(...header).send(other));
    await bob.post('/api/auth/verify-email').set(...header).send({ email: other.email, code }).expect(200);
    await request(app).get('/api/reports').expect(401);
    await request(app).get('/api/vitals').expect(401);
  });
  await t.test('saves only allowed profile fields and validates dates', async () => {
    await alice.put('/api/profile').set(...header).send({ name: 'Updated Person', profile: { dateOfBirth: '2024-02-31' } }).expect(400);
    const result = await alice.put('/api/profile').set(...header).send({ name: 'Updated Person', email: 'changed@example.test', profile: { city: 'Delhi', bloodGroup: 'O+' } }).expect(200);
    assert.equal(result.body.user.email, credentials.email);
    assert.equal(result.body.user.profile.city, 'Delhi');
    assert.equal((await bob.get('/api/profile')).body.user.profile.city, '');
  });
  await t.test('records, validates, edits and isolates vital measurements', async () => {
    const reading = { systolic: 120, diastolic: 80, weight: 70, pulse: 72, glucose: 95, measuredAt: new Date().toISOString(), note: 'Before breakfast' };
    await alice.post('/api/vitals').set(...header).send({ ...reading, diastolic: null }).expect(400);
    await alice.post('/api/vitals').set(...header).send({ ...reading, measuredAt: '2099-01-01T00:00:00.000Z' }).expect(400);
    const added = await alice.post('/api/vitals').set(...header).send(reading).expect(201);
    vitalId = added.body.vital._id;
    await bob.put(`/api/vitals/${vitalId}`).set(...header).send(reading).expect(404);
    await bob.delete(`/api/vitals/${vitalId}`).set(...header).expect(404);
    assert.equal((await bob.get('/api/vitals')).body.total, 0);
    await alice.put(`/api/vitals/${vitalId}`).set(...header).send({ ...reading, weight: 71 }).expect(200);
    assert.equal((await alice.get('/api/vitals')).body.items[0].weight, 71);
    await alice.get('/api/vitals?page=-1').expect(400);
  });
  await t.test('stores report files privately and filters search literally', async () => {
    const pdf = Buffer.from('%PDF-1.4\n% test medical fixture\n%%EOF');
    const result = await alice.post('/api/reports').set(...header).field('title', 'Blood test [2026]').field('category', 'Laboratory').attach('file', pdf, { filename: 'lab.pdf', contentType: 'application/pdf' }).expect(201);
    reportId = result.body.report._id;
    assert.equal(result.body.report.fileData, undefined);
    assert.equal((await alice.get('/api/reports?search=%5B2026%5D')).body.total, 1);
    assert.equal((await bob.get('/api/reports')).body.total, 0);
    await bob.get(`/api/reports/${reportId}`).expect(404);
    await bob.get(`/api/reports/${reportId}/file`).expect(404);
    await bob.delete(`/api/reports/${reportId}`).set(...header).expect(404);
    const download = await alice.get(`/api/reports/${reportId}/file`).expect(200);
    assert.match(download.headers['content-disposition'], /attachment/);
    assert.equal(download.headers['cache-control'], 'no-store');
    assert.ok(download.body.equals(pdf));
    await alice.post('/api/reports').set(...header).field('title', 'Wrong file').attach('file', Buffer.from('not a pdf'), { filename: 'fake.pdf', contentType: 'application/pdf' }).expect(400);
    await alice.get('/api/reports/invalid-id').expect(400);
  });
  await t.test('requires AI consent and handles missing provider credentials honestly', async () => {
    await alice.post(`/api/reports/${reportId}/analyze`).set(...header).send({ consent: false }).expect(400);
    await alice.post(`/api/reports/${reportId}/analyze`).set(...header).send({ consent: true }).expect(503);
    assert.equal((await alice.get(`/api/reports/${reportId}`)).body.report.status, 'uploaded');
  });
  await t.test('uploads and removes a private profile photo', async () => {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfoQAAAAASUVORK5CYII=', 'base64');
    await alice.put('/api/profile/avatar').set(...header).attach('file', png, { filename: 'avatar.png', contentType: 'image/png' }).expect(200);
    await alice.get('/api/profile/avatar').expect(200).expect('Content-Type', /image\/png/);
    await bob.get('/api/profile/avatar').expect(404);
    await alice.delete('/api/profile/avatar').set(...header).expect(200);
    await alice.get('/api/profile/avatar').expect(404);
  });
  await t.test('aggregates only the current owner and deletes records', async () => {
    const dashboard = (await alice.get('/api/dashboard').expect(200)).body;
    assert.equal(dashboard.reportCount, 1); assert.equal(dashboard.vitalCount, 1);
    assert.equal((await bob.get('/api/dashboard')).body.reportCount, 0);
    assert.equal((await alice.get('/api/dashboard/insights')).body.total, 0);
    await alice.delete(`/api/reports/${reportId}`).set(...header).expect(200);
    await alice.get(`/api/reports/${reportId}/file`).expect(404);
    await alice.delete(`/api/vitals/${vitalId}`).set(...header).expect(200);
  });
  await t.test('changes passwords, revokes other sessions, and logs out', async () => {
    const otherDevice = request.agent(app);
    await otherDevice.post('/api/auth/login').set(...header).send(credentials).expect(200);
    await alice.post('/api/auth/change-password').set(...header).send({ currentPassword: 'incorrect', password: 'A-new-password-43' }).expect(400);
    await alice.post('/api/auth/change-password').set(...header).send({ currentPassword: credentials.password, password: 'A-new-password-43' }).expect(200);
    await otherDevice.get('/api/auth/me').expect(401);
    await alice.get('/api/auth/me').expect(200);
    await alice.post('/api/auth/logout').set(...header).expect(200);
    await alice.get('/api/auth/me').expect(401);
    await alice.post('/api/auth/login').set(...header).send(credentials).expect(401);
  });
  await t.test('resets a password with one-use codes and invalidates all sessions', async () => {
    await alice.post('/api/auth/login').set(...header).send({ ...credentials, password: 'A-new-password-43' }).expect(200);
    const { code } = await captureMail(() => alice.post('/api/auth/forgot-password').set(...header).send({ email: credentials.email }));
    assert.match(code, /^\d{6}$/);
    await alice.post('/api/auth/forgot-password').set(...header).send({ email: credentials.email }).expect(429);
    await alice.post('/api/auth/reset-password').set(...header).send({ email: credentials.email, code: '000000', password: 'A-reset-password-44' }).expect(400);
    await alice.post('/api/auth/reset-password').set(...header).send({ email: credentials.email, code, password: 'A-reset-password-44' }).expect(200);
    await alice.get('/api/auth/me').expect(401);
    await alice.post('/api/auth/reset-password').set(...header).send({ email: credentials.email, code, password: 'A-reset-password-44' }).expect(400);
    await alice.post('/api/auth/login').set(...header).send({ ...credentials, password: 'A-reset-password-44' }).expect(200);
  });
  await t.test('locks exhausted codes and enforces expiry independently of TTL cleanup', async () => {
    const pending = { ...credentials, email: 'pending@example.test' };
    const { code } = await captureMail(() => alice.post('/api/auth/signup').set(...header).send(pending));
    for (let i = 0; i < 5; i++) await alice.post('/api/auth/verify-email').set(...header).send({ email: pending.email, code: '000000' }).expect(400);
    await alice.post('/api/auth/verify-email').set(...header).send({ email: pending.email, code }).expect(400);
    const current = await User.findOne({ email: credentials.email });
    await Session.updateMany({ user: current._id }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
    await alice.get('/api/auth/me').expect(401);
  });
});
