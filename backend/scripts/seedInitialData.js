import mongoose from 'mongoose';
import { ENV } from '../config/environment.js';
import {
  LoanCategory,
  Bank,
  WebsiteContent,
  User,
} from '../models/index.js';

export const initialLoanCategories = [
  {
    name: 'Home Loan',
    slug: 'home-loan',
    tagline: 'Your dream home made accessible with guided route and competitive interest rates.',
    description: 'Finance the purchase, construction, or renovation of your residential property with flexible tenure and low EMIs.',
    features: [
      'Competitive interest rates from top lending banks',
      'Flexible repayment tenure up to 30 years',
      'Minimal documentation and transparent processing',
      'Guidance from application login to bank disbursement',
      'No hidden charges with dedicated single point of contact',
    ],
    eligibility: [
      'Indian Resident or NRI',
      'Salaried individuals with minimum 2 years work experience',
      'Self-employed professionals/business owners with minimum 3 years business vintage',
      'CIBIL score of 650 or above preferred',
      'Age between 21 and 65 years at loan maturity',
    ],
    requiredDocuments: [
      'Identity Proof (Aadhaar Card, PAN Card)',
      'Address Proof (Utility Bill, Passport, Voter ID)',
      'Income Proof: Last 3 months salary slips or 3 years ITR with computation',
      'Last 6 months bank statement showing salary/business turnover',
      'Property documents (Allotment letter, Sale deed, Title deeds)',
    ],
    minAmount: 500000,
    maxAmount: 100000000,
    minTenureMonths: 12,
    maxTenureMonths: 360,
    iconName: 'Home',
    isActive: true,
    displayOrder: 1,
  },
  {
    name: 'Loan Against Property',
    slug: 'loan-against-property',
    tagline: 'Unlock the real commercial potential of your residential or commercial property.',
    description: 'Leverage your existing property to meet business expansion, debt consolidation, or high-value financial requirements.',
    features: [
      'High sanction limits up to 70% of property market value',
      'Long repayment tenure up to 15 to 20 years',
      'Available for both residential and commercial properties',
      'Lower interest rates compared to unsecured business loans',
      'Complete bank coordination handled by RealCred',
    ],
    eligibility: [
      'Salaried and Self-employed individuals, Partnership firms, Pvt Ltd companies',
      'Clear, marketable and unencumbered property title',
      'Minimum net monthly income or audited annual business profits',
      'Applicant age between 25 and 70 years',
    ],
    requiredDocuments: [
      'PAN Card and Aadhaar Card of applicants/co-applicants',
      'Complete property chain documents and sanctioned building plan',
      'Last 3 years audited financials with balance sheet & CA report',
      'Last 12 months primary bank statements',
      'Business profile and GST returns (for business applicants)',
    ],
    minAmount: 1000000,
    maxAmount: 150000000,
    minTenureMonths: 24,
    maxTenureMonths: 240,
    iconName: 'Building',
    isActive: true,
    displayOrder: 2,
  },
  {
    name: 'Business Loan',
    slug: 'business-loan',
    tagline: 'Fast capital injection for working capital, infrastructure, and business growth.',
    description: 'Unsecured and secured funding solutions tailored for MSMEs, traders, manufacturers, and corporate service providers.',
    features: [
      'Collateral-free funding options available',
      'Speedy turnaround time with direct bank login',
      'Tenure ranging from 12 months up to 60 months',
      'Customized repayment schedules aligned with cash flows',
      'Multi-bank eligibility matching by RealCred experts',
    ],
    eligibility: [
      'Business vintage of minimum 2 to 3 years',
      'Annual GST turnover of ₹40 Lakhs or above',
      'Positive net worth and profitable track record',
      'Good repayment history and healthy banking turnover',
    ],
    requiredDocuments: [
      'PAN Card (Entity & Promoters) and Aadhaar of Promoters',
      'Certificate of Incorporation / Partnership Deed / Udyam Registration',
      'Last 2 to 3 years audited Balance Sheet & Profit & Loss statements',
      'Last 12 months GST returns (GSTR-3B & GSTR-1)',
      'Last 12 months operative Current Account statements',
    ],
    minAmount: 300000,
    maxAmount: 50000000,
    minTenureMonths: 12,
    maxTenureMonths: 60,
    iconName: 'Briefcase',
    isActive: true,
    displayOrder: 3,
  },
  {
    name: 'Personal Loan',
    slug: 'personal-loan',
    tagline: 'Immediate, multipurpose financial support with transparent documentation.',
    description: 'Meet urgent medical expenses, wedding costs, education, or personal debt consolidation with swift approval.',
    features: [
      '100% paperless & coordinated digital verification',
      'No collateral or security required',
      'Disbursement within 24 to 72 hours of approval',
      'Flexible tenures from 1 to 5 years',
      'Transparent rate comparison across leading banks',
    ],
    eligibility: [
      'Salaried employees of private, MNC, or public sector companies',
      'Minimum monthly take-home salary of ₹25,000',
      'CIBIL score of 700+ preferred',
      'Age between 21 and 58 years',
    ],
    requiredDocuments: [
      'PAN Card and Aadhaar Card',
      'Last 3 months salary slips with company seal/digital signatures',
      'Last 6 months salary credit bank statement',
      'Current employment ID and address proof',
    ],
    minAmount: 50000,
    maxAmount: 4000000,
    minTenureMonths: 12,
    maxTenureMonths: 60,
    iconName: 'UserCheck',
    isActive: true,
    displayOrder: 4,
  },
  {
    name: 'OD – Overdraft Facility',
    slug: 'od-overdraft-facility',
    tagline: 'Flexible credit line for managing day-to-day cash flows and unexpected expenses.',
    description: 'Pay interest only on the exact funds utilized and enjoy continuous liquidity for your personal or enterprise needs.',
    features: [
      'Interest payable only on utilized funds, not the entire limit',
      'Instant liquidity anytime through linked current account',
      'Annual renewable facility based on clean account turnover',
      'Options against residential/commercial property or liquid assets',
      'Complete limit structuring handled by RealCred experts',
    ],
    eligibility: [
      'Established businesses, proprietorships, partnerships, or self-employed professionals',
      'Healthy banking transaction volume in current account',
      'Satisfactory credit rating and clean repayment record',
    ],
    requiredDocuments: [
      'KYC documents of business entity and authorized signatories',
      'Collateral property documents (for Secured Overdraft / Drop-line OD)',
      'Last 2 years audited financial statements with tax audit report',
      'Last 12 months operative current account bank statements',
      'GST returns and stock statement where applicable',
    ],
    minAmount: 500000,
    maxAmount: 100000000,
    minTenureMonths: 12,
    maxTenureMonths: 120,
    iconName: 'Landmark',
    isActive: true,
    displayOrder: 5,
  },
];

export const initialBanks = [
  {
    name: 'State Bank of India',
    bankCode: 'SBI',
    description: 'Indias largest public sector bank offering competitive home loans and business credit lines.',
    contactDetails: {
      contactPerson: 'SBI RealCred Desk',
      email: 'sbi-desk@realcred.in',
      phone: '1800112211',
    },
    status: 'active',
    interestRateRange: { min: 8.5, max: 12.5 },
    maxTenureMonths: 360,
    processingFeeDetails: '0.35% + GST (Max ₹10,000)',
  },
  {
    name: 'ICICI Bank',
    bankCode: 'ICICI',
    description: 'Leading private sector bank with fast digital sanction and extensive loan product bouquet.',
    contactDetails: {
      contactPerson: 'ICICI RealCred Channel Manager',
      email: 'icici-desk@realcred.in',
      phone: '18001080',
    },
    status: 'active',
    interestRateRange: { min: 8.75, max: 14.5 },
    maxTenureMonths: 360,
    processingFeeDetails: '0.50% - 1.0% + GST',
  },
  {
    name: 'HDFC Bank',
    bankCode: 'HDFC',
    description: 'Premier housing finance and retail banking institution with high approval rates.',
    contactDetails: {
      contactPerson: 'HDFC RealCred Channel Team',
      email: 'hdfc-desk@realcred.in',
      phone: '18002664332',
    },
    status: 'active',
    interestRateRange: { min: 8.7, max: 15.0 },
    maxTenureMonths: 360,
    processingFeeDetails: 'Up to 0.5% + GST',
  },
  {
    name: 'Axis Bank',
    bankCode: 'AXIS',
    description: 'Comprehensive loan options for salaried and business clients with quick approvals.',
    contactDetails: {
      contactPerson: 'Axis Bank Relationship Desk',
      email: 'axis-desk@realcred.in',
      phone: '18604195555',
    },
    status: 'active',
    interestRateRange: { min: 8.9, max: 15.5 },
    maxTenureMonths: 360,
    processingFeeDetails: '1% + GST',
  },
  {
    name: 'PNB Housing Finance',
    bankCode: 'PNB_HOUSING',
    description: 'Reputed housing finance company specializing in LAP, Home Loans, and Construction Finance.',
    contactDetails: {
      contactPerson: 'PNB Housing Desk',
      email: 'pnbhfl-desk@realcred.in',
      phone: '18001208800',
    },
    status: 'active',
    interestRateRange: { min: 8.85, max: 13.5 },
    maxTenureMonths: 360,
    processingFeeDetails: '0.50% + GST',
  },
];

export const initialWebsiteContents = [
  {
    sectionKey: 'hero',
    title: 'REALCRED TECHNOLOGY PRIVATE LIMITED',
    subtitle: 'Your Loan. One Guided Route.',
    content: {
      heading: 'REALCRED TECHNOLOGY PRIVATE LIMITED',
      tagline: 'Your Loan. One Guided Route.',
      subheading: 'A Single Point of Contact for Your Loan Requirements.',
      ctas: [
        { label: 'Apply for Loan', link: '/apply-loan', primary: true },
        { label: 'Request a Callback', link: '/request-callback', secondary: true },
        { label: 'Become a Partner', link: '/partner-registration', outline: true },
      ],
    },
    isActive: true,
  },
  {
    sectionKey: 'about',
    title: 'About RealCred Technology Private Limited',
    subtitle: 'A Single Point of Contact for Your Loan Requirements.',
    content: {
      bodyParagraphs: [
        'RealCred Technology Private Limited is a corporate loan distribution and financial services company connecting customers with suitable banking and NBFC solutions.',
        'We understand that approaching multiple banks, managing documentation and coordinating loan applications can be complicated. RealCred simplifies this experience by providing customers with one dedicated point of contact.',
        'From understanding financial requirements and identifying suitable lending institutions to application processing, documentation and bank coordination, our team assists customers throughout their loan journey, up to disbursement.',
        'We also work towards building a stronger business ecosystem for our DSA and Channel Partners through dedicated support, transparent processes and faster payout commitments.',
        'Our focus is to make loan facilitation more organised for customers and business relationships more dependable for partners.',
      ],
    },
    isActive: true,
  },
  {
    sectionKey: 'vision_mission',
    title: 'Our Vision & Mission',
    subtitle: 'A Better Way to Connect with Credit.',
    content: {
      visionTitle: 'OUR VISION',
      visionHeading: 'A Better Way to Connect with Credit.',
      visionBody:
        'To create a simpler and more accessible loan distribution experience where customers can explore suitable banking solutions through one trusted relationship, without having to independently navigate multiple institutions. We aspire to build a business ecosystem where customer convenience and partner growth progress together.',
      missionTitle: 'OUR MISSION',
      missionHeading: 'We Coordinate. We Support. We Stay Connected.',
      missionBody:
        'Our mission is to simplify the loan application journey by understanding customer requirements, identifying suitable Banks and NBFCs and coordinating the process from application login to disbursement. For our DSA and Channel Partners, our commitment is to provide reliable business support, transparent payout processes and faster payout releases through clear operational commitments. We aim to make every loan application easier to manage and every business relationship stronger.',
    },
    isActive: true,
  },
  {
    sectionKey: 'commitment',
    title: 'Our Commitment',
    subtitle: 'Dedicated to Customers and Channel Partners alike.',
    content: {
      customerCommitment:
        'One dedicated relationship for loan guidance, documentation and bank coordination throughout the application journey.',
      partnerCommitment:
        'Dependable business support, transparent communication and timely payout commitments.',
      coreValues: [
        'Customer Convenience',
        'Partner Commitment',
        'Transparency',
        'Operational Speed',
        'Responsible Business Practices',
        'Long-Term Relationships',
      ],
    },
    isActive: true,
  },
  {
    sectionKey: 'contact_info',
    title: 'Contact Us',
    subtitle: 'Get in Touch with RealCred Corporate Office',
    content: {
      companyName: 'REALCRED TECHNOLOGY PRIVATE LIMITED',
      phones: ['7048976349', '8527710939'],
      emails: ['info@realcred.in', 'customercare@realcred.in'],
      address:
        'D-9, Ground Floor, Workshala, Vyapar Marg, Block D, Noida Sector 3, Noida, Uttar Pradesh 201301, India.',
      coordinates: {
        latitude: 28.583136,
        longitude: 77.318749,
      },
      mapUrl: 'https://maps.google.com/?q=28.583136,77.318749',
    },
    isActive: true,
  },
];

export const seedInitialData = async () => {
  try {
    // 1. Seed Loan Categories
    for (const cat of initialLoanCategories) {
      await LoanCategory.findOneAndUpdate({ slug: cat.slug }, cat, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    }
    console.log(`[Seed] 5 Official Loan Categories verified and synchronized.`);

    // 2. Seed Banks
    for (const bank of initialBanks) {
      await Bank.findOneAndUpdate({ bankCode: bank.bankCode }, bank, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    }
    console.log(`[Seed] 5 Primary Banking Partners verified and synchronized.`);

    // 3. Seed Website Content
    for (const section of initialWebsiteContents) {
      await WebsiteContent.findOneAndUpdate({ sectionKey: section.sectionKey }, section, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    }
    console.log(`[Seed] Official RealCred Website Content verified and synchronized.`);

    return { success: true };
  } catch (error) {
    console.error(`[Seed Error] Failed to seed initial data:`, error.message);
    throw error;
  }
};

// If run directly
if (process.argv[1]?.endsWith('seedInitialData.js')) {
  mongoose
    .connect(ENV.MONGO_URI)
    .then(async () => {
      console.log('Connected to MongoDB. Seeding initial data...');
      await seedInitialData();
      console.log('Seeding complete.');
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding script failed:', err);
      process.exit(1);
    });
}
