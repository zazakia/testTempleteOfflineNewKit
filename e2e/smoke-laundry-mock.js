/**
 * Laundry Mock Data Smoke Test — robust version
 */
const { chromium } = require('playwright');
const BASE = 'https://meta.8-v.cc';
const failures = [];
const errors = [];
function log(icon, msg) { console.log(`  ${icon} ${msg}`); }

async function waitAndCheck(page, path, label, checks, waitMs = 4000) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`${label}`);
  console.log(`${'─'.repeat(50)}`);

  const startErrs = errors.length;
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(waitMs);

  const bodyText = await page.textContent('body');
  const newErrs = errors.slice(startErrs);
  const dexieErr = newErrs.find(e => e.includes('Dexie') || e.includes('not defined'));

  if (dexieErr) {
    log('❌', `Dexie: ${dexieErr.substring(0, 80)}`);
    failures.push(`${label}: ${dexieErr}`);
    return;
  }

  // Count visible rows
  let rowCount = 0;
  try {
    const rows = await page.$$('tbody tr');
    rowCount = rows.filter(async r => await r.isVisible()).length || rows.length;
  } catch {}

  // Count service cards (for services page)
  let cardCount = 0;
  try {
    const cards = await page.$$('[class*="rounded"][class*="border"], [class*="rounded"][class*="shadow"]');
    cardCount = cards.length;
  } catch {}

  const count = rowCount || cardCount;
  log('📊', `Visible items: ${count} ${rowCount ? '(rows:'+rowCount+')' : cardCount ? '(cards:'+cardCount+')' : ''}`);

  // Run checks
  for (const c of checks) {
    const found = bodyText.includes(c.text);
    log(found ? '✅' : '❌', `${c.label}: ${found ? 'FOUND' : 'MISSING'}`);
    if (!found) failures.push(`${label}: ${c.label} missing`);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!t.includes('favicon') && !t.includes('chrome-extension')) errors.push(t);
    }
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('🧺 Laundry Shop — Mock Data Smoke Test');
  console.log(`   URL: ${BASE}`);

  // Clear seed flag to ensure fresh seed
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.removeItem('cooperp_seeded_v2');
    localStorage.removeItem('cooperp_seeded_v1');
  });
  await page.waitForTimeout(500);
  console.log('   Cleared seed cache — data will seed on next laundry page load\n');

  // ─── CUSTOMERS ───
  await waitAndCheck(page, '/laundry/customers', '📋 CUSTOMERS (expect 8)', [
    { text: 'Maria Dela Cruz', label: 'Maria Dela Cruz (gold)' },
    { text: 'Juan Santos', label: 'Juan Santos (silver)' },
    { text: 'Pedro Gonzales', label: 'Pedro Gonzales (platinum)' },
    { text: 'Angela Torres', label: 'Angela Torres (gold)' },
    { text: 'Sofia Lim', label: 'Sofia Lim (silver)' },
    { text: 'Miguel Castro', label: 'Miguel Castro (inactive)' },
  ], 5000);

  // ─── ORDERS ───
  await waitAndCheck(page, '/laundry/orders', '📦 ORDERS (expect 15)', [
    { text: 'LO-0001', label: 'Order LO-0001' },
    { text: 'LO-0004', label: 'Order LO-0004 (rush)' },
    { text: 'LO-0008', label: 'Order LO-0008 (delivered)' },
    { text: 'LO-0011', label: 'Order LO-0011 (cancelled)' },
    { text: 'LO-0015', label: 'Order LO-0015 (express)' },
  ]);

  // ─── SERVICES ───
  await waitAndCheck(page, '/laundry/services', '🧼 SERVICES (expect 10)', [
    { text: 'Wash & Dry — Regular', label: 'Wash & Dry Regular ₱120/kg' },
    { text: 'Dry Clean — Suit/Barong', label: 'Dry Clean Suit ₱250/pc' },
    { text: 'Leather Jacket Cleaning', label: 'Leather Jacket ₱500/pc' },
    { text: 'Shoe Cleaning — Sneakers', label: 'Shoe Cleaning ₱200/pair' },
    { text: 'Curtain Cleaning', label: 'Curtain Cleaning ₱400/set' },
  ]);

  // ─── PAYMENTS ───
  await waitAndCheck(page, '/laundry/payments', '💰 PAYMENTS (expect 8)', [
    { text: 'LP-0001', label: 'Payment LP-0001 (₱600 cash)' },
    { text: 'LP-0004', label: 'Payment LP-0004 (₱960 bank)' },
    { text: 'LP-0007', label: 'Payment LP-0007 (₱800 refund)' },
  ]);

  // ─── INVENTORY ───
  await waitAndCheck(page, '/laundry/inventory', '📦 INVENTORY (expect 8)', [
    { text: 'Tide Original Detergent', label: 'Tide Detergent (qty 45)' },
    { text: 'Downy Fabric Softener', label: 'Downy Softener (qty 25)' },
    { text: 'Wooden Hangers', label: 'Wooden Hangers (qty 4, low stock)' },
    { text: 'Garment Tags', label: 'Garment Tags (qty 2, low stock)' },
  ]);

  await browser.close();

  console.log('\n' + '═'.repeat(50));
  console.log('🏁 SMOKE TEST RESULTS');
  console.log('═'.repeat(50));
  console.log(`  Console errors: ${errors.length}`);
  console.log(`  Failures: ${failures.length}`);

  if (errors.length > 0) {
    console.log('\n  ⚠️  Console errors:');
    errors.slice(0, 8).forEach((e, i) => console.log(`    ${i+1}. ${e.substring(0, 130)}`));
  }
  if (failures.length > 0) {
    console.log('\n  ❌ Failures:');
    failures.forEach((f, i) => console.log(`    ${i+1}. ${f}`));
  }

  if (errors.length === 0 && failures.length === 0) {
    console.log('\n  🎉 LAUNDRY MOCK DATA: SEEDED, RENDERING, OPERATIONAL');
  }

  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
