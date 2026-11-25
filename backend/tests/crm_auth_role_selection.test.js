import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import app from '../server.js';
import { ENV } from '../config/environment.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Partner from '../models/Partner.js';

test('REALCRED CRM - Role Selection, Authentication & Session Isolation Test Suite', async (t) => {
  let server;
  let baseUrl = '';

  const runId = Date.now().toString();
  const adminEmail = `admin_crm_${runId}@realcred.in`;
  const employeeEmail = `emp_crm_${runId}@realcred.in`;
  const partnerEmail = `partner_crm_${runId}@realcred.in`;
  const defaultPassword = 'TestPassword123!';

  let adminUser;
  let employeeUser;
  let partnerUser;

  // Ephemeral server
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(ENV.MONGO_URI || ENV.MONGODB_URI);
  }

  // Create clean test users for all 3 roles
  adminUser = await User.create({
    name: 'CRM Test Admin',
    email: adminEmail,
    phone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: defaultPassword,
    role: 'admin',
    status: 'active',
  });

  employeeUser = await User.create({
    name: 'CRM Test Employee',
    email: employeeEmail,
    phone: `92${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: defaultPassword,
    role: 'employee',
    status: 'active',
  });

  await Employee.create({
    user: employeeUser._id,
    employeeId: `RCE-${runId.slice(-4)}`,
    department: 'Operations',
    designation: 'Loan Officer',
    workStatus: 'active',
  });

  partnerUser = await User.create({
    name: 'CRM Test Partner',
    email: partnerEmail,
    phone: `93${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: defaultPassword,
    role: 'partner',
    status: 'active',
  });

  await Partner.create({
    user: partnerUser._id,
    partnerCode: `RCP-${runId.slice(-6)}`,
    businessName: 'CRM Partner Solutions',
    businessType: 'Individual',
    accountStatus: 'active',
  });

  let adminToken = '';
  let employeeToken = '';
  let partnerToken = '';

  // TEST 1: Admin Login -> Admin Dashboard -> Without logout, selecting Employee role requires Employee credentials
  await t.test('TEST 1: Admin session cannot authenticate Employee portal; requires Employee credentials', async () => {
    // 1. Admin logs in
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: adminEmail,
        password: defaultPassword,
        role: 'admin',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert.strictEqual(adminLoginRes.status, 200);
    assert.strictEqual(adminLoginData.data.role, 'admin');
    adminToken = adminLoginData.data.token;

    // 2. Admin token must NOT have access to Employee-only endpoints
    const empAccessRes = await fetch(`${baseUrl}/employee/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(empAccessRes.status, 403, 'Admin token must be rejected with 403 on employee endpoints');

    // 3. User must provide actual Employee credentials to get Employee token
    const empLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: employeeEmail,
        password: defaultPassword,
        role: 'employee',
      }),
    });
    const empLoginData = await empLoginRes.json();
    assert.strictEqual(empLoginRes.status, 200);
    assert.strictEqual(empLoginData.data.role, 'employee');
    employeeToken = empLoginData.data.token;

    // 4. Employee token accesses Employee dashboard
    const validEmpRes = await fetch(`${baseUrl}/employee/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.strictEqual(validEmpRes.status, 200, 'Employee token can access employee dashboard');
  });

  // TEST 2: Admin Login -> Without logout, selecting Partner role requires Partner credentials
  await t.test('TEST 2: Admin session cannot authenticate Partner portal; requires Partner credentials', async () => {
    // Admin token cannot access Partner endpoints
    const partnerAccessRes = await fetch(`${baseUrl}/partner/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(partnerAccessRes.status, 403, 'Admin token must be rejected with 403 on partner endpoints');

    // Login with actual Partner credentials
    const partLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: partnerEmail,
        password: defaultPassword,
        role: 'partner',
      }),
    });
    const partLoginData = await partLoginRes.json();
    assert.strictEqual(partLoginRes.status, 200);
    assert.strictEqual(partLoginData.data.role, 'partner');
    partnerToken = partLoginData.data.token;

    // Partner token accesses Partner dashboard
    const validPartRes = await fetch(`${baseUrl}/partner/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    assert.strictEqual(validPartRes.status, 200, 'Partner token can access partner dashboard');
  });

  // TEST 3: Employee Login -> Without logout, selecting Admin role requires Admin credentials
  await t.test('TEST 3: Employee session cannot authenticate Admin portal; requires Admin credentials', async () => {
    const adminAccessRes = await fetch(`${baseUrl}/admin/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.strictEqual(adminAccessRes.status, 403, 'Employee token must be rejected with 403 on admin endpoints');
  });

  // TEST 4: Partner Login -> Without logout, selecting Employee role requires Employee credentials
  await t.test('TEST 4: Partner session cannot authenticate Employee portal; requires Employee credentials', async () => {
    const empAccessRes = await fetch(`${baseUrl}/employee/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    assert.strictEqual(empAccessRes.status, 403, 'Partner token must be rejected with 403 on employee endpoints');
  });

  // TEST 5: Select Admin card -> Do not enter credentials -> Dashboard must NOT open
  await t.test('TEST 5: Selecting role without credentials must not authenticate or open dashboard', async () => {
    // Submitting empty credentials
    const emptyRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: '',
        password: '',
        role: 'admin',
      }),
    });
    assert.strictEqual(emptyRes.status, 400);

    // Unauthenticated access to dashboard
    const noAuthRes = await fetch(`${baseUrl}/admin/dashboard/metrics`);
    assert.strictEqual(noAuthRes.status, 401, 'Unauthenticated request must be rejected with 401');
  });

  // TEST 6: Select Employee card -> Enter wrong credentials -> Login must fail
  await t.test('TEST 6: Invalid credentials must be rejected with 401 and not issue token', async () => {
    const wrongCredsRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: employeeEmail,
        password: 'CompletelyWrongPassword!',
        role: 'employee',
      }),
    });
    const wrongCredsData = await wrongCredsRes.json();
    assert.strictEqual(wrongCredsRes.status, 401);
    assert.ok(wrongCredsData.message.includes('Invalid credentials'));
  });

  // TEST 7: Select Partner card -> Enter valid Employee credentials -> Login must fail because role mismatch
  await t.test('TEST 7: Valid Employee credentials submitted for Partner role must fail with 403 ROLE_MISMATCH', async () => {
    const mismatchRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: employeeEmail,
        password: defaultPassword,
        role: 'partner', // Role Mismatch: user is employee, but selected partner
      }),
    });
    const mismatchData = await mismatchRes.json();
    assert.strictEqual(mismatchRes.status, 403);
    assert.ok(mismatchData.message.includes('Role mismatch'));
  });

  // TEST 8: Successful Admin login -> Session validation (page refresh) preserves Admin session
  await t.test('TEST 8: Valid session token successfully re-authenticates on page refresh via /auth/me', async () => {
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meData = await meRes.json();
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meData.data.role, 'admin');
    assert.strictEqual(meData.data.user.email, adminEmail);

    // Invalid token returns 401
    const invalidMeRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: 'Bearer invalid.fake.token' },
    });
    assert.strictEqual(invalidMeRes.status, 401);
  });

  // TEST 9: Logout -> Browser Back -> Previous dashboard must not become accessible
  await t.test('TEST 9: Logout endpoint executes cleanly and unauthenticated requests cannot access dashboard', async () => {
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
    });
    assert.strictEqual(logoutRes.status, 200);

    // Attempting access without token
    const afterLogoutRes = await fetch(`${baseUrl}/admin/dashboard/metrics`);
    assert.strictEqual(afterLogoutRes.status, 401, 'Protected dashboard must reject unauthenticated requests');
  });

  // TEST 10: Two independent browser sessions -> Different users -> Each maintains its own authenticated identity
  await t.test('TEST 10: Two concurrent sessions maintain distinct identities and independent role authorizations', async () => {
    // Session 1: Admin
    // Session 2: Partner
    const [adminCheck, partnerCheck] = await Promise.all([
      fetch(`${baseUrl}/auth/me`, { headers: { Authorization: `Bearer ${adminToken}` } }),
      fetch(`${baseUrl}/auth/me`, { headers: { Authorization: `Bearer ${partnerToken}` } }),
    ]);

    const adminCheckData = await adminCheck.json();
    const partnerCheckData = await partnerCheck.json();

    assert.strictEqual(adminCheck.status, 200);
    assert.strictEqual(adminCheckData.data.role, 'admin');
    assert.strictEqual(adminCheckData.data.user.email, adminEmail);

    assert.strictEqual(partnerCheck.status, 200);
    assert.strictEqual(partnerCheckData.data.role, 'partner');
    assert.strictEqual(partnerCheckData.data.user.email, partnerEmail);

    // Verify isolation: Admin cannot access partner-only, Partner cannot access admin-only
    const crossCheck1 = await fetch(`${baseUrl}/admin/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    assert.strictEqual(crossCheck1.status, 403);

    const crossCheck2 = await fetch(`${baseUrl}/partner/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(crossCheck2.status, 403);
  });

  // Teardown: Clean up test documents created during this test
  if (adminUser) await User.deleteOne({ _id: adminUser._id });
  if (employeeUser) {
    await Employee.deleteOne({ user: employeeUser._id });
    await User.deleteOne({ _id: employeeUser._id });
  }
  if (partnerUser) {
    await Partner.deleteOne({ user: partnerUser._id });
    await User.deleteOne({ _id: partnerUser._id });
  }

  server.close();
  await mongoose.disconnect();
});
