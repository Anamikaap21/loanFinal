import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import { ENV } from '../config/environment.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Partner from '../models/Partner.js';
import Lead from '../models/Lead.js';
import Document from '../models/Document.js';
import LoanCategory from '../models/LoanCategory.js';
import Bank from '../models/Bank.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('REALCRED CRM - Employee Document Verification Module Full Integration & Security Test Suite', async (t) => {
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

  // Create temporary physical test files in backend/uploads/documents/
  const docsDir = path.join(__dirname, '../uploads/documents');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  const testAadhaarFile = `test_aadhaar_${runId}.pdf`;
  const testPanFile = `test_pan_${runId}.pdf`;
  const testBankProofFile = `test_bank_${runId}.pdf`;
  const testReplacementFile = `test_replacement_${runId}.pdf`;

  fs.writeFileSync(path.join(docsDir, testAadhaarFile), '%PDF-1.4 Mock Aadhaar Content');
  fs.writeFileSync(path.join(docsDir, testPanFile), '%PDF-1.4 Mock PAN Card Content');
  fs.writeFileSync(path.join(docsDir, testBankProofFile), '%PDF-1.4 Mock Bank Statement Content');
  fs.writeFileSync(path.join(docsDir, testReplacementFile), '%PDF-1.4 Mock Replacement Cheque Content');

  // 1. Setup Admin
  const adminUser = await User.create({
    name: 'Compliance Admin Officer',
    email: `admin_doc_${runId}@realcred.in`,
    phone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'AdminPassword123!',
    role: 'admin',
    status: 'active',
  });
  const adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  // 2. Setup Sourcing / Verification Officer (Employee 1)
  const empUser1 = await User.create({
    name: 'Verification Officer Vikram Malhotra',
    email: `officer_vikram_${runId}@realcred.in`,
    phone: `92${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'EmpPassword123!',
    role: 'employee',
    status: 'active',
  });
  const empDoc1 = await Employee.create({
    user: empUser1._id,
    employeeId: `RCE-DOC-${runId.slice(-4)}`,
    designation: 'Senior KYC Verification Officer',
    department: 'Risk & Underwriting',
    accountStatus: 'active',
  });
  const empToken1 = jwt.sign({ id: empUser1._id, role: 'employee' }, JWT_SECRET, { expiresIn: '1h' });

  // 3. Setup Unassigned Employee (Employee 2 - Unauthorized)
  const empUser2 = await User.create({
    name: 'Unauthorized Officer Neha Sharma',
    email: `officer_neha_${runId}@realcred.in`,
    phone: `93${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'EmpPassword123!',
    role: 'employee',
    status: 'active',
  });
  const empDoc2 = await Employee.create({
    user: empUser2._id,
    employeeId: `RCE-UNAUTH-${runId.slice(-4)}`,
    designation: 'Field Officer',
    department: 'Sales',
    accountStatus: 'active',
  });
  const empToken2 = jwt.sign({ id: empUser2._id, role: 'employee' }, JWT_SECRET, { expiresIn: '1h' });

  // 4. Setup Bank & Category
  const testBank = await Bank.create({
    name: `HDFC Bank DocTest ${runId.slice(-4)}`,
    bankCode: `HDFC_DOC_${runId.slice(-4)}`,
    status: 'active',
  });

  const testCategory = await LoanCategory.create({
    name: `Personal Loan DocTest ${runId.slice(-4)}`,
    slug: `personal-loan-doc-${runId.slice(-4)}`,
    description: 'Personal loan category for KYC verification testing',
    status: 'active',
  });

  // 5. Setup Lead assigned to Employee 1
  const testLead = await Lead.create({
    leadId: `LEAD-DOC-${runId.slice(-5)}`,
    customerName: 'Anil Kumar KYC Test',
    customerPhone: '9876543210',
    customerEmail: 'anil.kumar.kyc@example.com',
    city: 'Mumbai',
    employmentType: 'salaried',
    monthlyIncome: 85000,
    loanCategory: testCategory._id,
    requiredLoanAmount: 750000,
    loanAmount: 750000,
    preferredBank: testBank._id,
    tenureMonths: 36,
    source: 'website',
    stage: 'In Process',
    status: 'In Process',
    documentVerificationStatus: 'pending',
    assignedTo: empDoc1._id,
    createdBy: adminUser._id,
  });

  // 6. Setup 3 Mandatory KYC Documents for Lead
  const docAadhaar = await Document.create({
    lead: testLead._id,
    documentType: 'aadhaar_card',
    title: 'Aadhaar Card (Front & Back)',
    fileName: testAadhaarFile,
    originalName: 'Customer_Aadhaar.pdf',
    filePath: path.join(docsDir, testAadhaarFile),
    fileSize: 10240,
    mimeType: 'application/pdf',
    uploadedBy: null,
    uploadedByRole: 'customer',
    verificationStatus: 'pending',
  });

  const docPan = await Document.create({
    lead: testLead._id,
    documentType: 'pan_card',
    title: 'PAN Card Copy',
    fileName: testPanFile,
    originalName: 'Customer_PAN.pdf',
    filePath: path.join(docsDir, testPanFile),
    fileSize: 12400,
    mimeType: 'application/pdf',
    uploadedBy: null,
    uploadedByRole: 'customer',
    verificationStatus: 'pending',
  });

  const docBankProof = await Document.create({
    lead: testLead._id,
    documentType: 'bank_proof',
    title: 'Bank Statement / Cancelled Cheque',
    fileName: testBankProofFile,
    originalName: 'Salary_Bank_Statement.pdf',
    filePath: path.join(docsDir, testBankProofFile),
    fileSize: 24500,
    mimeType: 'application/pdf',
    uploadedBy: null,
    uploadedByRole: 'customer',
    verificationStatus: 'pending',
  });

  t.after(async () => {
    // Cleanup temporary files
    [testAadhaarFile, testPanFile, testBankProofFile, testReplacementFile].forEach((f) => {
      const p = path.join(docsDir, f);
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (e) {}
      }
    });

    // Cleanup DB records
    await Document.deleteMany({ lead: testLead._id });
    await Lead.deleteOne({ _id: testLead._id });
    await Employee.deleteMany({ _id: { $in: [empDoc1._id, empDoc2._id] } });
    await User.deleteMany({ _id: { $in: [adminUser._id, empUser1._id, empUser2._id] } });
    await Bank.deleteOne({ _id: testBank._id });
    await LoanCategory.deleteOne({ _id: testCategory._id });

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ========================================================
  // SCENARIO 1: Employee Fetches Verification Queue & Metrics
  // ========================================================
  await t.test('1. Employee fetches document verification leads queue with metrics', async () => {
    const res = await fetch(`${baseUrl}/employee/verification-leads`, {
      headers: { Authorization: `Bearer ${empToken1}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(body.metrics, 'Metrics object must be returned');
    assert.ok(body.metrics.pendingCount >= 1, 'At least 1 lead pending verification');
    assert.ok(Array.isArray(body.data), 'Data array must be returned');

    const foundLead = body.data.find((l) => l._id === testLead._id.toString());
    assert.ok(foundLead, 'Assigned lead must be present in verification queue');
    assert.ok(foundLead.documentsSummary, 'Lead must have documentsSummary calculated');
    assert.strictEqual(foundLead.documentsSummary.mandatoryTotal, 3);
    assert.strictEqual(foundLead.documentsSummary.verifiedCount, 0);
    assert.strictEqual(foundLead.documentsSummary.progressPercent, 0);
  });

  // ========================================================
  // SCENARIO 2: Access Control on Lead Documents API
  // ========================================================
  await t.test('2. Access control on lead documents retrieval', async () => {
    // 2a. Assigned employee can retrieve documents
    const resAssigned = await fetch(`${baseUrl}/documents/lead/${testLead._id}`, {
      headers: { Authorization: `Bearer ${empToken1}` },
    });
    assert.strictEqual(resAssigned.status, 200);
    const bodyAssigned = await resAssigned.json();
    assert.strictEqual(bodyAssigned.status, 'success');
    assert.strictEqual(bodyAssigned.count, 3);

    // 2b. Unassigned employee receives 403 Forbidden
    const resUnassigned = await fetch(`${baseUrl}/documents/lead/${testLead._id}`, {
      headers: { Authorization: `Bearer ${empToken2}` },
    });
    assert.strictEqual(resUnassigned.status, 403);

    // 2c. Unauthenticated request receives 401 Unauthorized
    const resUnauth = await fetch(`${baseUrl}/documents/lead/${testLead._id}`);
    assert.strictEqual(resUnauth.status, 401);
  });

  // ========================================================
  // SCENARIO 3: Inline Streaming and Download Security
  // ========================================================
  await t.test('3. Document inline viewing and download with security isolation', async () => {
    // 3a. Assigned officer can view document inline
    const resView = await fetch(`${baseUrl}/documents/${docAadhaar._id}/view`, {
      headers: { Authorization: `Bearer ${empToken1}` },
    });
    assert.strictEqual(resView.status, 200);
    assert.strictEqual(resView.headers.get('content-type'), 'application/pdf');
    assert.ok(
      resView.headers.get('content-disposition')?.includes('inline'),
      'Content-Disposition must be inline'
    );
    const content = await resView.text();
    assert.ok(content.includes('%PDF-1.4 Mock Aadhaar Content'));

    // 3b. Assigned officer can download document
    const resDownload = await fetch(`${baseUrl}/documents/${docAadhaar._id}/download`, {
      headers: { Authorization: `Bearer ${empToken1}` },
    });
    assert.strictEqual(resDownload.status, 200);
    assert.ok(
      resDownload.headers.get('content-disposition')?.includes('attachment'),
      'Content-Disposition must be attachment'
    );

    // 3c. Direct unauthenticated static file access to /uploads/documents/ is blocked (403)
    const directRes = await fetch(`http://127.0.0.1:${server.address().port}/uploads/documents/${testAadhaarFile}`);
    assert.strictEqual(directRes.status, 403, 'Static access to /uploads/documents must return 403 Forbidden');
  });

  // ========================================================
  // SCENARIO 4: Role Separation - Admin cannot verify/reject
  // ========================================================
  await t.test('4. Admin is restricted from verifying or rejecting customer KYC documents', async () => {
    const resAdminVerify = await fetch(`${baseUrl}/documents/${docAadhaar._id}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ remarks: 'Admin attempt to verify' }),
    });
    assert.strictEqual(resAdminVerify.status, 403);
    const bodyAdminVerify = await resAdminVerify.json();
    assert.ok(
      bodyAdminVerify.message?.includes('employee') || bodyAdminVerify.message?.includes('underwriting officers') || bodyAdminVerify.message?.includes('Access denied'),
      'Admin cannot verify employee lead documents'
    );

    const resAdminReject = await fetch(`${baseUrl}/documents/${docAadhaar._id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason: 'Admin attempt to reject' }),
    });
    assert.strictEqual(resAdminReject.status, 403);
  });

  // ========================================================
  // SCENARIO 5: Mandatory Validation on Reject and Request Re-upload
  // ========================================================
  await t.test('5. Reject and Request Re-upload require mandatory reason strings', async () => {
    // Missing rejection reason
    const resMissingReject = await fetch(`${baseUrl}/documents/${docBankProof._id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken1}` },
      body: JSON.stringify({ reason: '' }),
    });
    assert.strictEqual(resMissingReject.status, 400);

    // Missing reupload reason
    const resMissingReupload = await fetch(`${baseUrl}/documents/${docBankProof._id}/request-reupload`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken1}`,
      },
      body: JSON.stringify({ reason: '   ' }),
    });
    assert.strictEqual(resMissingReupload.status, 400);
  });

  // ========================================================
  // SCENARIO 6: Verification Lifecycle & Stage Progression Compliance Gate
  // ========================================================
  await t.test('6. Complete Verification Lifecycle, Rejection, and Stage Gating', async () => {
    // 6a. Officer verifies Aadhaar Card -> 1 of 3 verified -> lead remains 'pending'
    const resVerifyAadhaar = await fetch(`${baseUrl}/documents/${docAadhaar._id}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken1}`,
      },
      body: JSON.stringify({ remarks: 'Aadhaar UID and address verified' }),
    });
    assert.strictEqual(resVerifyAadhaar.status, 200);

    let updatedLead = await Lead.findById(testLead._id);
    assert.strictEqual(updatedLead.documentVerificationStatus, 'pending');

    // 6b. Officer rejects Bank Proof -> lead status immediately changes to 'rejected'
    const resRejectBank = await fetch(`${baseUrl}/documents/${docBankProof._id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken1}`,
      },
      body: JSON.stringify({ reason: 'Bank statement is older than 3 months and signature is missing' }),
    });
    assert.strictEqual(resRejectBank.status, 200);

    updatedLead = await Lead.findById(testLead._id);
    assert.strictEqual(updatedLead.documentVerificationStatus, 'rejected');

    // 6c. Compliance Gate: Officer attempts to advance lead stage to 'Sanction' while KYC is rejected -> 400 Bad Request
    const resAdvanceBlocked = await fetch(`${baseUrl}/employee/leads/${testLead._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken1}`,
      },
      body: JSON.stringify({
        status: 'Sanction',
        remarks: 'Attempting to sanction without verified KYC',
      }),
    });
    assert.strictEqual(resAdvanceBlocked.status, 400);
    const blockedBody = await resAdvanceBlocked.json();
    assert.ok(
      blockedBody.message?.includes('All 3 mandatory KYC documents') || blockedBody.message?.includes('Fully Verified') || blockedBody.message?.includes('verification status'),
      'Stage advancement must be blocked when KYC status is not verified'
    );

    // 6d. Officer requests re-upload for Bank Proof -> status transitions to 'action_required'
    const resRequestReupload = await fetch(`${baseUrl}/documents/${docBankProof._id}/request-reupload`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken1}`,
      },
      body: JSON.stringify({ reason: 'Please upload latest 3 months salary account statement in original PDF format' }),
    });
    assert.strictEqual(resRequestReupload.status, 200);

    updatedLead = await Lead.findById(testLead._id);
    assert.strictEqual(updatedLead.documentVerificationStatus, 'action_required');

    // 6e. Verify PAN Card -> 2 of 3 docs verified
    const resVerifyPan = await fetch(`${baseUrl}/documents/${docPan._id}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken1}`,
      },
      body: JSON.stringify({ remarks: 'PAN format and NSDL identity matched' }),
    });
    assert.strictEqual(resVerifyPan.status, 200);

    // 6f. Re-upload / replacement file uploaded for Bank Proof
    // We update docBankProof with new replacement file and reset status to pending
    await Document.findByIdAndUpdate(docBankProof._id, {
      fileName: testReplacementFile,
      originalName: 'Updated_Salary_Statement.pdf',
      verificationStatus: 'pending',
      reuploadReason: '',
      rejectionReason: '',
    });
    // Trigger verification on the replacement Bank Proof
    const resVerifyBank = await fetch(`${baseUrl}/documents/${docBankProof._id}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken1}`,
      },
      body: JSON.stringify({ remarks: 'Latest 3 months salary account statement verified successfully' }),
    });
    assert.strictEqual(resVerifyBank.status, 200);

    // 6g. All 3 mandatory documents are now verified -> lead status automatically becomes 'verified'
    updatedLead = await Lead.findById(testLead._id);
    assert.strictEqual(
      updatedLead.documentVerificationStatus,
      'verified',
      'Lead documentVerificationStatus must automatically transition to verified when all 3 mandatory docs are approved'
    );

    // 6h. Compliance Gate cleared: Officer advances stage to 'Sanction' -> succeeds with 200 OK
    const resAdvanceAllowed = await fetch(`${baseUrl}/employee/leads/${testLead._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken1}`,
      },
      body: JSON.stringify({
        status: 'Sanction',
        remarks: 'KYC verified and sanction letter issued',
        sanctionedAmount: 700000,
        sanctionReference: `SANCTION-${runId.slice(-4)}`,
        sanctionDate: new Date().toISOString(),
      }),
    });
    assert.strictEqual(resAdvanceAllowed.status, 200);
    const allowedBody = await resAdvanceAllowed.json();
    assert.strictEqual(allowedBody.status, 'success');

    const finalLead = await Lead.findById(testLead._id);
    assert.strictEqual(finalLead.stage, 'Sanction');
  });
});
