import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import app from '../server.js';
import { ENV } from '../config/environment.js';
import LoanCategory from '../models/LoanCategory.js';

test('REALCRED Public Website - Products Listing & Product Details Integration Test Suite', async (t) => {
  let server;
  let baseUrl = '';

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(ENV.MONGO_URI || ENV.MONGODB_URI || 'mongodb://127.0.0.1:27017/realcred');
  }

  let activeCategories = [];

  await t.test('1. GET /api/loans/categories returns all active categories for Products listing cards', async () => {
    const res = await fetch(`${baseUrl}/loans/categories`);
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.status, 'success');
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0, 'Expected at least 1 active loan category');

    activeCategories = body.data;

    // Verify every category has name, slug, tagline/description, and an ID for Apply Now routing
    activeCategories.forEach((cat) => {
      assert.ok(cat.name, `Category missing name: ${JSON.stringify(cat)}`);
      assert.ok(cat.slug, `Category missing slug: ${cat.name}`);
      assert.ok(cat._id, `Category missing _id: ${cat.name}`);
      assert.ok(cat.description || cat.tagline, `Category missing description/tagline: ${cat.name}`);
    });
  });

  await t.test('2. GET /api/loans/categories/:slug returns complete details for each individual product page', async () => {
    for (const cat of activeCategories) {
      const res = await fetch(`${baseUrl}/loans/categories/${cat.slug}`);
      const body = await res.json();

      assert.strictEqual(res.status, 200, `Failed to load details for slug: ${cat.slug}`);
      assert.strictEqual(body.status, 'success');
      assert.strictEqual(body.data.slug, cat.slug);
      assert.strictEqual(body.data.name, cat.name);
      assert.ok(Array.isArray(body.data.features), `Features should be array for ${cat.slug}`);
      assert.ok(Array.isArray(body.data.eligibility), `Eligibility should be array for ${cat.slug}`);
      assert.ok(Array.isArray(body.data.requiredDocuments), `RequiredDocuments should be array for ${cat.slug}`);
    }
  });

  await t.test('3. Alias slug /products/od correctly resolves to Overdraft category', async () => {
    const res = await fetch(`${baseUrl}/loans/categories/od`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(body.data.name.includes('Overdraft') || body.data.name.includes('OD'));
  });

  await t.test('4. Non-existent product slug cleanly returns 404 error without crashing', async () => {
    const res = await fetch(`${baseUrl}/loans/categories/non-existent-loan-slug-404`);
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.status, 'error');
  });

  // Teardown
  t.after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
  });
});
