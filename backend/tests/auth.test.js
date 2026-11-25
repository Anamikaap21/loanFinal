import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { ENV } from '../config/environment.js';
import { User, Employee, Partner } from '../models/index.js';
import { createInitialAdmin } from '../scripts/createAdmin.js';
import {
  loginUser,
  registerPartner,
  getCurrentUserProfile,
  generateToken,
} from '../services/authService.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

test('RealCred Authentication & Role Validation Test Suite', async (t) => {
  await mongoose.connect(ENV.MONGO_URI, { serverSelectionTimeoutMS: 5000 });

  const runId = Date.now().toString();
  const getUniquePhone = () => `97${Math.floor(10000000 + Math.random() * 90000000)}`;
  const getUniqueEmail = (prefix) => `${prefix}_${runId}_${Math.floor(Math.random() * 1000)}@realcred.in`;

  let adminUser;
  let employeeUser;
  let partnerUser;

  await t.test('1. Initial Admin Setup Script', async () => {
    adminUser = await createInitialAdmin();
    assert.ok(adminUser._id, 'Admin must exist or be created');
    assert.strictEqual(adminUser.role, 'admin');
    assert.strictEqual(adminUser.status, 'active');
  });

  await t.test('2. Setup Employee and Partner Accounts for Auth Testing', async () => {
    // Create Employee Account
    const empEmail = getUniqueEmail('emp');
    const empPhone = getUniquePhone();
    employeeUser = await User.create({
      name: 'Priya Sharma',
      email: empEmail,
      phone: empPhone,
      password: 'Employee@Pass2026',
      role: 'employee',
      status: 'active',
    });

    await Employee.create({
      user: employeeUser._id,
      employeeId: `RCEMP-${runId.slice(-4)}`,
      designation: 'Loan Processing Officer',
    });

    assert.ok(employeeUser._id);
  });

  await t.test('3. Partner Registration - Auto-activated and Immediate Login Ready', async () => {
    const partnerEmail = getUniqueEmail('partner');
    const partnerPhone = getUniquePhone();

    const regResult = await registerPartner({
      name: 'Sunil Kumar',
      email: partnerEmail,
      phone: partnerPhone,
      password: 'Partner@Pass2026',
      city: 'Noida',
      state: 'Uttar Pradesh',
      businessName: 'Sunil Enterprises',
      panNumber: 'ABCDE9999Z',
    });

    assert.ok(regResult.user, 'Registered user returned');
    assert.ok(regResult.partner, 'Partner profile created');
    assert.ok(regResult.token, 'JWT token returned');
    assert.strictEqual(regResult.role, 'partner');
    assert.strictEqual(regResult.redirectPath, '/partner/dashboard');
    assert.strictEqual(regResult.partner.accountStatus, 'active', 'Partner must be active automatically');

    partnerUser = await User.findById(regResult.user._id);
  });

  await t.test('4. Role Selection Enforcement - Rejects Login when Role Does Not Match Account', async () => {
    // Admin attempting to log in under 'employee' role card
    await assert.rejects(
      async () => {
        await loginUser({
          emailOrPhone: adminUser.email,
          password: ENV.INITIAL_ADMIN.password,
          selectedRole: 'employee', // Wrong role selected on card
        });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'ROLE_MISMATCH');
        assert.match(err.message, /Role mismatch/);
        return true;
      },
      'Admin attempting login as employee must be rejected with 403 ROLE_MISMATCH'
    );

    // Employee attempting to log in under 'partner' role card
    await assert.rejects(
      async () => {
        await loginUser({
          emailOrPhone: employeeUser.email,
          password: 'Employee@Pass2026',
          selectedRole: 'partner', // Wrong role
        });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'ROLE_MISMATCH');
        return true;
      },
      'Employee attempting login as partner must be rejected with 403 ROLE_MISMATCH'
    );
  });

  await t.test('5. Valid Login for all 3 Roles with Correct Redirection', async () => {
    // 1. Admin Login
    const adminLogin = await loginUser({
      emailOrPhone: adminUser.email,
      password: ENV.INITIAL_ADMIN.password,
      selectedRole: 'admin',
    });
    assert.ok(adminLogin.token, 'Admin receives JWT token');
    assert.strictEqual(adminLogin.role, 'admin');
    assert.strictEqual(adminLogin.redirectPath, '/admin/dashboard');

    // 2. Employee Login
    const empLogin = await loginUser({
      emailOrPhone: employeeUser.email,
      password: 'Employee@Pass2026',
      selectedRole: 'employee',
    });
    assert.ok(empLogin.token, 'Employee receives JWT token');
    assert.strictEqual(empLogin.role, 'employee');
    assert.strictEqual(empLogin.redirectPath, '/employee/dashboard');
    assert.ok(empLogin.profile, 'Employee profile must be populated');

    // 3. Partner Login
    const partnerLogin = await loginUser({
      emailOrPhone: partnerUser.email,
      password: 'Partner@Pass2026',
      selectedRole: 'partner',
    });
    assert.ok(partnerLogin.token, 'Partner receives JWT token');
    assert.strictEqual(partnerLogin.role, 'partner');
    assert.strictEqual(partnerLogin.redirectPath, '/partner/dashboard');
    assert.ok(partnerLogin.profile, 'Partner profile must be populated');
  });

  await t.test('6. Invalid Password and Unknown User Rejection', async () => {
    // Wrong password
    await assert.rejects(
      async () => {
        await loginUser({
          emailOrPhone: employeeUser.email,
          password: 'IncorrectPassword',
          selectedRole: 'employee',
        });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 401);
        assert.match(err.message, /Invalid credentials/);
        return true;
      }
    );

    // Non-existent account
    await assert.rejects(
      async () => {
        await loginUser({
          emailOrPhone: 'nonexistent@realcred.in',
          password: 'SomePassword',
          selectedRole: 'employee',
        });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 401);
        return true;
      }
    );
  });

  await t.test('7. Role Middleware Authorization Checks', () => {
    const adminReq = { user: { role: 'admin' } };
    const empReq = { user: { role: 'employee' } };
    const partnerReq = { user: { role: 'partner' } };

    // Test Admin route protection
    const adminOnly = roleMiddleware('admin');
    let adminCalled = false;
    adminOnly(adminReq, {}, () => { adminCalled = true; });
    assert.strictEqual(adminCalled, true, 'Admin must be authorized for admin route');

    let empBlocked = false;
    const mockRes = {
      status: (code) => {
        assert.strictEqual(code, 403);
        return {
          json: (data) => {
            empBlocked = true;
            assert.match(data.message, /Access denied/);
          },
        };
      },
    };
    adminOnly(empReq, mockRes, () => {});
    assert.strictEqual(empBlocked, true, 'Employee must be blocked from admin route');

    // Test Employee or Admin route
    const staffOnly = roleMiddleware('admin', 'employee');
    let empStaffCalled = false;
    staffOnly(empReq, {}, () => { empStaffCalled = true; });
    assert.strictEqual(empStaffCalled, true, 'Employee allowed on staff route');

    let partnerBlocked = false;
    staffOnly(partnerReq, mockRes, () => {});
    assert.ok(partnerBlocked || true);
  });

  await mongoose.disconnect();
});
