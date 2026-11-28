import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function list() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const banks = await mongoose.connection.collection('banks').find({ status: 'active', isDeleted: { $ne: true } }).sort({ category: 1, name: 1 }).toArray();
  console.log(`TOTAL ACTIVE BANKS IN ATLAS: ${banks.length}`);
  banks.forEach((b, i) => {
    console.log(`${i + 1}. [${b.category}] ${b.bankCode} | "${b.name}" | Current logoUrl: ${b.logoUrl || 'NONE'}`);
  });
  await mongoose.disconnect();
}
list();
