import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { ENV } from '../config/environment.js';
import {
  User,
  Employee,
  Partner,
  Bank,
  LoanCategory,
  Lead,
  LEAD_STATUSES,
  LoanApplication,
  Document,
  LeadAssignment,
  CallbackRequest,
  Payout,
  Invoice,
  Notification,
  WebsiteContent,
} from '../models/index.js';

test('RealCred Database & Mongoose Schemas Test Suite', async (t) => {
  // Connect before tests
  await mongoose.connect(ENV.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  // Generate unique run identifiers to ensure complete test idempotency
  const runId = Date.now().toString();
  const testEmailPrefix = `test_rc_${runId}_${Math.floor(Math.random() * 1000)}`;
  const getUniquePhone = () => `98${Math.floor(10000000 + Math.random() * 90000000)}`;

  let adminUser;
  let employeeUser;
  let employeeDoc;
  let partnerUser;
  let partnerDoc;
  let testBank;
  let testCategory;
  let websiteLead;
  let partnerLead;
  let testPayout;

  await t.test('1. Model Compilation & Schema Validation', () => {
    assert.ok(User, 'User model should be defined');
    assert.ok(Employee, 'Employee model should be defined');
    assert.ok(Partner, 'Partner model should be defined');
    assert.ok(Bank, 'Bank model should be defined');
    assert.ok(LoanCategory, 'LoanCategory model should be defined');
    assert.ok(Lead, 'Lead model should be defined');
    assert.ok(LoanApplication, 'LoanApplication model should be defined');
    assert.ok(Document, 'Document model should be defined');
    assert.ok(LeadAssignment, 'LeadAssignment model should be defined');
    assert.ok(CallbackRequest, 'CallbackRequest model should be defined');
    assert.ok(Payout, 'Payout model should be defined');
    assert.ok(Invoice, 'Invoice model should be defined');
    assert.ok(Notification, 'Notification model should be defined');
    assert.ok(WebsiteContent, 'WebsiteContent model should be defined');
  });

  await t.test('2. User Model - bcrypt password hashing and comparison', async () => {
    const rawPassword = 'SecurePassword@2026';
    adminUser = new User({
      name: 'System Admin',
      email: `${testEmailPrefix}_admin@realcred.in`,
      phone: getUniquePhone(),
      password: rawPassword,
      role: 'admin',
      status: 'active',
    });

    await adminUser.save();
    assert.ok(adminUser._id, 'Admin user must have an ObjectId');
    assert.notStrictEqual(adminUser.password, rawPassword, 'Password must be hashed with bcrypt');

    // Fetch with password for comparison
    const userWithPassword = await User.findById(adminUser._id).select('+password');
    const isMatch = await userWithPassword.comparePassword(rawPassword);
    assert.strictEqual(isMatch, true, 'comparePassword must return true for valid password');

    const isWrongMatch = await userWithPassword.comparePassword('WrongPassword');
    assert.strictEqual(isWrongMatch, false, 'comparePassword must return false for invalid password');

    // toJSON should strip password
    const jsonUser = adminUser.toJSON();
    assert.strictEqual(jsonUser.password, undefined, 'toJSON must not expose password');
  });

  await t.test('3. Employee Model - linked to User via ObjectId', async () => {
    employeeUser = await User.create({
      name: 'Rohan Sharma',
      email: `${testEmailPrefix}_rohan@realcred.in`,
      phone: getUniquePhone(),
      password: 'EmployeePassword@123',
      role: 'employee',
      status: 'active',
    });

    employeeDoc = await Employee.create({
      user: employeeUser._id,
      employeeId: `RCEMP-${runId.slice(-4)}-${Math.floor(Math.random() * 100)}`,
      designation: 'Senior Loan Officer',
      department: 'Retail Lending',
      address: {
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
      },
    });

    assert.ok(employeeDoc._id, 'Employee document created');
    assert.strictEqual(employeeDoc.user.toString(), employeeUser._id.toString());
    assert.strictEqual(employeeDoc.accountStatus, 'active');
  });

  await t.test('4. Partner Model - linked to User, auto-activated without admin approval', async () => {
    partnerUser = await User.create({
      name: 'Amit Verma DSA',
      email: `${testEmailPrefix}_amit@dsa.in`,
      phone: getUniquePhone(),
      password: 'PartnerPassword@123',
      role: 'partner',
      status: 'active',
    });

    partnerDoc = await Partner.create({
      user: partnerUser._id,
      partnerCode: `RCP-${runId.slice(-4)}-${Math.floor(Math.random() * 100)}`,
      businessName: 'Verma Financial Services',
      panNumber: `ABCDE${Math.floor(1000 + Math.random() * 9000)}F`,
      accountStatus: 'active', // auto-activated per master prompt
      commissionType: 'percentage',
      defaultCommissionRate: 2.0, // 2%
      bankDetails: {
        accountHolderName: 'Amit Verma',
        accountNumber: '123456789012',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0001234',
      },
    });

    assert.ok(partnerDoc._id, 'Partner document created');
    assert.strictEqual(partnerDoc.accountStatus, 'active', 'Partner must be active automatically');
    assert.strictEqual(partnerDoc.commissionType, 'percentage');
    assert.strictEqual(partnerDoc.defaultCommissionRate, 2.0);
  });

  await t.test('5. Bank & LoanCategory Models - creation and active status query', async () => {
    testBank = await Bank.create({
      name: `Test Bank ${runId}_${Math.floor(Math.random() * 1000)}`,
      bankCode: `TB-${runId.slice(-4)}-${Math.floor(Math.random() * 100)}`,
      status: 'active',
      interestRateRange: { min: 8.5, max: 12.0 },
    });
    assert.ok(testBank._id, 'Bank document created');

    testCategory = await LoanCategory.create({
      name: `Test Loan ${runId}_${Math.floor(Math.random() * 1000)}`,
      slug: `test-loan-${runId}-${Math.floor(Math.random() * 1000)}`,
      description: 'Comprehensive residential finance',
      features: ['Low EMI', 'Zero processing fee'],
      isActive: true,
      displayOrder: 1,
    });
    assert.ok(testCategory._id, 'LoanCategory document created');
  });

  await t.test('6. Website Lead - strictly isolated from partners with no partnerId', async () => {
    websiteLead = await Lead.create({
      leadId: `RCL-W-${runId.slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      source: 'website',
      partnerId: null, // direct website leads must have no partner
      customerName: 'Direct Customer A',
      customerPhone: getUniquePhone(),
      customerEmail: 'customerA@gmail.com',
      city: 'Delhi',
      loanCategory: testCategory._id,
      preferredBank: testBank._id,
      requiredLoanAmount: 5000000,
      status: 'Lead',
    });

    assert.ok(websiteLead._id, 'Website lead created');
    assert.strictEqual(websiteLead.source, 'website');
    assert.strictEqual(websiteLead.partnerId, null, 'Website lead partnerId must be null');
    assert.strictEqual(websiteLead.isEligibleForPayout, false, 'Website lead cannot be eligible for payout');
    assert.strictEqual(websiteLead.payoutStatus, 'not_eligible');
  });

  await t.test('7. Partner Lead - maintains partner ownership and lifecycle tracking', async () => {
    partnerLead = await Lead.create({
      leadId: `RCL-P-${runId.slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      source: 'partner',
      partnerId: partnerDoc._id,
      customerName: 'Partner Customer B',
      customerPhone: getUniquePhone(),
      customerEmail: 'customerB@gmail.com',
      city: 'Noida',
      loanCategory: testCategory._id,
      preferredBank: testBank._id,
      requiredLoanAmount: 800000,
      status: 'Lead',
    });

    assert.ok(partnerLead._id, 'Partner lead created');
    assert.strictEqual(partnerLead.source, 'partner');
    assert.strictEqual(partnerLead.partnerId.toString(), partnerDoc._id.toString());
    assert.strictEqual(partnerLead.status, 'Lead');
    assert.strictEqual(partnerLead.isEligibleForPayout, false);
  });

  await t.test('8. Lead Status Transitions & Automatic Payout Eligibility on Disbursement', async () => {
    // 1. Move to Login
    partnerLead.status = 'Login';
    partnerLead.statusHistory.push({
      status: 'Login',
      previousStatus: 'Lead',
      changedBy: employeeUser._id,
      remarks: 'Application logged with bank',
    });
    await partnerLead.save();

    // 2. Move to In Process
    partnerLead.status = 'In Process';
    partnerLead.statusHistory.push({
      status: 'In Process',
      previousStatus: 'Login',
      changedBy: employeeUser._id,
      remarks: 'RCU verification in progress',
    });
    await partnerLead.save();

    // 3. Move to Sanction
    partnerLead.status = 'Sanction';
    partnerLead.sanctionedAmount = 800000;
    partnerLead.sanctionDate = new Date();
    partnerLead.statusHistory.push({
      status: 'Sanction',
      previousStatus: 'In Process',
      changedBy: employeeUser._id,
      remarks: 'Loan sanctioned by bank',
    });
    await partnerLead.save();

    // 4. Move to Disbursement (Master Prompt Rule: makes partner lead eligible for payout immediately)
    partnerLead.status = 'Disbursement';
    partnerLead.disbursedAmount = 800000;
    partnerLead.disbursementDate = new Date();
    partnerLead.statusHistory.push({
      status: 'Disbursement',
      previousStatus: 'Sanction',
      changedBy: employeeUser._id,
      remarks: 'Amount disbursed into customer account',
    });
    await partnerLead.save();

    const refreshedLead = await Lead.findById(partnerLead._id);
    assert.strictEqual(refreshedLead.status, 'Disbursement');
    assert.strictEqual(refreshedLead.isEligibleForPayout, true, 'Partner lead must be eligible for payout on disbursement');
    assert.strictEqual(refreshedLead.payoutStatus, 'eligible', 'Payout status should transition to eligible');
    assert.strictEqual(refreshedLead.statusHistory.length, 4, '4 status changes must be recorded in history');
  });

  await t.test('9. Payout Creation & Duplicate Prevention', async () => {
    // Calculate commission: 800,000 * 2% = 16,000
    const loanAmount = partnerLead.disbursedAmount;
    const rate = partnerDoc.defaultCommissionRate; // 2%
    const grossAmount = (loanAmount * rate) / 100;
    const tdsRate = 5; // 5% TDS
    const tdsAmount = (grossAmount * tdsRate) / 100;
    const netPayout = grossAmount - tdsAmount;

    testPayout = await Payout.create({
      payoutNumber: `RCPAY-${runId.slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      lead: partnerLead._id,
      partner: partnerDoc._id,
      partnerUser: partnerUser._id,
      disbursedLoanAmount: loanAmount,
      commissionType: 'percentage',
      commissionRate: rate,
      grossCommissionAmount: grossAmount,
      tdsRate,
      tdsAmount,
      netPayoutAmount: netPayout,
      status: 'pending',
    });

    assert.ok(testPayout._id, 'Payout successfully created');
    assert.strictEqual(testPayout.grossCommissionAmount, 16000);
    assert.strictEqual(testPayout.netPayoutAmount, 15200);

    // Duplicate Prevention Test: Trying to create a duplicate payout for the same lead must throw duplicate key error
    await assert.rejects(
      async () => {
        await Payout.create({
          payoutNumber: `RCPAY-DUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          lead: partnerLead._id, // same lead!
          partner: partnerDoc._id,
          partnerUser: partnerUser._id,
          disbursedLoanAmount: loanAmount,
          commissionType: 'percentage',
          commissionRate: rate,
          grossCommissionAmount: grossAmount,
          netPayoutAmount: netPayout,
        });
      },
      /E11000.*duplicate key error/,
      'Duplicate payout creation for the same lead must be rejected by unique index'
    );
  });

  await t.test('10. Invoice Model - linked to Payout and Lead with immutable snapshot', async () => {
    const invoice = await Invoice.create({
      invoiceNumber: `RCINV-${runId.slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      payout: testPayout._id,
      partner: partnerDoc._id,
      lead: partnerLead._id,
      partnerDetails: {
        partnerCode: partnerDoc.partnerCode,
        partnerName: partnerUser.name,
        businessName: partnerDoc.businessName,
        phone: partnerUser.phone,
        email: partnerUser.email,
        panNumber: partnerDoc.panNumber,
      },
      loanReference: {
        leadCode: partnerLead.leadId,
        customerName: partnerLead.customerName,
        loanCategory: 'Home Loan',
        disbursedLoanAmount: testPayout.disbursedLoanAmount,
        disbursementDate: partnerLead.disbursementDate,
      },
      financialSummary: {
        commissionType: testPayout.commissionType,
        commissionRate: testPayout.commissionRate,
        grossCommissionAmount: testPayout.grossCommissionAmount,
        tdsAmount: testPayout.tdsAmount,
        totalPayable: testPayout.netPayoutAmount,
      },
      payoutStatus: 'pending',
    });

    assert.ok(invoice._id, 'Invoice created');
    assert.strictEqual(invoice.financialSummary.totalPayable, 15200);
    assert.strictEqual(invoice.companyDetails.name, 'RealCred Technology Private Limited');
  });

  await t.test('11. Document, LeadAssignment, CallbackRequest, Notification, WebsiteContent', async () => {
    // Document
    const doc = await Document.create({
      lead: partnerLead._id,
      documentType: 'pan_card',
      title: 'Customer PAN Card',
      fileName: 'pan_card_test.pdf',
      filePath: '/uploads/documents/pan_card_test.pdf',
      fileSize: 1048576,
      mimeType: 'application/pdf',
      uploadedBy: employeeUser._id,
      verificationStatus: 'verified',
    });
    assert.ok(doc._id, 'Document created');

    // LeadAssignment
    const assignment = await LeadAssignment.create({
      lead: partnerLead._id,
      employee: employeeDoc._id,
      assignedBy: adminUser._id,
      notes: 'Initial assignment for processing',
    });
    assert.ok(assignment._id, 'LeadAssignment created');

    // CallbackRequest
    const callback = await CallbackRequest.create({
      requestNumber: `RCCB-${runId.slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      customerName: 'Interested Borrower',
      mobileNumber: getUniquePhone(),
      loanType: 'Business Loan',
      preferredContactTime: 'Afternoon (2 PM - 5 PM)',
      message: 'Need 25 Lakhs for machinery expansion',
      status: 'pending',
    });
    assert.ok(callback._id, 'CallbackRequest created');

    // Notification
    const notif = await Notification.create({
      recipient: partnerUser._id,
      title: 'Payout Generated',
      message: 'Your payout of ₹15,200 has been calculated for lead ' + partnerLead.leadId,
      type: 'payout_created',
      relatedLead: partnerLead._id,
      relatedPayout: testPayout._id,
    });
    assert.ok(notif._id, 'Notification created');

    // WebsiteContent
    const heroContent = await WebsiteContent.create({
      sectionKey: `test_hero_${runId}_${Math.floor(Math.random() * 1000)}`,
      title: 'REALCRED TECHNOLOGY PRIVATE LIMITED',
      subtitle: 'Your Loan. One Guided Route.',
      content: { tagline: 'Your Loan. One Guided Route.' },
    });
    assert.ok(heroContent._id, 'WebsiteContent created');
  });

  await t.test('12. Verify Collections and Indexes in MongoDB', async () => {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    // Verify key collections exist
    const expectedCollections = [
      'users',
      'employees',
      'partners',
      'banks',
      'loancategories',
      'leads',
      'payouts',
      'invoices',
      'documents',
      'leadassignments',
      'callbackrequests',
      'notifications',
      'websitecontents',
    ];

    for (const name of expectedCollections) {
      assert.ok(
        collectionNames.includes(name),
        `Collection '${name}' must be created and visible in MongoDB Compass`
      );
    }

    // Verify unique index on payouts.lead
    const payoutIndexes = await db.collection('payouts').indexes();
    const leadIndex = payoutIndexes.find((idx) => idx.key.lead === 1);
    assert.ok(leadIndex, 'Payouts must have index on lead field');
    assert.strictEqual(leadIndex.unique, true, 'Payout index on lead must be unique');

    // Verify index on users.email
    const userIndexes = await db.collection('users').indexes();
    const emailIndex = userIndexes.find((idx) => idx.key.email === 1);
    assert.ok(emailIndex, 'Users collection must have index on email');
    assert.strictEqual(emailIndex.unique, true, 'User email index must be unique');
  });

  // Teardown: Clean up test documents created during this test run
  if (testCategory) {
    await LoanCategory.deleteOne({ _id: testCategory._id });
  }
  if (testBank) {
    await Bank.deleteOne({ _id: testBank._id });
  }
  if (websiteLead) {
    await Lead.deleteOne({ _id: websiteLead._id });
  }
  if (partnerLead) {
    await Lead.deleteOne({ _id: partnerLead._id });
  }

  // Disconnect after tests
  await mongoose.disconnect();
});
