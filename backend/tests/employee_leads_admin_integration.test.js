import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import { ENV } from '../config/environment.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Lead from '../models/Lead.js';
import LoanCategory from '../models/LoanCategory.js';
import Bank from '../models/Bank.js';

test('REALCRED CRM - Employee Leads Module & Admin Lead Pipeline Integration Test Suite', async (t) => {
  let server;
  let baseUrl = '';

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(ENV.MONGO_URI || ENV.MONGODB_URI || 'mongodb://127.0.0.1:27017/realcred');
  }

  const runId = Date.now().toString();
  const JWT_SECRET = ENV.JWT_SECRET || 'realcred_jwt_development_secret_key_2026';

  // 1. Setup Admin, Employee A, and Employee B
  const adminUser = await User.create({
    name: 'Pipeline Test Admin',
    email: `admin_${runId}@realcred.in`,
    phone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'AdminPassword123!',
    role: 'admin',
    status: 'active',
  });
  const adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  // Employee A
  const empUserA = await User.create({
    name: 'Officer Rajesh Kumar',
    email: `emp_a_${runId}@realcred.in`,
    phone: `92${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'EmpPassword123!',
    role: 'employee',
    status: 'active',
  });
  const empDocA = await Employee.create({
    user: empUserA._id,
    employeeId: `RCE-A-${runId.slice(-4)}`,
    designation: 'Senior Loan Underwriter',
    department: 'Operations',
    accountStatus: 'active',
  });
  const empTokenA = jwt.sign({ id: empUserA._id, role: 'employee' }, JWT_SECRET, { expiresIn: '1h' });

  // Employee B
  const empUserB = await User.create({
    name: 'Officer Priya Singh',
    email: `emp_b_${runId}@realcred.in`,
    phone: `93${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'EmpPassword123!',
    role: 'employee',
    status: 'active',
  });
  const empDocB = await Employee.create({
    user: empUserB._id,
    employeeId: `RCE-B-${runId.slice(-4)}`,
    designation: 'Field Sourcing Manager',
    department: 'Sales',
    accountStatus: 'active',
  });
  const empTokenB = jwt.sign({ id: empUserB._id, role: 'employee' }, JWT_SECRET, { expiresIn: '1h' });

  // Setup Loan Category & Bank
  const categoryDoc = await LoanCategory.create({
    name: `Business Loan ${runId.slice(-4)}`,
    slug: `business-loan-${runId}`,
    description: 'Business loan facility for enterprises and traders',
    interestRateStartingFrom: 10.5,
    isActive: true,
  });

  const bankDoc = await Bank.create({
    name: `ICICI Test ${runId.slice(-4)}`,
    bankCode: `ICICI-${runId.slice(-4)}`,
    status: 'active',
    isDeleted: false,
  });

  let createdLeadA = null;
  let createdLeadB = null;

  await t.test('1. Employee A generates customer lead directly from dashboard', async () => {
    const res = await fetch(`${baseUrl}/employee/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empTokenA}`,
      },
      body: JSON.stringify({
        customerName: 'Aarav Mehta',
        customerPhone: '9876543210',
        customerEmail: 'aarav.mehta@test.com',
        city: 'Mumbai',
        employmentType: 'Salaried',
        loanCategory: categoryDoc._id,
        requiredLoanAmount: 1500000,
        preferredBank: bankDoc._id,
        panNumber: 'ABCDE1234F',
        monthlyIncome: 85000,
        remarks: 'Direct branch walk-in customer file',
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.status, 'success');
    assert.ok(body.data.leadId.startsWith('RCL-E-'), `Expected leadId starting with RCL-E-, got: ${body.data.leadId}`);
    assert.strictEqual(body.data.source, 'employee');
    assert.strictEqual(body.data.creatorEmployeeId, empDocA.employeeId);
    assert.strictEqual(body.data.creatorEmployeeName, empUserA.name);
    assert.strictEqual(String(body.data.assignedTo?._id || body.data.assignedTo), String(empDocA._id));
    createdLeadA = body.data;
  });

  await t.test('2. Employee B generates customer lead with Other employment type', async () => {
    const res = await fetch(`${baseUrl}/employee/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empTokenB}`,
      },
      body: JSON.stringify({
        customerName: 'Kavita Patel',
        customerPhone: '9876543211',
        customerEmail: 'kavita.patel@test.com',
        city: 'Ahmedabad',
        employmentType: 'Other',
        otherEmploymentDetails: 'Fintech Software Consultant',
        loanCategory: categoryDoc._id,
        requiredLoanAmount: 2500000,
        preferredBank: bankDoc._id,
        panNumber: 'PQXYZ5678G',
        monthlyIncome: 130000,
        remarks: 'Client sourced via offline business networking',
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.status, 'success');
    assert.strictEqual(body.data.employmentType, 'Other');
    assert.strictEqual(body.data.otherEmploymentDetails, 'Fintech Software Consultant');
    assert.strictEqual(body.data.creatorEmployeeId, empDocB.employeeId);
    createdLeadB = body.data;
  });

  await t.test('3. Employee lead creation rejects invalid employment types', async () => {
    const res = await fetch(`${baseUrl}/employee/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empTokenA}`,
      },
      body: JSON.stringify({
        customerName: 'Invalid Type Customer',
        customerPhone: '9876543212',
        city: 'Delhi',
        employmentType: 'InvalidFreelanceType',
        loanCategory: categoryDoc._id,
        requiredLoanAmount: 500000,
      }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.status, 'error');
  });

  await t.test('4. Admin GET /api/admin/employee-leads returns only employee-generated leads', async () => {
    const res = await fetch(`${baseUrl}/admin/employee-leads`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.status, 'success');
    assert.ok(Array.isArray(body.data));

    const foundA = body.data.find((l) => l.leadId === createdLeadA.leadId);
    const foundB = body.data.find((l) => l.leadId === createdLeadB.leadId);
    assert.ok(foundA, 'Lead A not found in admin employee leads!');
    assert.ok(foundB, 'Lead B not found in admin employee leads!');

    // Ensure NO non-employee leads exist in employee-leads response
    const nonEmployeeLeads = body.data.filter((l) => l.source !== 'employee');
    assert.strictEqual(nonEmployeeLeads.length, 0, 'Found non-employee leads in /admin/employee-leads');
  });

  await t.test('5. Admin employee leads supports employee filter and search', async () => {
    // Filter by Employee A
    const resFilter = await fetch(`${baseUrl}/admin/employee-leads?employeeId=${empDocA._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const bodyFilter = await resFilter.json();
    assert.strictEqual(resFilter.status, 200);
    const foundA = bodyFilter.data.find((l) => l.leadId === createdLeadA.leadId);
    assert.ok(foundA, 'Expected to find Employee A lead when filtering by Employee A');

    // Search by customer name
    const resSearch = await fetch(`${baseUrl}/admin/employee-leads?search=Aarav`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const bodySearch = await resSearch.json();
    assert.strictEqual(resSearch.status, 200);
    const searchMatch = bodySearch.data.find((l) => l.leadId === createdLeadA.leadId);
    assert.ok(searchMatch, 'Expected search to find Aarav Mehta lead');
  });

  await t.test('6. Main Unified Pipeline (/api/admin/leads) includes employee leads alongside other sources', async () => {
    const res = await fetch(`${baseUrl}/admin/leads`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    const inPipeline = body.data.find((l) => l.leadId === createdLeadA.leadId);
    assert.ok(inPipeline, 'Employee lead should be present in Unified Pipeline');
  });

  await t.test('7. Lead stage update in Admin synchronizes immediately in Employee desk (Single Source of Truth)', async () => {
    // Admin advances Lead A to 'Login'
    const resUpdate = await fetch(`${baseUrl}/admin/leads/${createdLeadA._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Login',
        remarks: 'File accepted into credit underwriting system',
      }),
    });
    assert.strictEqual(resUpdate.status, 200);

    // Employee checks lead status
    const resEmp = await fetch(`${baseUrl}/employee/leads/${createdLeadA._id}`, {
      headers: { Authorization: `Bearer ${empTokenA}` },
    });
    const bodyEmp = await resEmp.json();
    assert.strictEqual(resEmp.status, 200);
    assert.strictEqual(bodyEmp.data.lead.status, 'Login');
    assert.strictEqual(bodyEmp.data.lead.statusHistory[bodyEmp.data.lead.statusHistory.length - 1].status, 'Login');
  });

  // Teardown
  t.after(async () => {
    await Lead.deleteMany({ _id: { $in: [createdLeadA?._id, createdLeadB?._id] } });
    await Employee.deleteMany({ _id: { $in: [empDocA._id, empDocB._id] } });
    await User.deleteMany({ _id: { $in: [adminUser._id, empUserA._id, empUserB._id] } });
    await LoanCategory.deleteOne({ _id: categoryDoc._id });
    await Bank.deleteOne({ _id: bankDoc._id });
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
