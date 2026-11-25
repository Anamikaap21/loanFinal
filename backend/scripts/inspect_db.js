import mongoose from 'mongoose';
import { ENV } from '../config/environment.js';

async function inspectDb() {
  await mongoose.connect(ENV.MONGO_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections in database:', collections.map(c => c.name));

  for (const c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`\nCollection [${c.name}] count: ${count}`);
    if (c.name.toLowerCase().includes('loan') || c.name.toLowerCase().includes('bank') || c.name.toLowerCase().includes('cat') || c.name.toLowerCase().includes('prod')) {
      const docs = await mongoose.connection.db.collection(c.name).find().toArray();
      console.log(`--- Docs in ${c.name} ---`);
      docs.forEach(d => console.log('  ID:', d._id, 'Name:', d.name || d.productName, 'Slug:', d.slug, 'Status:', d.status, 'isActive:', d.isActive, 'isDeleted:', d.isDeleted, 'bank:', d.bank || d.preferredBank || d.bankCode));
    }
  }
  await mongoose.disconnect();
}

inspectDb().catch(console.error);
