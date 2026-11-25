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
import Partner from '../models/Partner.js';
import Document from '../models/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('REALCRED CRM - Mandatory Partner KYC Registration & Admin Approval Workflow Test Suite', async (t) => {
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

  // Create temporary mock KYC files
  const docsDir = path.join(__dirname, '../uploads/documents');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const tempAadhaarPath = path.join(docsDir, `tmp_aadhaar_${runId}.pdf`);
  const tempPanPath = path.join(docsDir, `tmp_pan_${runId}.pdf`);
  const tempBankPath = path.join(docsDir, `tmp_bank_${runId}.pdf`);
  const tempReplacementPath = path.join(docsDir, `tmp_replacement_${runId}.pdf`);

  fs.writeFileSync(tempAadhaarPath, '%PDF-1.4 Partner Aadhaar Mock Content');
  fs.writeFileSync(tempPanPath, '%PDF-1.4 Partner PAN Mock Content');
  fs.writeFileSync(tempBankPath, '%PDF-1.4 Partner Bank Statement Mock Content');
  fs.writeFileSync(tempReplacementPath, '%PDF-1.4 Partner Replacement Cheque Mock Content');

  // 1. Setup Admin Account
  const adminUser = await User.create({
    name: 'Master Partner Approver',
    email: `admin_pkyc_${runId}@realcred.in`,
    phone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'AdminPassword123!',
    role: 'admin',
    status: 'active',
  });
  const adminToken = jwt.sign({ userId: adminUser._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  let registeredPartnerId = null;
  let registeredUserId = null;
  let partnerRegistrationId = null;
  let partnerCode = null;
  const partnerEmail = `partner_${runId}@realcreddsa.in`;
  const partnerPhone = `95${Math.floor(10000000 + Math.random() * 90000000)}`;
  const partnerPassword = 'PartnerSecret123!';

  t.after(async () => {
    // Cleanup temporary files
    [tempAadhaarPath, tempPanPath, tempBankPath, tempReplacementPath].forEach((p) => {
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (e) {}
      }
    });

    // Cleanup created records
    if (registeredPartnerId) {
      await Document.deleteMany({ partner: registeredPartnerId });
      await Partner.deleteOne({ _id: registeredPartnerId });
    }
    if (registeredUserId) {
      await User.deleteOne({ _id: registeredUserId });
    }
    await User.deleteOne({ _id: adminUser._id });

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ========================================================
  // SCENARIO 1: Validation - Registration without mandatory documents is BLOCKED
  // ========================================================
  await t.test('1. Registration submission without mandatory KYC documents is blocked (400)', async () => {
    const form = new FormData();
    form.append('name', 'Sunil Kumar DSA');
    form.append('email', `invalid_${runId}@example.com`);
    form.append('phone', `94${Math.floor(10000000 + Math.random() * 90000000)}`);
    form.append('password', 'Secret123!');
    form.append('city', 'New Delhi');
    form.append('accountHolderName', 'Sunil Kumar');
    form.append('accountNumber', '1234567890');
    form.append('ifscCode', 'HDFC0001234');
    form.append('bankName', 'HDFC Bank');
    // Note: No KYC documents attached!

    const res = await fetch(`${baseUrl}/auth/register-partner`, {
      method: 'POST',
      body: form,
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(
      body.message?.includes('Mandatory KYC documents missing'),
      'Must notify missing KYC documents'
    );
  });

  // ========================================================
  // SCENARIO 2: Validation - Registration without bank details is BLOCKED
  // ========================================================
  await t.test('2. Registration submission without mandatory bank details is blocked (400)', async () => {
    const form = new FormData();
    form.append('name', 'Sunil Kumar DSA');
    form.append('email', `invalid2_${runId}@example.com`);
    form.append('phone', `94${Math.floor(10000000 + Math.random() * 90000000)}`);
    form.append('password', 'Secret123!');
    form.append('city', 'New Delhi');
    // Missing bank details!
    form.append('aadhaarCard', new Blob([fs.readFileSync(tempAadhaarPath)], { type: 'application/pdf' }), 'Aadhaar.pdf');
    form.append('panCard', new Blob([fs.readFileSync(tempPanPath)], { type: 'application/pdf' }), 'PAN.pdf');
    form.append('bankProof', new Blob([fs.readFileSync(tempBankPath)], { type: 'application/pdf' }), 'BankProof.pdf');

    const res = await fetch(`${baseUrl}/auth/register-partner`, {
      method: 'POST',
      body: form,
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(
      body.message?.includes('Mandatory bank details missing'),
      'Must notify missing bank details'
    );
  });

  // ========================================================
  // SCENARIO 3: Successful Registration with KYC and Bank Details
  // ========================================================
  await t.test('3. Complete partner registration succeeds with PENDING and INACTIVE status', async () => {
    const form = new FormData();
    form.append('name', 'Rajesh Sharma Capital');
    form.append('email', partnerEmail);
    form.append('phone', partnerPhone);
    form.append('password', partnerPassword);
    form.append('city', 'Gurugram');
    form.append('state', 'Haryana');
    form.append('businessName', 'Sharma DSA Financial Services');
    form.append('panNumber', 'ABCDE1234F');
    form.append('accountHolderName', 'Rajesh Sharma');
    form.append('accountNumber', '987654321098');
    form.append('ifscCode', 'ICIC0001002');
    form.append('bankName', 'ICICI Bank');
    form.append('aadhaarCard', new Blob([fs.readFileSync(tempAadhaarPath)], { type: 'application/pdf' }), 'Aadhaar.pdf');
    form.append('panCard', new Blob([fs.readFileSync(tempPanPath)], { type: 'application/pdf' }), 'PAN.pdf');
    form.append('bankProof', new Blob([fs.readFileSync(tempBankPath)], { type: 'application/pdf' }), 'BankProof.pdf');

    const res = await fetch(`${baseUrl}/auth/register-partner`, {
      method: 'POST',
      body: form,
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(body.message?.includes('Your registration has been submitted successfully'));
    assert.ok(body.message?.includes('pending Admin verification'));
    assert.ok(body.data.registrationId?.startsWith('PREG-'));
    assert.ok(body.data.partnerCode?.startsWith('RCP-'));
    assert.strictEqual(body.data.registrationStatus, 'PENDING');
    assert.strictEqual(body.data.accountStatus, 'INACTIVE');

    partnerRegistrationId = body.data.registrationId;
    partnerCode = body.data.partnerCode;

    // Verify in MongoDB
    const partnerDoc = await Partner.findOne({ registrationId: partnerRegistrationId });
    assert.ok(partnerDoc, 'Partner record must exist in MongoDB');
    assert.strictEqual(partnerDoc.registrationStatus, 'PENDING');
    assert.strictEqual(partnerDoc.accountStatus, 'inactive');
    assert.strictEqual(partnerDoc.bankDetails.accountHolderName, 'Rajesh Sharma');
    assert.strictEqual(partnerDoc.bankDetails.ifscCode, 'ICIC0001002');

    registeredPartnerId = partnerDoc._id;
    registeredUserId = partnerDoc.user;

    const userDoc = await User.findById(partnerDoc.user);
    assert.strictEqual(userDoc.status, 'inactive', 'User status must start as inactive');

    const createdDocs = await Document.find({ partner: partnerDoc._id });
    assert.strictEqual(createdDocs.length, 3, 'Must create 3 physical document records');
    createdDocs.forEach((d) => {
      assert.strictEqual(d.verificationStatus, 'pending');
    });
  });

  // ========================================================
  // SCENARIO 4: Backend Login Security - PENDING Partner cannot access CRM
  // ========================================================
  await t.test('4. PENDING partner login is blocked and Partner CRM APIs are inaccessible', async () => {
    // 4a. Attempt login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: partnerEmail,
        password: partnerPassword,
        role: 'partner',
      }),
    });

    assert.strictEqual(loginRes.status, 403);
    const loginBody = await loginRes.json();
    assert.ok(
      loginBody.message?.includes('pending Admin verification'),
      'Login must explicitly state pending Admin verification'
    );

    // 4b. Fake token attempt to access normal partner APIs
    const unapprovedToken = jwt.sign(
      { userId: registeredUserId, role: 'partner' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const apiRes = await fetch(`${baseUrl}/partner/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${unapprovedToken}` },
    });
    assert.strictEqual(apiRes.status, 403, 'Normal partner APIs must return 403 Forbidden for pending partners');
    const apiBody = await apiRes.json();
    assert.ok(
      apiBody.message?.includes('Access denied') || apiBody.message?.includes('inactive'),
      'Must block unapproved partner API access'
    );
  });

  // ========================================================
  // SCENARIO 5: Admin Partner Verification Queue
  // ========================================================
  let docAadhaarId = null;
  let docPanId = null;
  let docBankProofId = null;

  await t.test('5. Admin fetches partner verification queue and details', async () => {
    const listRes = await fetch(`${baseUrl}/admin/partner-verifications?status=PENDING`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(listRes.status, 200);
    const listBody = await listRes.json();
    assert.strictEqual(listBody.status, 'success');
    assert.ok(listBody.metrics.pendingCount >= 1);

    const detailRes = await fetch(`${baseUrl}/admin/partner-verifications/${registeredPartnerId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(detailRes.status, 200);
    const detailBody = await detailRes.json();
    assert.strictEqual(detailBody.data.partner.registrationId, partnerRegistrationId);
    assert.strictEqual(detailBody.data.documents.length, 3);

    const docs = detailBody.data.documents;
    docAadhaarId = docs.find((d) => d.documentType === 'aadhaar_card')._id;
    docPanId = docs.find((d) => d.documentType === 'pan_card')._id;
    docBankProofId = docs.find((d) => d.documentType === 'bank_proof')._id;

    assert.ok(docAadhaarId && docPanId && docBankProofId);
  });

  // ========================================================
  // SCENARIO 6: Admin Individually Verifies Aadhaar and PAN
  // ========================================================
  await t.test('6. Admin verifies Aadhaar and PAN documents individually', async () => {
    // 6a. Verify Aadhaar
    const verifyAadhaarRes = await fetch(
      `${baseUrl}/admin/partner-verifications/${registeredPartnerId}/documents/${docAadhaarId}/verify`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ remarks: 'Aadhaar verified against UIDAI' }),
      }
    );
    assert.strictEqual(verifyAadhaarRes.status, 200);

    // 6b. Verify PAN
    const verifyPanRes = await fetch(
      `${baseUrl}/admin/partner-verifications/${registeredPartnerId}/documents/${docPanId}/verify`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ remarks: 'PAN verified against NSDL' }),
      }
    );
    assert.strictEqual(verifyPanRes.status, 200);
  });

  // ========================================================
  // SCENARIO 7: Approval Gate - Cannot approve while Bank Proof is unverified
  // ========================================================
  await t.test('7. Admin cannot approve partner until all 3 mandatory KYC documents are verified (400)', async () => {
    const approveRes = await fetch(
      `${baseUrl}/admin/partner-verifications/${registeredPartnerId}/approve`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert.strictEqual(approveRes.status, 400);
    const body = await approveRes.json();
    assert.ok(body.message?.includes('not yet verified'));
    assert.ok(body.message?.includes('Bank Proof'));
  });

  // ========================================================
  // SCENARIO 8: Admin Requests Re-upload of Bank Proof
  // ========================================================
  await t.test('8. Admin requests re-upload for Bank Proof with mandatory remarks', async () => {
    // Missing remarks validation
    const missingRes = await fetch(
      `${baseUrl}/admin/partner-verifications/${registeredPartnerId}/documents/${docBankProofId}/request-reupload`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ reason: '' }),
      }
    );
    assert.strictEqual(missingRes.status, 400);

    // Valid re-upload request
    const reuploadRes = await fetch(
      `${baseUrl}/admin/partner-verifications/${registeredPartnerId}/documents/${docBankProofId}/request-reupload`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          reason: 'Bank passbook photo is blurry. Please upload a clear cancelled cheque with printed account holder name.',
        }),
      }
    );
    assert.strictEqual(reuploadRes.status, 200);

    const partnerAfterReq = await Partner.findById(registeredPartnerId);
    assert.strictEqual(partnerAfterReq.registrationStatus, 'RESUBMISSION_REQUIRED');
    assert.strictEqual(partnerAfterReq.accountStatus, 'inactive');
  });

  // ========================================================
  // SCENARIO 9: Restricted Resubmission Flow for Partner
  // ========================================================
  let resubmissionToken = null;

  await t.test('9. Partner logs in to restricted resubmission page and replaces document', async () => {
    // 9a. Partner logs in -> allowed to access restricted resubmission desk only
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: partnerEmail,
        password: partnerPassword,
        role: 'partner',
      }),
    });

    assert.strictEqual(loginRes.status, 200);
    const loginBody = await loginRes.json();
    assert.strictEqual(loginBody.data.isRestricted, true);
    assert.strictEqual(loginBody.data.redirectPath, '/partner/resubmit-documents');
    resubmissionToken = loginBody.data.token;

    // 9b. Normal partner CRM APIs must still be blocked (403 PARTNER_NOT_APPROVED)
    const blockedRes = await fetch(`${baseUrl}/partner/leads`, {
      headers: { Authorization: `Bearer ${resubmissionToken}` },
    });
    assert.strictEqual(blockedRes.status, 403);
    const blockedBody = await blockedRes.json();
    assert.strictEqual(blockedBody.code, 'PARTNER_NOT_APPROVED');

    // 9c. Partner checks KYC status on restricted desk
    const statusRes = await fetch(`${baseUrl}/partner/kyc-status`, {
      headers: { Authorization: `Bearer ${resubmissionToken}` },
    });
    assert.strictEqual(statusRes.status, 200);
    const statusBody = await statusRes.json();
    assert.strictEqual(statusBody.data.registrationStatus, 'RESUBMISSION_REQUIRED');
    assert.strictEqual(statusBody.data.documents.length, 3);

    // 9d. Partner resubmits replacement Bank Proof
    const resubmitForm = new FormData();
    resubmitForm.append('documentId', docBankProofId.toString());
    resubmitForm.append('file', new Blob([fs.readFileSync(tempReplacementPath)], { type: 'application/pdf' }), 'Replacement_Cheque.pdf');

    const submitRes = await fetch(`${baseUrl}/partner/resubmit-document`, {
      method: 'POST',
      body: resubmitForm,
      headers: {
        Authorization: `Bearer ${resubmissionToken}`,
      },
    });

    assert.strictEqual(submitRes.status, 200);
    const submitBody = await submitRes.json();
    assert.strictEqual(submitBody.status, 'success');
    assert.strictEqual(submitBody.data.registrationStatus, 'PENDING');

    const updatedPartner = await Partner.findById(registeredPartnerId);
    assert.strictEqual(updatedPartner.registrationStatus, 'PENDING');
  });

  // ========================================================
  // SCENARIO 10: Admin Verifies Replacement Bank Proof
  // ========================================================
  await t.test('10. Admin verifies the replacement Bank Proof', async () => {
    const verifyBankRes = await fetch(
      `${baseUrl}/admin/partner-verifications/${registeredPartnerId}/documents/${docBankProofId}/verify`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ remarks: 'Replacement cancelled cheque verified with bank IFSC' }),
      }
    );
    assert.strictEqual(verifyBankRes.status, 200);
    const body = await verifyBankRes.json();
    assert.strictEqual(body.data.allMandatoryVerified, true);
  });

  // ========================================================
  // SCENARIO 11: Final Partner Approval
  // ========================================================
  await t.test('11. Admin approves partner registration successfully', async () => {
    const approveRes = await fetch(
      `${baseUrl}/admin/partner-verifications/${registeredPartnerId}/approve`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert.strictEqual(approveRes.status, 200);
    const body = await approveRes.json();
    assert.strictEqual(body.status, 'success');
    assert.strictEqual(body.data.registrationStatus, 'APPROVED');
    assert.strictEqual(body.data.accountStatus, 'active');
    assert.strictEqual(body.data.user?.status, 'active');

    // Confirm in DB
    const finalPartner = await Partner.findById(registeredPartnerId);
    assert.strictEqual(finalPartner.registrationStatus, 'APPROVED');
    assert.strictEqual(finalPartner.accountStatus, 'active');

    const finalUser = await User.findById(registeredUserId);
    assert.strictEqual(finalUser.status, 'active');
  });

  // ========================================================
  // SCENARIO 12: Partner Logs In with Full Access to Partner CRM
  // ========================================================
  await t.test('12. Approved partner logs in and accesses normal Partner CRM', async () => {
    // 12a. Login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: partnerEmail,
        password: partnerPassword,
        role: 'partner',
      }),
    });

    assert.strictEqual(loginRes.status, 200);
    const loginBody = await loginRes.json();
    assert.strictEqual(loginBody.data.redirectPath, '/partner/dashboard');
    assert.strictEqual(loginBody.data.user.role, 'partner');
    const partnerActiveToken = loginBody.data.token;

    // 12b. Access normal Partner Dashboard metrics
    const metricsRes = await fetch(`${baseUrl}/partner/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${partnerActiveToken}` },
    });
    assert.strictEqual(metricsRes.status, 200);
    const metricsBody = await metricsRes.json();
    assert.strictEqual(metricsBody.status, 'success');

    // 12c. Access normal Partner My Leads
    const leadsRes = await fetch(`${baseUrl}/partner/leads`, {
      headers: { Authorization: `Bearer ${partnerActiveToken}` },
    });
    assert.strictEqual(leadsRes.status, 200);
  });
});
