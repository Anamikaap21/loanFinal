import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Bank from '../models/Bank.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('[Error] MONGO_URI missing in .env!');
  process.exit(1);
}

// 37 Verified Authentic Bank Code to Logo URL Mapping
const VERIFIED_BANK_LOGO_MAP = {
  // 10 PSU Banks
  BOB: '/assets/banks/bob.svg',
  BOI: '/assets/banks/boi.png',
  BOM: '/assets/banks/bom.svg',
  CANARA: '/assets/banks/canara.svg',
  IDBI: '/assets/banks/idbi.svg',
  INDIANBANK: '/assets/banks/indianbank.svg',
  PNB: '/assets/banks/pnb.svg',
  SBI: '/assets/banks/sbi.svg',
  UCO: '/assets/banks/uco.jpg',
  UNIONBANK: '/assets/banks/unionbank.svg',

  // 10 Private Banks
  AXIS: '/assets/banks/axis.svg',
  DCB: '/assets/banks/dcb.svg',
  FEDERAL: '/assets/banks/federal.svg',
  HDFC: '/assets/banks/hdfc.svg',
  HSBC: '/assets/banks/hsbc.svg',
  ICICI: '/assets/banks/icici.svg',
  INDUSIND: '/assets/banks/indusind.svg',
  KOTAK: '/assets/banks/kotak.svg',
  AUBANK: '/assets/banks/aubank.svg',
  IDFC: '/assets/banks/idfc.svg',

  // 17 NBFCs
  ABHFL: '/assets/banks/abhfl.svg',
  AXISFIN: '/assets/banks/axisfin.webp',
  BAJAJHFL: '/assets/banks/bajajhfl.svg',
  CHOLA: '/assets/banks/chola.svg',
  EASYHOME: '/assets/banks/easyhome.svg',
  GODREJHFL: '/assets/banks/godrejhfl.svg',
  HINDUJA: '/assets/banks/hinduja.png',
  ICICIHFC: '/assets/banks/icicihfc.png',
  IIFL: '/assets/banks/iifl.svg',
  LTFIN: '/assets/banks/ltfin.svg',
  LICHFL: '/assets/banks/lichfl.svg',
  MOTILAL: '/assets/banks/motilal.svg',
  PIRAMAL: '/assets/banks/piramal.svg',
  PNBHFL: '/assets/banks/pnbhfl.png',
  SAMMAN: '/assets/banks/samman.png',
  TATAHFC: '/assets/banks/tatahfc.svg',
  VASTU: '/assets/banks/vastu.svg',
};

async function updateLogos() {
  try {
    console.log('[Logo Update] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log(`[Logo Update] Connected to: ${conn.connection.host}/${conn.connection.name}`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [bankCode, logoUrl] of Object.entries(VERIFIED_BANK_LOGO_MAP)) {
      // Idempotently update logoUrl for each existing bank by bankCode without touching other fields
      const res = await Bank.updateOne(
        { bankCode: bankCode },
        { $set: { logoUrl: logoUrl } }
      );

      if (res.matchedCount > 0) {
        console.log(`✓ [${bankCode}] -> logoUrl set to ${logoUrl} (Matched: ${res.matchedCount}, Modified: ${res.modifiedCount})`);
        updatedCount++;
      } else {
        console.warn(`⚠ [${bankCode}] Not found in database!`);
        notFoundCount++;
      }
    }

    console.log('\n================ UPDATE SUMMARY ================');
    console.log(`Total banks in map: ${Object.keys(VERIFIED_BANK_LOGO_MAP).length}`);
    console.log(`Successfully matched and updated: ${updatedCount}`);
    console.log(`Not found: ${notFoundCount}`);
    console.log('================================================\n');

    // Audit verify all active banks
    const activeBanks = await Bank.find({ status: 'active', isDeleted: { $ne: true } }).select('bankCode name logoUrl category');
    console.log(`Active Banks in DB with logoUrl: ${activeBanks.filter(b => !!b.logoUrl).length} / ${activeBanks.length}`);

    await mongoose.disconnect();
    console.log('[Logo Update] Disconnected cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('[Logo Update Error]:', err);
    process.exit(1);
  }
}

updateLogos();
