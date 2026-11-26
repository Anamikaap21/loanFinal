import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Invoice from '../models/Invoice.js';
import Payout from '../models/Payout.js';
import Partner from '../models/Partner.js';
import Lead from '../models/Lead.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INVOICES_DIR = path.join(__dirname, '..', 'uploads', 'invoices');

// Ensure invoices directory exists
if (!fs.existsSync(INVOICES_DIR)) {
  fs.mkdirSync(INVOICES_DIR, { recursive: true });
}

/**
 * 1. Financial Calculation Engine
 * Calculates gross commission, statutory 5% TDS under Section 194H, and net payout.
 */
export const calculateCommissionAndTds = ({
  disbursedAmount,
  commissionRate = 1.5,
  commissionType = 'percentage',
  tdsRate = 5,
}) => {
  const loanDisbursed = Number(disbursedAmount) || 0;
  const rate = Number(commissionRate) || 1.5;
  const taxRate = Number(tdsRate) || 5;

  let grossCommission = 0;
  if (commissionType === 'percentage') {
    grossCommission = (loanDisbursed * rate) / 100;
  } else {
    grossCommission = rate; // Fixed rupees
  }

  const tdsAmount = (grossCommission * taxRate) / 100;
  const netPayout = grossCommission - tdsAmount;

  return {
    disbursedLoanAmount: loanDisbursed,
    commissionType,
    commissionRate: rate,
    grossCommissionAmount: Math.round(grossCommission * 100) / 100,
    tdsRate: taxRate,
    tdsAmount: Math.round(tdsAmount * 100) / 100,
    netPayoutAmount: Math.round(netPayout * 100) / 100,
  };
};

/**
 * 2. PDF Generation Engine using PDFKit
 * Generates an official, immutable RealCred Technology Private Limited commission invoice PDF.
 */
export const generateInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `${invoice.invoiceNumber}.pdf`;
      const filePath = path.join(INVOICES_DIR, fileName);
      const writeStream = fs.createWriteStream(filePath);

      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Commission Invoice - ${invoice.invoiceNumber}`,
          Author: 'RealCred Technology Private Limited',
          Subject: 'Loan Distribution Referral Commission Settlement',
          Keywords: 'RealCred, Invoice, Payout, Commission, TDS',
        },
      });

      doc.pipe(writeStream);

      // Colors matching RealCred Red & White design system
      const textPrimary = '#242424';
      const brandRed = '#D71938';
      const brandDeepRed = '#B5122D';
      const textSecondary = '#666666';
      const lightGrey = '#F8F8FA';
      const borderGrey = '#E5E5E5';

      // 1. BRAND HEADER
      doc.rect(40, 40, 515, 6).fill(brandRed);

      doc
        .fontSize(22)
        .fillColor(textPrimary)
        .font('Helvetica-Bold')
        .text('REAL', 40, 55, { continued: true })
        .fillColor(brandRed)
        .text('CRED')
        .fillColor(textSecondary)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('YOUR LOAN. ONE GUIDED ROUTE.', 40, 80);

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(textSecondary)
        .text('RealCred Technology Private Limited', 40, 95)
        .text('D-9, Ground Floor, Workshala, Vyapar Marg, Block D', 40, 107)
        .text('Noida Sector 3, Noida, Uttar Pradesh 201301, India', 40, 119)
        .text('Website: https://realcred.in | Email: contact@realcred.in', 40, 131);

      // Invoice metadata right-aligned box
      doc.rect(360, 55, 195, 85).fillAndStroke(lightGrey, borderGrey);

      doc
        .fontSize(10)
        .fillColor(textPrimary)
        .font('Helvetica-Bold')
        .text('COMMISSION INVOICE', 370, 65)
        .fontSize(8)
        .font('Helvetica')
        .fillColor(textSecondary)
        .text(`Invoice No: `, 370, 82, { continued: true })
        .font('Helvetica-Bold')
        .fillColor(textPrimary)
        .text(invoice.invoiceNumber)
        .font('Helvetica')
        .fillColor(textSecondary)
        .text(`Date: `, 370, 96, { continued: true })
        .fillColor(textPrimary)
        .text(new Date(invoice.invoiceDate).toLocaleDateString('en-IN'))
        .fillColor(textSecondary)
        .text(`Settlement Status: `, 370, 110, { continued: true })
        .font('Helvetica-Bold')
        .fillColor(invoice.payoutStatus === 'completed' ? '#16A34A' : '#D97706')
        .text(invoice.payoutStatus.toUpperCase());

      // Divider
      doc.moveTo(40, 155).lineTo(555, 155).strokeColor(borderGrey).stroke();

      // 2. PARTNER & LOAN PARTICULARS
      // Column 1: Billed To (Partner)
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(brandRed)
        .text('BILLED TO (CHANNEL PARTNER):', 40, 170)
        .fontSize(10)
        .fillColor(textPrimary)
        .text(invoice.partnerDetails?.partnerName || 'Channel Partner', 40, 185)
        .fontSize(8)
        .font('Helvetica')
        .fillColor(textSecondary);

      let currentY = 198;
      if (invoice.partnerDetails?.businessName) {
        doc.text(`Firm: ${invoice.partnerDetails.businessName}`, 40, currentY);
        currentY += 12;
      }
      doc.text(`Partner Code: ${invoice.partnerDetails?.partnerCode || 'N/A'}`, 40, currentY);
      currentY += 12;
      if (invoice.partnerDetails?.panNumber) {
        doc.text(`PAN: ${invoice.partnerDetails.panNumber}`, 40, currentY);
        currentY += 12;
      }
      doc.text(`Mobile: ${invoice.partnerDetails?.phone || 'N/A'}`, 40, currentY);
      currentY += 12;
      if (invoice.partnerDetails?.address) {
        doc.text(`Address: ${invoice.partnerDetails.address}`, 40, currentY, { width: 220 });
      }

      // Column 2: Loan File Coordinates
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(brandRed)
        .text('REFERRED LOAN COORDINATES:', 320, 170)
        .fontSize(8)
        .font('Helvetica')
        .fillColor(textSecondary)
        .text('Lead ID: ', 320, 185, { continued: true })
        .font('Helvetica-Bold')
        .fillColor(textPrimary)
        .text(invoice.loanReference?.leadCode || 'N/A')
        .font('Helvetica')
        .fillColor(textSecondary)
        .text('Customer Name: ', 320, 199, { continued: true })
        .font('Helvetica-Bold')
        .fillColor(textPrimary)
        .text(invoice.loanReference?.customerName || 'N/A')
        .font('Helvetica')
        .fillColor(textSecondary)
        .text('Loan Category: ', 320, 213, { continued: true })
        .fillColor(textPrimary)
        .text(invoice.loanReference?.loanCategory || 'N/A')
        .fillColor(textSecondary)
        .text('Bank Disbursed Amount: ', 320, 227, { continued: true })
        .font('Helvetica-Bold')
        .fillColor('#16A34A')
        .text(`INR ${Number(invoice.loanReference?.disbursedLoanAmount || 0).toLocaleString('en-IN')}`);

      // 3. FINANCIAL LINE ITEMS TABLE
      const tableTop = 270;
      doc.rect(40, tableTop, 515, 24).fill(brandRed);

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#FFFFFF')
        .text('PARTICULARS / DESCRIPTION', 50, tableTop + 7)
        .text('RATE', 350, tableTop + 7, { width: 50, align: 'center' })
        .text('AMOUNT (INR)', 430, tableTop + 7, { width: 115, align: 'right' });

      // Row 1: Gross Commission
      doc.rect(40, tableTop + 24, 515, 30).fill(lightGrey);
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(textPrimary)
        .text('Loan Sourcing & Facilitation Commission', 50, tableTop + 30)
        .font('Helvetica')
        .fillColor(textSecondary)
        .fontSize(7)
        .text(`Calculated on bank disbursement of INR ${Number(invoice.loanReference?.disbursedLoanAmount || 0).toLocaleString('en-IN')}`, 50, tableTop + 42)
        .fontSize(8)
        .fillColor(textPrimary)
        .text(`${invoice.financialSummary?.commissionRate}%`, 350, tableTop + 33, { width: 50, align: 'center' })
        .font('Helvetica-Bold')
        .text(`INR ${Number(invoice.financialSummary?.grossCommissionAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, tableTop + 33, { width: 115, align: 'right' });

      // Row 2: Statutory TDS Deduction
      doc.rect(40, tableTop + 54, 515, 24).fill('#FFFFFF');
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(brandRed)
        .text('Less: Statutory TDS under Section 194H (Income Tax Act)', 50, tableTop + 61)
        .text('5%', 350, tableTop + 61, { width: 50, align: 'center' })
        .font('Helvetica-Bold')
        .text(`- INR ${Number(invoice.financialSummary?.tdsAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, tableTop + 61, { width: 115, align: 'right' });

      // Row 3: Net Total Payable
      doc.rect(40, tableTop + 78, 515, 28).fill(lightGrey);
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(textPrimary)
        .text('NET COMMISSION PAYABLE', 50, tableTop + 86)
        .fillColor('#16A34A')
        .text(`INR ${Number(invoice.financialSummary?.totalPayable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, tableTop + 85, { width: 115, align: 'right' });

      // 4. LEGAL & TAX DECLARATION
      const noteTop = tableTop + 125;
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(textPrimary)
        .text('TAX & STATUTORY NOTES:', 40, noteTop)
        .font('Helvetica')
        .fontSize(7)
        .fillColor(textSecondary)
        .text('1. Tax Deducted at Source (TDS) is calculated at the rate of 5% in accordance with Section 194H of the Indian Income Tax Act, 1961.', 40, noteTop + 14)
        .text('2. TDS certificate (Form 16A) will be issued quarterly against the registered PAN of the Channel Partner.', 40, noteTop + 24)
        .text('3. This document is a computer-generated billing statement issued by RealCred Technology Private Limited and requires no physical signature.', 40, noteTop + 34);

      // Signatory Section
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(textPrimary)
        .text('For RealCred Technology Private Limited', 360, noteTop + 60, { width: 195, align: 'right' })
        .font('Helvetica')
        .fontSize(7)
        .fillColor(textSecondary)
        .text('Authorized Finance Signatory', 360, noteTop + 100, { width: 195, align: 'right' });

      // Bottom Brand Footer
      doc
        .rect(40, 770, 515, 1)
        .fill(borderGrey)
        .fontSize(7)
        .fillColor(textSecondary)
        .text('RealCred Technology Private Limited | CIN: Verified Fintech | https://realcred.in', 40, 778, {
          align: 'center',
          width: 515,
        });

      doc.end();

      writeStream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          relativeUrl: `/uploads/invoices/${fileName}`,
        });
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * 3. Unified Generator & Storage Pipeline
 */
export const generateAndPersistInvoice = async (payoutId, adminUserId = null) => {
  const payout = await Payout.findById(payoutId)
    .populate('lead')
    .populate({
      path: 'partner',
      populate: { path: 'user', select: 'name email phone' },
    });

  if (!payout) {
    const error = new Error('Payout record not found.');
    error.statusCode = 404;
    throw error;
  }

  // Check duplicate invoice
  const existing = await Invoice.findOne({ payout: payout._id });
  if (existing) {
    return existing;
  }

  const invoiceNumber = `RCINV-${Date.now().toString().slice(-6)}`;
  const partner = payout.partner;
  const lead = payout.lead;

  const invoice = new Invoice({
    invoiceNumber,
    invoiceDate: new Date(),
    payout: payout._id,
    partner: partner._id,
    lead: lead._id,
    companyDetails: {
      name: 'RealCred Technology Private Limited',
      tagline: 'Your Loan. One Guided Route.',
      domain: 'https://realcred.in',
      address: 'D-9, Ground Floor, Workshala, Vyapar Marg, Block D, Noida Sector 3, Noida, UP 201301',
      phone: '+91 92892 23377',
      email: 'contact@realcred.in',
    },
    partnerDetails: {
      partnerCode: partner.partnerCode,
      partnerName: partner.user?.name || 'Channel Partner',
      businessName: partner.businessName || '',
      phone: partner.user?.phone || '',
      email: partner.user?.email || '',
      address: partner.address?.fullAddress || '',
      panNumber: partner.panNumber || '',
    },
    loanReference: {
      leadCode: lead.leadId,
      customerName: lead.customerName,
      loanCategory: lead.categoryName || 'Loan Facility',
      disbursedLoanAmount: payout.disbursedLoanAmount,
      disbursementDate: lead.disbursementDate || new Date(),
    },
    financialSummary: {
      commissionType: payout.commissionType,
      commissionRate: payout.commissionRate,
      grossCommissionAmount: payout.grossCommissionAmount,
      tdsAmount: payout.tdsAmount,
      totalPayable: payout.netPayoutAmount,
    },
    payoutStatus: payout.status === 'completed' ? 'completed' : 'pending',
    generatedBy: adminUserId,
  });

  // Generate PDF file on disk
  const pdfResult = await generateInvoicePDF(invoice);
  invoice.pdfFileName = pdfResult.fileName;
  invoice.pdfFilePath = pdfResult.relativeUrl;

  await invoice.save();

  // Link invoice back to payout
  payout.isInvoiceGenerated = true;
  payout.invoice = invoice._id;
  await payout.save();

  return invoice;
};

export default {
  calculateCommissionAndTds,
  generateInvoicePDF,
  generateAndPersistInvoice,
};
