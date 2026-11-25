import mongoose from 'mongoose';
import { ENV } from '../config/environment.js';

async function auditTestData() {
  await mongoose.connect(ENV.MONGO_URI);
  const db = mongoose.connection.db;

  const categories = await db.collection('loancategories').find().toArray();
  console.log(`Total Loan Categories: ${categories.length}`);

  const genuineCats = categories.filter(c => !c.slug.startsWith('test-'));
  const testCats = categories.filter(c => c.slug.startsWith('test-'));

  console.log('\n--- GENUINE CATEGORIES (Keep) ---');
  genuineCats.forEach(c => console.log(`  ID: ${c._id} | Name: ${c.name} | Slug: ${c.slug}`));

  console.log(`\n--- TEST CATEGORIES DETECTED (${testCats.length}) ---`);
  for (const tc of testCats) {
    const leadCount = await db.collection('leads').countDocuments({ loanCategory: tc._id });
    const appCount = await db.collection('loanapplications').countDocuments({ loanCategory: tc._id });
    console.log(`  ID: ${tc._id} | Name: ${tc.name} | Slug: ${tc.slug} | Leads: ${leadCount} | Apps: ${appCount}`);
  }

  // Also check Banks
  const banks = await db.collection('banks').find().toArray();
  console.log(`\nTotal Banks: ${banks.length}`);
  banks.forEach(b => {
    console.log(`  ID: ${b._id} | Name: ${b.name} | Code: ${b.bankCode} | Status: ${b.status} | isDeleted: ${b.isDeleted}`);
  });

  await mongoose.disconnect();
}

auditTestData().catch(console.error);
