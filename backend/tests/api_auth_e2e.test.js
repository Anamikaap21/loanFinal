import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { ENV } from '../config/environment.js';
import app from '../server.js';

test('RealCred Auth HTTP API End-to-End Suite', async (t) => {
  await mongoose.connect(ENV.MONGO_URI);

  let server;
  let baseUrl;

  // Start temporary listening server on random available port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/auth`;
      resolve();
    });
  });

  const runId = Date.now().toString();
  const partnerEmail = `e2e_partner_${runId}@realcred.in`;
  const partnerPhone = `96${Math.floor(10000000 + Math.random() * 90000000)}`;
  let partnerToken;

  await t.test('1. POST /api/auth/login - Role Selection Mismatch Rejection', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: ENV.INITIAL_ADMIN.email,
        password: ENV.INITIAL_ADMIN.password,
        role: 'employee', // intentionally selecting the wrong role
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 403, 'Should reject role mismatch with HTTP 403');
    assert.strictEqual(data.status, 'error');
    assert.match(data.message, /Role mismatch/);
  });

  await t.test('2. POST /api/auth/login - Valid Super Admin Login', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: ENV.INITIAL_ADMIN.email,
        password: ENV.INITIAL_ADMIN.password,
        role: 'admin',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'success');
    assert.ok(data.data.token, 'Should return JWT token');
    assert.strictEqual(data.data.role, 'admin');
    assert.strictEqual(data.data.redirectPath, '/admin/dashboard');
  });

  await t.test('3. POST /api/auth/register-partner - Self Registration with Immediate Activation', async () => {
    const res = await fetch(`${baseUrl}/register-partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vikas Gupta',
        email: partnerEmail,
        phone: partnerPhone,
        password: 'VikasPassword@2026',
        city: 'Noida',
        state: 'Uttar Pradesh',
        businessName: 'Gupta FinCorp',
        panNumber: 'ABCDE5555G',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.status, 'success');
    assert.ok(data.data.token);
    assert.strictEqual(data.data.role, 'partner');
    assert.strictEqual(data.data.partner.accountStatus, 'active');
    partnerToken = data.data.token;
  });

  await t.test('4. GET /api/auth/me - Protected Route with Bearer Token', async () => {
    const res = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'success');
    assert.strictEqual(data.data.user.email, partnerEmail);
    assert.strictEqual(data.data.role, 'partner');
  });

  await t.test('5. GET /api/auth/me - Protected Route Rejects Missing Token', async () => {
    const res = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.status, 'error');
  });

  // Teardown
  server.close();
  await mongoose.disconnect();
  process.exit(0);
});
