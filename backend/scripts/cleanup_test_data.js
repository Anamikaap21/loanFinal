import mongoose from 'mongoose';
import { ENV } from '../config/environment.js';

async function cleanupTestData() {
  await mongoose.connect(ENV.MONGO_URI);
  const db = mongoose.connection.db;

  // 1. Find genuine Home Loan
  const homeLoan = await db.collection('loancategories').findOne({ slug: 'home-loan' });
  if (!homeLoan) {
    throw new Error('Master Home Loan category not found!');
  }

  // 2. Find all test categories (slug starting with test-)
  const testCats = await db.collection('loancategories').find({ slug: { $regex: '^test-' } }).toArray();
  console.log(`Found ${testCats.length} test categories to clean up.`);

  const testCatIds = testCats.map(c => c._id);

  if (testCatIds.length > 0) {
    // Re-point any leads
    const leadsUpdated = await db.collection('leads').updateMany(
      { loanCategory: { $in: testCatIds } },
      { $set: { loanCategory: homeLoan._id, categoryName: homeLoan.name } }
    );
    console.log(`Re-pointed ${leadsUpdated.modifiedCount} leads to genuine Home Loan.`);

    // Re-point any loan applications
    const appsUpdated = await db.collection('loanapplications').updateMany(
      { loanCategory: { $in: testCatIds } },
      { $set: { loanCategory: homeLoan._id } }
    );
    console.log(`Re-pointed ${appsUpdated.modifiedCount} applications to genuine Home Loan.`);

    // Delete test categories
    const deleteResult = await db.collection('loancategories').deleteMany({
      _id: { $in: testCatIds },
    });
    console.log(`Deleted ${deleteResult.deletedCount} test categories from loancategories collection.`);
  }

  // 3. Verify remaining categories
  const remaining = await db.collection('loancategories').find().sort({ displayOrder: 1 }).toArray();
  console.log(`\nRemaining categories in database (${remaining.length}):`);
  remaining.forEach(c => console.log(`  - [${c._id}] ${c.name} (${c.slug})`));

  await mongoose.disconnect();
}

cleanupTestData().catch(console.error);
