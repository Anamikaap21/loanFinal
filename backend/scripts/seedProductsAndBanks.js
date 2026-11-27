import mongoose from 'mongoose';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Bank from '../models/Bank.js';
import LoanCategory from '../models/LoanCategory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore fallback error
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set in environment!');
  process.exit(1);
}

// 37 Banking Partners Data (10 PSU, 10 Private, 17 NBFCs)
const BANK_PARTNERS = [
  // --- 10 PSU Banks ---
  {
    name: 'BANK OF BARODA',
    bankCode: 'BOB',
    category: 'PSU Banks',
    roi: '7.25% - 8.00%',
    maxLTV: '80%',
    maxTenure: '30 Years',
    processingTime: '10-15 days',
    interestRateRange: { min: 7.25, max: 8.00 },
    maxTenureMonths: 360,
    processingFeeDetails: '0.25% - 0.50% + GST',
    description: 'Premier public sector bank offering competitive home, personal, and mortgage loan rates with extensive pan-India branch coverage.',
    status: 'active',
  },
  {
    name: 'BANK OF INDIA',
    bankCode: 'BOI',
    category: 'PSU Banks',
    roi: '7.10% - 7.95%',
    maxLTV: '80%',
    maxTenure: '30 Years',
    processingTime: '10-15 days',
    interestRateRange: { min: 7.10, max: 7.95 },
    maxTenureMonths: 360,
    processingFeeDetails: '0.25% + GST',
    description: 'Established public sector lender with attractive interest rates for retail homebuyers and commercial borrowers.',
    status: 'active',
  },
  {
    name: 'BANK OF MAHARASHTRA',
    bankCode: 'BOM',
    category: 'PSU Banks',
    roi: '7.10% - 7.95%',
    maxLTV: '80%',
    maxTenure: '30 Years',
    processingTime: '10-15 days',
    interestRateRange: { min: 7.10, max: 7.95 },
    maxTenureMonths: 360,
    processingFeeDetails: 'Zero processing fee offers available',
    description: 'Leading nationalized bank offering quick turnarounds and lowest introductory home and property finance rates.',
    status: 'active',
  },
  {
    name: 'CANARA BANK',
    bankCode: 'CANARA',
    category: 'PSU Banks',
    roi: '7.25% - 8.00%',
    maxLTV: '80%',
    maxTenure: '30 Years',
    processingTime: '10-15 days',
    interestRateRange: { min: 7.25, max: 8.00 },
    maxTenureMonths: 360,
    processingFeeDetails: '0.50% + GST',
    description: 'Major public sector bank providing customer-friendly housing and corporate credit solutions.',
    status: 'active',
  },
  {
    name: 'IDBI Bank',
    bankCode: 'IDBI',
    category: 'PSU Banks',
    roi: '7.45% - 9.00%',
    maxLTV: '90%',
    maxTenure: '30 Years',
    processingTime: '07-10 days',
    interestRateRange: { min: 7.45, max: 9.00 },
    maxTenureMonths: 360,
    processingFeeDetails: 'Up to 0.50% + GST',
    description: 'Full-service commercial bank delivering swift credit appraisals and high loan-to-value eligibility.',
    status: 'active',
  },
  {
    name: 'INDIAN BANK',
    bankCode: 'INDIANBANK',
    category: 'PSU Banks',
    roi: '7.25% - 8.00%',
    maxLTV: '90%',
    maxTenure: '25 Years',
    processingTime: '10-15 days',
    interestRateRange: { min: 7.25, max: 8.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '0.25% - 0.40% + GST',
    description: 'Trusted PSU bank delivering robust credit solutions, high LTV options, and transparent processing.',
    status: 'active',
  },
  {
    name: 'PNB',
    bankCode: 'PNB',
    category: 'PSU Banks',
    roi: '7.35% - 8.50%',
    maxLTV: '80%',
    maxTenure: '25 Years',
    processingTime: '10-15 days',
    interestRateRange: { min: 7.35, max: 8.50 },
    maxTenureMonths: 300,
    processingFeeDetails: '0.35% + GST',
    description: 'Punjab National Bank - India’s premier public lender providing comprehensive retail and commercial credit.',
    status: 'active',
  },
  {
    name: 'UNION BANK',
    bankCode: 'UNIONBANK',
    category: 'PSU Banks',
    roi: '7.45% - 9.00%',
    maxLTV: '90%',
    maxTenure: '25 Years',
    processingTime: '10-15 days',
    interestRateRange: { min: 7.45, max: 9.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '0.50% + GST',
    description: 'Union Bank of India offers high LTV, attractive interest rates, and flexible tenure for home and enterprise loans.',
    status: 'active',
  },
  {
    name: 'UCO BANK',
    bankCode: 'UCO',
    category: 'PSU Banks',
    roi: '7.25% - 8.00%',
    maxLTV: '90%',
    maxTenure: '25 Years',
    processingTime: '10-15 days',
    interestRateRange: { min: 7.25, max: 8.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '0.50% + GST',
    description: 'Reliable PSU banking partner providing competitive interest structures and personalized credit processing.',
    status: 'active',
  },
  {
    name: 'SBI BANK',
    bankCode: 'SBI',
    category: 'PSU Banks',
    roi: '7.35% - 8.10%',
    maxLTV: '90%',
    maxTenure: '35 Years',
    processingTime: '10-15 days',
    interestRateRange: { min: 7.35, max: 8.10 },
    maxTenureMonths: 420,
    processingFeeDetails: '0.35% + GST (Min ₹2,000, Max ₹10,000)',
    description: 'State Bank of India - largest financial institution in India with industry-leading tenure up to 35 years.',
    status: 'active',
  },

  // --- 10 Private Banks ---
  {
    name: 'Axis Bank',
    bankCode: 'AXIS',
    category: 'Private Banks',
    roi: '7.95% - 10.00%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-20 Days',
    interestRateRange: { min: 7.95, max: 10.00 },
    maxTenureMonths: 300,
    processingFeeDetails: 'Up to 1% + GST',
    description: 'Leading private sector bank offering tailored credit products and modern digital loan management.',
    status: 'active',
  },
  {
    name: 'DCB Bank',
    bankCode: 'DCB',
    category: 'Private Banks',
    roi: '9.15% - 14%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-20 Days',
    interestRateRange: { min: 9.15, max: 14.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1% - 2% + GST',
    description: 'New-generation private bank specializing in small business, retail lending, and self-employed financing.',
    status: 'active',
  },
  {
    name: 'FEDERAL BANK',
    bankCode: 'FEDERAL',
    category: 'Private Banks',
    roi: '7.95% - 10.00%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-20 Days',
    interestRateRange: { min: 7.95, max: 10.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '0.50% - 1% + GST',
    description: 'Pioneer in digital banking, offering transparent home and business loan processing across India.',
    status: 'active',
  },
  {
    name: 'HDFC BANK',
    bankCode: 'HDFC',
    category: 'Private Banks',
    roi: '7.50% - 10.00%',
    maxLTV: '80%',
    maxTenure: '30 Years',
    processingTime: '15-20 Days',
    interestRateRange: { min: 7.50, max: 10.00 },
    maxTenureMonths: 360,
    processingFeeDetails: 'Up to 0.50% + GST',
    description: 'India’s largest private banking conglomerate with premier retail mortgage and working capital solutions.',
    status: 'active',
  },
  {
    name: 'HSBC',
    bankCode: 'HSBC',
    category: 'Private Banks',
    roi: '7.95% - 10.00%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-20 Days',
    interestRateRange: { min: 7.95, max: 10.00 },
    maxTenureMonths: 300,
    processingFeeDetails: 'Up to 1% + GST',
    description: 'Global banking major delivering wealth-backed credit, high-ticket home financing, and premium service.',
    status: 'active',
  },
  {
    name: 'ICICI BANK',
    bankCode: 'ICICI',
    category: 'Private Banks',
    roi: '7.80% - 10.00%',
    maxLTV: '80%',
    maxTenure: '30 Years',
    processingTime: '15-20 Days',
    interestRateRange: { min: 7.80, max: 10.00 },
    maxTenureMonths: 360,
    processingFeeDetails: '0.50% - 1% + GST',
    description: 'Top-tier private bank providing instant sanction workflows and competitive interest rate structures.',
    status: 'active',
  },
  {
    name: 'INDUSIND BANK',
    bankCode: 'INDUSIND',
    category: 'Private Banks',
    roi: '9.15% - 14%',
    maxLTV: '80%',
    maxTenure: '25 Years',
    processingTime: '15-20 Days',
    interestRateRange: { min: 9.15, max: 14.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1% - 1.5% + GST',
    description: 'Dynamic commercial bank with fast disbursals and responsive SME and personal financing.',
    status: 'active',
  },
  {
    name: 'KOTAK BANK',
    bankCode: 'KOTAK',
    category: 'Private Banks',
    roi: '7.75% - 14%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-20 Days',
    interestRateRange: { min: 7.75, max: 14.00 },
    maxTenureMonths: 300,
    processingFeeDetails: 'Up to 1% + GST',
    description: 'Kotak Mahindra Bank offers competitive mortgage lending, customized loan terms, and fast approvals.',
    status: 'active',
  },
  {
    name: 'AU Small Finance Bank',
    bankCode: 'AUBANK',
    category: 'Private Banks',
    roi: '8.5% - 12.5%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-20 Days',
    interestRateRange: { min: 8.50, max: 12.50 },
    maxTenureMonths: 300,
    processingFeeDetails: '1% - 1.5% + GST',
    description: 'Fast-growing scheduled commercial bank catering to retail, MSME, and property financing needs.',
    status: 'active',
  },
  {
    name: 'IDFC Bank',
    bankCode: 'IDFC',
    category: 'Private Banks',
    roi: '7.75% - 14%',
    maxLTV: '75%',
    maxTenure: '30 Years',
    processingTime: '15-20 Days',
    interestRateRange: { min: 7.75, max: 14.00 },
    maxTenureMonths: 360,
    processingFeeDetails: 'Up to 1% + GST',
    description: 'IDFC FIRST Bank offers customer-first retail loans with zero hidden charges and flexible repayment.',
    status: 'active',
  },

  // --- 17 NBFCs ---
  {
    name: 'ADITYA BIRLA HOUSING',
    bankCode: 'ABHFL',
    category: 'NBFCs',
    roi: '9.5% - 14%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 9.50, max: 14.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1% - 2% + GST',
    description: 'Aditya Birla Housing Finance provides comprehensive home loans and loan against property.',
    status: 'active',
  },
  {
    name: 'AXIS FINANCE',
    bankCode: 'AXISFIN',
    category: 'NBFCs',
    roi: '9.5% - 14%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 9.50, max: 14.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1% - 2% + GST',
    description: 'Non-banking subsidiary of Axis Bank delivering structured credit and specialized loan solutions.',
    status: 'active',
  },
  {
    name: 'BAJAJ HOUSING',
    bankCode: 'BAJAJHFL',
    category: 'NBFCs',
    roi: '7.95% - 10.5%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 7.95, max: 10.50 },
    maxTenureMonths: 300,
    processingFeeDetails: 'Up to 1% + GST',
    description: 'Bajaj Housing Finance delivers high loan amounts, low interest rates, and seamless processing.',
    status: 'active',
  },
  {
    name: 'CHOLAMANDLAM',
    bankCode: 'CHOLA',
    category: 'NBFCs',
    roi: '9.5% - 14%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 9.50, max: 14.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1.5% - 2% + GST',
    description: 'Cholamandalam Investment and Finance offers affordable housing, vehicle, and enterprise credit.',
    status: 'active',
  },
  {
    name: 'EASY HOMELOAN FINANCE',
    bankCode: 'EASYHOME',
    category: 'NBFCs',
    roi: '10.10% - 15%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 10.10, max: 15.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1.5% - 2.5% + GST',
    description: 'Tech-enabled housing finance company offering streamlined home and property mortgage approvals.',
    status: 'active',
  },
  {
    name: 'GODREJ HFL',
    bankCode: 'GODREJHFL',
    category: 'NBFCs',
    roi: '9.5% - 14%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 9.50, max: 14.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1% - 1.5% + GST',
    description: 'Godrej Housing Finance provides transparent, quick, and hassle-free home loan journeys.',
    status: 'active',
  },
  {
    name: 'HINDUJA',
    bankCode: 'HINDUJA',
    category: 'NBFCs',
    roi: '10.10% - 15%',
    maxLTV: '80%',
    maxTenure: '30 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 10.10, max: 15.00 },
    maxTenureMonths: 360,
    processingFeeDetails: '1.5% - 2% + GST',
    description: 'Hinduja Housing Finance delivers flexible financing across urban, semi-urban, and rural markets.',
    status: 'active',
  },
  {
    name: 'ICICI HFC',
    bankCode: 'ICICIHFC',
    category: 'NBFCs',
    roi: '10.10% - 15%',
    maxLTV: '75%',
    maxTenure: '30 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 10.10, max: 15.00 },
    maxTenureMonths: 360,
    processingFeeDetails: '1% - 2% + GST',
    description: 'ICICI Home Finance offers simple documentation and doorstep assistance for affordable homes.',
    status: 'active',
  },
  {
    name: 'IIFL',
    bankCode: 'IIFL',
    category: 'NBFCs',
    roi: '10.10% - 15%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 10.10, max: 15.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1.5% - 2% + GST',
    description: 'IIFL Home Loans offers fast disbursals and specialized credit programs for all customer profiles.',
    status: 'active',
  },
  {
    name: 'L&T FINANCE',
    bankCode: 'LTFIN',
    category: 'NBFCs',
    roi: '10.10% - 15%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 10.10, max: 15.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1% - 2% + GST',
    description: 'L&T Finance delivers customized loan structures backed by one of India’s most trusted groups.',
    status: 'active',
  },
  {
    name: 'LIC HFL',
    bankCode: 'LICHFL',
    category: 'NBFCs',
    roi: '9.5% - 14%',
    maxLTV: '90%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 9.50, max: 14.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '0.50% - 1% + GST',
    description: 'LIC Housing Finance is one of India’s largest housing finance companies with high LTV up to 90%.',
    status: 'active',
  },
  {
    name: 'MOTILAL OSWAL',
    bankCode: 'MOTILAL',
    category: 'NBFCs',
    roi: '9.5% - 14%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 9.50, max: 14.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1.5% - 2% + GST',
    description: 'Motilal Oswal Home Finance provides quick mortgage sanctions for both salaried and self-employed.',
    status: 'active',
  },
  {
    name: 'PIRAMAL',
    bankCode: 'PIRAMAL',
    category: 'NBFCs',
    roi: '10.5% - 15%',
    maxLTV: '75%',
    maxTenure: '30 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 10.50, max: 15.00 },
    maxTenureMonths: 360,
    processingFeeDetails: '1.5% - 2% + GST',
    description: 'Piramal Capital & Housing Finance offers multi-product retail financing with extended 30-year tenure.',
    status: 'active',
  },
  {
    name: 'PNB HFL',
    bankCode: 'PNBHFL',
    category: 'NBFCs',
    roi: '10.5% - 15%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 10.50, max: 15.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1% - 1.5% + GST',
    description: 'PNB Housing Finance delivers dedicated service, attractive loan brackets, and property loans.',
    status: 'active',
  },
  {
    name: 'SAMMAN CAPITAL',
    bankCode: 'SAMMAN',
    category: 'NBFCs',
    roi: '10.5% - 15%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 10.50, max: 15.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1% - 2% + GST',
    description: 'Samman Capital offers innovative retail and commercial credit solutions tailored to borrowers.',
    status: 'active',
  },
  {
    name: 'TATA HFC',
    bankCode: 'TATAHFC',
    category: 'NBFCs',
    roi: '10.5% - 15%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 10.50, max: 15.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1% - 1.5% + GST',
    description: 'Tata Capital Housing Finance ensures transparent pricing, high trust, and quick credit turnaround.',
    status: 'active',
  },
  {
    name: 'VASTU HOUSING',
    bankCode: 'VASTU',
    category: 'NBFCs',
    roi: '10.5% - 15%',
    maxLTV: '75%',
    maxTenure: '25 Years',
    processingTime: '15-30 Days',
    interestRateRange: { min: 10.50, max: 15.00 },
    maxTenureMonths: 300,
    processingFeeDetails: '1.5% - 2% + GST',
    description: 'Vastu Housing Finance delivers digital-led affordable housing and mortgage financing.',
    status: 'active',
  },
];

// 4 Loan Facilities
const LOAN_FACILITIES = [
  {
    name: 'Personal Loan',
    slug: 'personal-loan',
    shortName: 'PL',
    baseInterestRate: '10.5% - 18%',
    maximumTenure: '7 Years',
    maximumFacility: '₹25 Lakhs',
    processingTime: '2 Days',
    minAmount: 50000,
    maxAmount: 2500000,
    minInterestRate: 10.5,
    maxInterestRate: 18.0,
    interestRateRange: { min: 10.5, max: 18.0 },
    minTenureMonths: 12,
    maxTenureMonths: 84,
    iconName: 'UserCheck',
    tagline: 'Instant Unsecured Credit For Personal & Emergency Needs',
    description: 'Quick unsecured funding with zero collateral requirements, minimal paperwork, and rapid account disbursement for salaried professionals and emergency expenses.',
    features: [
      'Collateral-free instant processing',
      'Flexible tenures up to 7 years',
      'Disbursement within 24-48 hours',
      'Zero restriction on end-use',
    ],
    eligibility: [
      'Salaried individuals or self-employed professionals',
      'Age between 21 and 60 years',
      'Minimum monthly net income of ₹20,000',
      'CIBIL score of 650 or above preferred',
    ],
    documentChecklist: [
      'PAN Card & Aadhaar Card',
      'Last 3 Months Salary Slips',
      'Last 6 Months Bank Statement',
      'Form 16 / Latest ITR (Past 2 Years)',
      'Current Employment ID Card',
      'Current Address Proof (Utility Bill / Rent Agreement)',
    ],
    status: 'active',
    isActive: true,
    isDeleted: false,
    displayOrder: 1,
  },
  {
    name: 'Business Loan',
    slug: 'business-loan',
    shortName: 'BL',
    baseInterestRate: '14% - 22%',
    maximumTenure: '10 Years',
    maximumFacility: '₹50 Lakhs',
    processingTime: '7 Days',
    minAmount: 200000,
    maxAmount: 5000000,
    minInterestRate: 14.0,
    maxInterestRate: 22.0,
    interestRateRange: { min: 14.0, max: 22.0 },
    minTenureMonths: 12,
    maxTenureMonths: 120,
    iconName: 'Briefcase',
    tagline: 'Growth Capital & Working Finance For Enterprises',
    description: 'Dedicated collateral-free capital designed to scale your commercial operations, expand inventory, finance equipment, or bridge immediate cash-flow cycles.',
    features: [
      'Credit facilities up to ₹50 Lakhs',
      'Collateral-free working capital',
      'Flexible repayment structures',
      'Fast-track appraisal in 7 days',
    ],
    eligibility: [
      'Business operational continuity of at least 2-3 years',
      'Annual business turnover of minimum ₹25 Lakhs',
      'Positive net worth and profitable track record',
      'Good credit profile of business & primary promoters',
    ],
    documentChecklist: [
      'PAN Card & Aadhaar Card of Promoters/Directors',
      'Business Registration Proof (GST Certificate, MSME, Udyam, Trade License)',
      'Last 12 Months Current Bank Account Statements',
      'Past 2 Years Audited Financials, Balance Sheets & P&L Statements',
      'Past 2 Years Income Tax Returns (ITR) with Computation of Income',
      'Proof of Business Continuity (Minimum 2-3 Years Operations)',
    ],
    status: 'active',
    isActive: true,
    isDeleted: false,
    displayOrder: 2,
  },
  {
    name: 'Home Loan',
    slug: 'home-loan',
    shortName: 'HL',
    baseInterestRate: '7.10% - 12.5%',
    maximumTenure: '30 Years',
    maximumFacility: '₹50 Crores',
    processingTime: '10 Days',
    minAmount: 500000,
    maxAmount: 500000000,
    minInterestRate: 7.10,
    maxInterestRate: 12.5,
    interestRateRange: { min: 7.10, max: 12.5 },
    minTenureMonths: 36,
    maxTenureMonths: 360,
    iconName: 'Home',
    tagline: 'Affordable Long-term Financing For Your Dream Home',
    description: 'Premium institutional housing finance with lowest interest starting from 7.10% p.a., flexible repayment tenure up to 30 years, and maximum loan-to-value ratio.',
    features: [
      'Interest rates starting at 7.10% p.a.',
      'Tenures up to 30 years',
      'Funding up to 90% of property cost',
      'Doorstep legal and technical verification',
    ],
    eligibility: [
      'Resident Indians & Non-Resident Indians (NRIs)',
      'Salaried professionals or self-employed individuals',
      'Age between 21 and 65 years',
      'Clear title and statutory approval of the property',
    ],
    documentChecklist: [
      'KYC Documents (PAN Card, Aadhaar Card, Passport/Voter ID)',
      'Income Proof: Last 3 Months Salary Slips & Form 16 (Salaried) / 3 Years ITR & Financials (Self-Employed)',
      'Last 6-12 Months Bank Account Statements (Salary / Current Account)',
      'Property Documents: Allotment Letter / Agreement to Sell / Buyer Agreement',
      'Title Deeds, Chain of Title & Link Documents (Minimum 30 Years)',
      'Approved Building Plan & Sanction Map by Competent Authority',
      'NOC from Builder / Housing Society',
      'Payment Receipts made to Developer / Seller',
    ],
    status: 'active',
    isActive: true,
    isDeleted: false,
    displayOrder: 3,
  },
  {
    name: 'Loan Against Property',
    slug: 'loan-against-property',
    shortName: 'LAP',
    baseInterestRate: '9.5% - 18%',
    maximumTenure: '15 Years',
    maximumFacility: '₹25 Crores',
    processingTime: '10 Days',
    minAmount: 1000000,
    maxAmount: 250000000,
    minInterestRate: 9.50,
    maxInterestRate: 18.0,
    interestRateRange: { min: 9.50, max: 18.0 },
    minTenureMonths: 24,
    maxTenureMonths: 180,
    iconName: 'Building2',
    tagline: 'Unlock High-Value Capital Pledging Residential or Commercial Assets',
    description: 'Leverage the locked market equity of your residential, commercial, or industrial real estate assets to access large liquidity pools at lower interest rates than unsecured debt.',
    features: [
      'High-value credit facility up to ₹25 Crores',
      'Lower interest rates than unsecured loans',
      'Extended repayment tenure up to 15 years',
      'Retain full property ownership and usage',
    ],
    eligibility: [
      'Owners of clear-title freehold residential, commercial, or industrial property',
      'Salaried borrowers or profit-making enterprises',
      'Adequate debt servicing and repayment capacity',
      'Mortgageable property with no existing unresolvable legal disputes',
    ],
    documentChecklist: [
      'KYC Documents of all Property Owners & Borrowers (PAN, Aadhaar)',
      'Income Proof: Salary Slips (Salaried) or 3 Years Audited ITR & Balance Sheets (Self-Employed)',
      'Last 12 Months Bank Statements (All Active Accounts)',
      'Registered Sale Deed / Title Deed of the Mortgaged Property',
      'Prior Chain of Deeds / Link Documents for Clear Marketable Title',
      'Approved Building Plan, Sanction Layout & Occupancy Certificate (OC)',
      'Latest Property Tax Paid Receipts & Electricity Bill',
      'Non-Encumbrance Certificate (NEC) for 13 to 30 Years',
    ],
    status: 'active',
    isActive: true,
    isDeleted: false,
    displayOrder: 4,
  },
];

async function seed() {
  try {
    console.log('[RealCred Seeder] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[RealCred Seeder] Connected to: ${conn.connection.host}/${conn.connection.name}`);

    // 1. Upsert Banks (Safe idempotent upsert based on bankCode)
    console.log(`\n[RealCred Seeder] Upserting ${BANK_PARTNERS.length} Banking Partners...`);
    let bankUpsertCount = 0;
    for (const bankData of BANK_PARTNERS) {
      await Bank.findOneAndUpdate(
        { bankCode: bankData.bankCode },
        {
          $set: {
            ...bankData,
            isDeleted: false,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      bankUpsertCount++;
    }
    console.log(`[RealCred Seeder] Successfully upserted ${bankUpsertCount} banking partners.`);

    // 2. Upsert Loan Categories (Safe idempotent upsert based on slug)
    console.log(`\n[RealCred Seeder] Upserting ${LOAN_FACILITIES.length} Loan Facilities...`);
    let catUpsertCount = 0;
    for (const catData of LOAN_FACILITIES) {
      await LoanCategory.findOneAndUpdate(
        { slug: catData.slug },
        {
          $set: {
            ...catData,
            isDeleted: false,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      catUpsertCount++;
    }
    console.log(`[RealCred Seeder] Successfully upserted ${catUpsertCount} loan facilities.`);

    // Deactivate non-standard test categories so only the 4 standard active loan facilities are public
    const standardSlugs = LOAN_FACILITIES.map(c => c.slug);
    const deactivatedResult = await LoanCategory.updateMany(
      { slug: { $nin: standardSlugs } },
      { $set: { status: 'inactive', isActive: false } }
    );
    if (deactivatedResult.modifiedCount > 0) {
      console.log(`[RealCred Seeder] Deactivated ${deactivatedResult.modifiedCount} legacy/test loan categories.`);
    }

    // Verification queries
    const activeBanks = await Bank.find({ status: 'active', isDeleted: { $ne: true } });
    const psuCount = activeBanks.filter((b) => b.category === 'PSU Banks').length;
    const pvtCount = activeBanks.filter((b) => b.category === 'Private Banks').length;
    const nbfcCount = activeBanks.filter((b) => b.category === 'NBFCs').length;

    const activeCategories = await LoanCategory.find({
      isDeleted: { $ne: true },
      isActive: { $ne: false },
      status: 'active',
    });

    console.log('\n=============================================');
    console.log('[RealCred Database Verification Summary]');
    console.log(`Total Active Banking Partners: ${activeBanks.length}`);
    console.log(`  - PSU Banks: ${psuCount}`);
    console.log(`  - Private Banks: ${pvtCount}`);
    console.log(`  - NBFCs: ${nbfcCount}`);
    console.log(`Total Active Loan Facilities: ${activeCategories.length}`);
    activeCategories.forEach((cat) => {
      console.log(`  * [${cat.shortName || 'N/A'}] ${cat.name} (${cat.slug}) - ${cat.documentChecklist?.length || 0} checklist items`);
    });
    console.log('=============================================\n');

    await mongoose.disconnect();
    console.log('[RealCred Seeder] Database disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('[RealCred Seeder Error]:', error);
    process.exit(1);
  }
}

seed();
