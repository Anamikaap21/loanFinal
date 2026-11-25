import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const layoutsDir = path.join(__dirname, '..', '..', 'frontend', 'src', 'layouts');

test('CRM Layouts Fixed Sidebar & Independent Scroll Architecture Suite', async (t) => {
  const layoutFiles = [
    { file: 'AdminLayout.jsx', moduleName: 'Admin' },
    { file: 'EmployeeLayout.jsx', moduleName: 'Employee' },
    { file: 'PartnerLayout.jsx', moduleName: 'Partner' },
  ];

  for (const { file, moduleName } of layoutFiles) {
    await t.test(`Verify ${moduleName} Layout (${file}) has permanently fixed sidebar and independent scroll`, () => {
      const filePath = path.join(layoutsDir, file);
      assert.ok(fs.existsSync(filePath), `${file} should exist`);
      const content = fs.readFileSync(filePath, 'utf-8');

      // 1. Root container locks viewport to prevent window scrolling
      assert.ok(
        content.includes('h-screen w-full') && content.includes('overflow-hidden'),
        `${moduleName} root wrapper must lock viewport height with h-screen and overflow-hidden`
      );

      // 2. Sidebar is genuinely fixed to top-0 left-0 h-screen w-64
      assert.ok(
        content.includes('fixed top-0 left-0 z-50 h-screen w-64'),
        `${moduleName} sidebar must have fixed top-0 left-0 z-50 h-screen w-64`
      );
      assert.ok(
        !content.includes('lg:sticky'),
        `${moduleName} sidebar must NOT use lg:sticky`
      );

      // 3. Sidebar header and footer are pinned (shrink-0), nav is flex-1 overflow-y-auto
      assert.ok(
        content.includes('shrink-0') && content.includes('flex-1') && content.includes('overflow-y-auto'),
        `${moduleName} sidebar must have shrink-0 header/footer and flex-1 overflow-y-auto nav`
      );

      // 4. Main content column has lg:ml-64 offset matching sidebar width
      assert.ok(
        content.includes('lg:ml-64') && content.includes('h-screen') && content.includes('overflow-hidden'),
        `${moduleName} main content area must have lg:ml-64 matching sidebar width and h-screen overflow-hidden`
      );

      // 5. Main content viewport has independent vertical scroll
      assert.ok(
        content.includes('<main') && content.includes('overflow-y-auto') && content.includes('flex-1'),
        `${moduleName} <main> element must have flex-1 and overflow-y-auto for independent scrolling`
      );
    });
  }
});
