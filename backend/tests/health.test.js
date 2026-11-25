import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { ENV } from '../config/environment.js';

test('Database Configuration Test', async (t) => {
  await t.test('MongoDB URI is configured for local realcred database', () => {
    assert.strictEqual(ENV.MONGO_URI, 'mongodb://127.0.0.1:27017/realcred');
  });

  await t.test('MongoDB local connection can be established', async () => {
    const conn = await mongoose.connect(ENV.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    assert.ok(conn.connection.readyState === 1, 'MongoDB connection state should be 1 (connected)');
    assert.strictEqual(conn.connection.name, 'realcred', 'Connected database name should be realcred');
    await mongoose.disconnect();
  });
});
