import mongoose from 'mongoose';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Bank from '../models/Bank.js';
import LoanCategory from '../models/LoanCategory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const MONGO_URI = process.env.MONGO_URI;

async function verify() {
  try {
    console.log('[Verify] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log(`[Verify] Connected to: ${conn.connection.host}/${conn.connection.name}`);

    // Query active banks
    const allActiveBanks = await Bank.find({ status: 'active', isDeleted: { $ne: true } }).sort({ name: 1 });
    const psuBanks = allActiveBanks.filter(b => b.category === 'PSU Banks');
    const pvtBanks = allActiveBanks.filter(b => b.category === 'Private Banks');
    const nbfcs = allActiveBanks.filter(b => b.category === 'NBFCs');

    // Query active loan facilities
    const allActiveCategories = await LoanCategory.find({
      isDeleted: { $ne: true },
      isActive: { $ne: false },
      status: 'active'
    }).sort({ displayOrder: 1 });

    console.log('\n================ LIVE ATLAS AUDIT REPORT ================');
    console.log(`Total Active Banking Partners: ${allActiveBanks.length} (Expected: 37)`);
    console.log(`  * PSU Banks: ${psuBanks.length} (Expected: 10)`);
    console.log(`  * Private Banks: ${pvtBanks.length} (Expected: 10)`);
    console.log(`  * NBFCs: ${nbfcs.length} (Expected: 17)`);
    console.log(`Total Active Loan Facilities: ${allActiveCategories.length} (Expected: 4)`);
    console.log(`Total All Active Products & Banks: ${allActiveBanks.length + allActiveCategories.length} (Expected: 41)`);
    console.log('---------------------------------------------------------');

    console.log('\nLOAN FACILITIES:');
    allActiveCategories.forEach(cat => {
      console.log(`[${cat.shortName}] ${cat.name} (${cat.slug})`);
      console.log(`   - ROI: ${cat.baseInterestRate} | Max Limit: ${cat.maximumFacility} | Max Tenure: ${cat.maximumTenure} | Turnaround: ${cat.processingTime}`);
      console.log(`   - Document Checklist (${cat.documentChecklist?.length || 0} items):`);
      (cat.documentChecklist || []).forEach((doc, idx) => console.log(`       ${idx + 1}. ${doc}`));
    });

    console.log('\nSAMPLE BANKING PARTNERS FROM EACH CATEGORY:');
    console.log(`PSU: [${psuBanks[0]?.bankCode}] ${psuBanks[0]?.name} - ROI: ${psuBanks[0]?.roi}, LTV: ${psuBanks[0]?.maxLTV}, Tenure: ${psuBanks[0]?.maxTenure}`);
    console.log(`Private: [${pvtBanks[0]?.bankCode}] ${pvtBanks[0]?.name} - ROI: ${pvtBanks[0]?.roi}, LTV: ${pvtBanks[0]?.maxLTV}, Tenure: ${pvtBanks[0]?.maxTenure}`);
    console.log(`NBFC: [${nbfcs[0]?.bankCode}] ${nbfcs[0]?.name} - ROI: ${nbfcs[0]?.roi}, LTV: ${nbfcs[0]?.maxLTV}, Tenure: ${nbfcs[0]?.maxTenure}`);
    console.log('=========================================================\n');

    await mongoose.disconnect();
    console.log('[Verify] Disconnected cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('[Verify Error]:', err);
    process.exit(1);
  }
}

verify();
