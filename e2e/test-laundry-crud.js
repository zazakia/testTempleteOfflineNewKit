/**
 * Laundry Shop — Full CRUD E2E Test (robust version)
 */
const { chromium } = require('playwright');
const BASE = 'https://meta.8-v.cc';

const failures = [];
const allErrors = [];

function log(icon, msg) { console.log(`  ${icon} ${msg}`); }

async function safeText(page, selector, fallback) {
  try { return await page.textContent(selector, { timeout: 3000 }); }
  catch { return fallback; }
}

async function safe$(page, selector) {
  try { return await page.$(selector); }
  catch { return null; }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!t.includes('favicon') && !t.includes('chrome-extension')) allErrors.push(t);
    }
  });
  page.on('pageerror', err => allErrors.push(err.message));

  console.log('🧺 Laundry Shop — Full CRUD Validation');
  console.log(`   URL: ${BASE}\n`);

  // ═════════════════════════════════════════════════════
  // 1. PAGE RENDERING — ALL 5 ENTITY PAGES
  // ═════════════════════════════════════════════════════
  console.log('─'.repeat(50));
  console.log('📋 PAGE RENDERING CHECK');
  console.log('─'.repeat(50));

  const pages = [
    { path: '/laundry/customers', name: 'Customers' },
    { path: '/laundry/orders', name: 'Orders' },
    { path: '/laundry/services', name: 'Services' },
    { path: '/laundry/payments', name: 'Payments' },
    { path: '/laundry/inventory', name: 'Inventory' },
  ];

  for (const p of pages) {
    const startErrors = allErrors.length;
    await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);

    // Check for Dexie schema errors
    const newErrors = allErrors.slice(startErrors);
    const dexieErr = newErrors.find(e => e.includes('Dexie') || e.includes('not defined'));

    // Check page has content
    const bodyText = await safeText(page, 'body', '');
    const hasContent = bodyText && bodyText.length > 50;

    if (dexieErr) {
      log('❌', `${p.name}: Dexie schema error — ${dexieErr.substring(0, 80)}`);
      failures.push(`${p.name}: ${dexieErr}`);
    } else if (!hasContent) {
      log('⚠️', `${p.name}: Page loaded but minimal content (${bodyText.length} chars)`);
    } else {
      // Check for meaningful content
      const tableExists = await safe$(page, 'table');
      const gridExists = await safe$(page, '.grid');
      const heading = await safeText(page, 'h1, h2, h3', '');
      log('✅', `${p.name}: renders OK ${heading ? '- "' + heading.trim().substring(0,40) + '"' : ''} ${tableExists ? '(table)' : gridExists ? '(grid)' : '(content)'}`);
    }
  }

  // ═════════════════════════════════════════════════════
  // 2. CRUD OPERATIONS (via IndexedDB)
  // ═════════════════════════════════════════════════════
  console.log('\n' + '─'.repeat(50));
  console.log('✏️ CRUD OPERATIONS (IndexedDB via repos)');
  console.log('─'.repeat(50));

  // Navigate to a page that loads all repos first
  await page.goto(`${BASE}/laundry/customers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const crudResults = await page.evaluate(async () => {
    const results = [];
    const w = window;
    const db = w.__DB__;
    if (!db) return [{ op: 'setup', pass: false, detail: 'window.__DB__ not found' }];

    const tid = 'smoke-test';
    const now = Date.now();

    function ok(op, pass, detail) { results.push({ op, pass, detail: String(detail || '') }); }

    // ── CUSTOMER CRUD ──
    try {
      const c = await db.laundryCustomerRepo.create({
        tenantId: tid, customerCode: 'TEST-C1', firstName: 'Anna', lastName: 'Test',
        fullName: 'Anna Test', phone: '+639990000001', customerType: 'regular',
        customerTier: 'bronze', lifetimeSpend: 0, loyaltyPoints: 0, status: 'active',
      });
      ok('CREATE customer', !!c, c ? c.id.substring(0,8) : 'null');

      if (c) {
        const r = await db.laundryCustomerRepo.findById(c.id);
        ok('READ customer', r?.fullName === 'Anna Test', r?.fullName);

        const u = await db.laundryCustomerRepo.update(c.id, {
          lastName: 'Test-Updated', fullName: 'Anna Test-Updated',
          customerTier: 'silver', lifetimeSpend: 6000, version: c.version,
        });
        ok('UPDATE customer', u?.fullName === 'Anna Test-Updated' && u?.customerTier === 'silver', u?.fullName);

        await db.laundryCustomerRepo.delete(c.id);
        const d = await db.laundryCustomerRepo.findById(c.id);
        ok('DELETE customer (soft)', d === null, d === null ? 'null' : 'still exists');
      }
    } catch(e) { ok('CUSTOMER CRUD', false, e.message); }

    // ── SERVICE CRUD ──
    try {
      const s = await db.laundryServiceRepo.create({
        tenantId: tid, serviceCode: 'TEST-S1', name: 'Test Wash Service',
        category: 'wash_dry', pricingUnit: 'per_kg', basePrice: 100, minCharge: 50,
        turnaroundHours: 24, requiresSpecialHandling: false, sortOrder: 1, status: 'active',
      });
      ok('CREATE service', !!s, s ? s.name : 'null');

      if (s) {
        const r = await db.laundryServiceRepo.findById(s.id);
        ok('READ service', r?.basePrice === 100, '₱' + r?.basePrice);

        const u = await db.laundryServiceRepo.update(s.id, { basePrice: 150, turnaroundHours: 12, version: s.version });
        ok('UPDATE service', u?.basePrice === 150 && u?.turnaroundHours === 12, '₱' + u?.basePrice + ' / ' + u?.turnaroundHours + 'h');

        await db.laundryServiceRepo.delete(s.id);
        ok('DELETE service', await db.laundryServiceRepo.findById(s.id) === null, 'null');
      }
    } catch(e) { ok('SERVICE CRUD', false, e.message); }

    // ── ORDER CRUD ──
    try {
      // Need customer first
      const cust = await db.laundryCustomerRepo.create({
        tenantId: tid, customerCode: 'TEST-OC1', firstName: 'Order', lastName: 'Customer',
        fullName: 'Order Customer', phone: '+639990000002', customerType: 'walk_in',
        customerTier: 'bronze', lifetimeSpend: 0, loyaltyPoints: 0, status: 'active',
      });

      const o = await db.laundryOrderRepo.create({
        tenantId: tid, orderCode: 'TEST-O1', customerId: cust.id, customerName: cust.fullName,
        orderDate: '2026-07-17', dropOffTime: '08:00',
        promisedPickupDate: '2026-07-19', promisedPickupTime: '08:00',
        items: [{ serviceId: 's1', serviceName: 'Wash', quantity: 2, unitPrice: 100, lineTotal: 200 }],
        subtotal: 200, discountAmount: 0, taxAmount: 0, totalAmount: 200,
        amountPaid: 0, balance: 200, paymentStatus: 'unpaid', orderStatus: 'dropped_off',
        orderPriority: 'normal', receivedBy: 'Staff', isDelivery: false, deliveryFee: 0,
      });
      ok('CREATE order', !!o, o ? '#' + o.orderCode + ' ₱' + o.totalAmount : 'null');

      if (o) {
        const r = await db.laundryOrderRepo.findById(o.id);
        ok('READ order', r?.balance === 200, 'balance ₱' + r?.balance);

        const u = await db.laundryOrderRepo.update(o.id, {
          orderStatus: 'ready_for_pickup', amountPaid: 200, balance: 0,
          paymentStatus: 'paid', version: o.version,
        });
        ok('UPDATE order', u?.orderStatus === 'ready_for_pickup' && u?.balance === 0, u?.orderStatus + ' / paid');
      }
    } catch(e) { ok('ORDER CRUD', false, e.message); }

    // ── PAYMENT CRUD ──
    try {
      const p = await db.laundryPaymentRepo.create({
        tenantId: tid, paymentCode: 'TEST-P1', orderId: 'test-o', customerId: 'test-c',
        paymentDate: '2026-07-17', paymentTime: '10:00', amount: 200,
        paymentMethod: 'cash', loyaltyPointsRedeemed: 0, loyaltyPointsEarned: 2,
        receivedBy: 'Cashier',
      });
      ok('CREATE payment', !!p, p ? '₱' + p.amount + ' ' + p.paymentMethod : 'null');

      if (p) {
        const r = await db.laundryPaymentRepo.findById(p.id);
        ok('READ payment', r?.amount === 200, '₱' + r?.amount);

        await db.laundryPaymentRepo.delete(p.id);
        ok('DELETE payment', await db.laundryPaymentRepo.findById(p.id) === null, 'null');
      }
    } catch(e) { ok('PAYMENT CRUD', false, e.message); }

    // ── INVENTORY CRUD ──
    try {
      const inv = await db.laundryInventoryRepo.create({
        tenantId: tid, itemCode: 'TEST-I1', name: 'Test Detergent',
        category: 'detergent', unit: 'liter', quantityOnHand: 30,
        minStockLevel: 5, maxStockLevel: 60, costPerUnit: 300,
        supplierName: 'Test Supplier', status: 'in_stock',
      });
      ok('CREATE inventory', !!inv, inv ? inv.name + ' qty:' + inv.quantityOnHand : 'null');

      if (inv) {
        const r = await db.laundryInventoryRepo.findById(inv.id);
        ok('READ inventory', r?.quantityOnHand === 30, 'qty:' + r?.quantityOnHand);

        const u = await db.laundryInventoryRepo.update(inv.id, {
          quantityOnHand: 3, version: inv.version,
        });
        ok('UPDATE inventory', u?.quantityOnHand === 3, '30→3 (below min ' + u?.minStockLevel + ')');

        const u2 = await db.laundryInventoryRepo.update(inv.id, {
          quantityOnHand: 0, version: u.version,
        });
        ok('UPDATE inventory (zero)', u2?.quantityOnHand === 0, 'qty:0 → out of stock');
      }
    } catch(e) { ok('INVENTORY CRUD', false, e.message); }

    return results;
  });

  console.log('');
  let pass = 0, fail = 0;
  for (const r of crudResults) {
    if (r.pass) { pass++; log('✅', `${r.op}: ${r.detail}`); }
    else { fail++; log('❌', `${r.op}: ${r.detail}`); failures.push(`CRUD ${r.op}: ${r.detail}`); }
  }
  console.log(`\n  CRUD: ${pass} passed, ${fail} failed`);

  // ═════════════════════════════════════════════════════
  // 3. REPOSITORY INTEGRITY CHECK
  // ═════════════════════════════════════════════════════
  console.log('\n' + '─'.repeat(50));
  console.log('🔍 REPOSITORY INTEGRITY');
  console.log('─'.repeat(50));

  const repoCheck = await page.evaluate(() => {
    const w = window;
    const db = w.__DB__;
    if (!db) return [{ repo: '__DB__', hasFindMany: false }];

    const repos = {
      laundryCustomerRepo: 'laundry_customers',
      laundryServiceRepo: 'laundry_services',
      laundryOrderRepo: 'laundry_orders',
      laundryPaymentRepo: 'laundry_payments',
      laundryInventoryRepo: 'laundry_inventory',
    };

    return Object.entries(repos).map(([key, tableName]) => ({
      repo: key,
      table: tableName,
      exists: !!db[key],
      hasCreate: typeof db[key]?.create === 'function',
      hasFindMany: typeof db[key]?.findMany === 'function',
      hasFindById: typeof db[key]?.findById === 'function',
      hasUpdate: typeof db[key]?.update === 'function',
      hasDelete: typeof db[key]?.delete === 'function',
    }));
  });

  for (const r of repoCheck) {
    const allMethods = r.hasCreate && r.hasFindMany && r.hasFindById && r.hasUpdate && r.hasDelete;
    if (allMethods) {
      log('✅', `${r.repo}: full CRUD (create/read/update/delete)`);
    } else {
      const missing = [];
      if (!r.hasCreate) missing.push('create');
      if (!r.hasFindMany) missing.push('findMany');
      if (!r.hasFindById) missing.push('findById');
      if (!r.hasUpdate) missing.push('update');
      if (!r.hasDelete) missing.push('delete');
      log('❌', `${r.repo}: MISSING: ${missing.join(', ')}`);
      failures.push(`${r.repo}: missing ${missing.join(', ')}`);
    }
  }

  // ═════════════════════════════════════════════════════
  // 4. NAVIGATION CONSISTENCY
  // ═════════════════════════════════════════════════════
  console.log('\n' + '─'.repeat(50));
  console.log('🔗 NAVIGATION STRESS TEST');
  console.log('─'.repeat(50));

  const cycles = [
    ['/laundry/customers', '/laundry/orders', '/laundry/services'],
    ['/laundry/orders', '/members', '/laundry/payments'],
    ['/laundry/inventory', '/clinic/patients', '/laundry/customers'],
  ];

  for (const cycle of cycles) {
    const startErrs = allErrors.length;
    for (const path of cycle) {
      await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(600);
    }
    const newErrs = allErrors.length - startErrs;
    log(newErrs === 0 ? '✅' : '❌', `${cycle.join(' → ')}: ${newErrs === 0 ? 'no errors' : newErrs + ' errors'}`);
    if (newErrs > 0) failures.push(`Navigation cycle errors: ${newErrs}`);
  }

  await browser.close();

  // ═════════════════════════════════════════════════════
  // FINAL
  // ═════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(50));
  console.log('🏁 LAUNDRY SHOP VERDICT');
  console.log('═'.repeat(50));
  console.log(`  Console errors: ${allErrors.length}`);
  console.log(`  Failures: ${failures.length}`);
  console.log(`  CRUD: ${pass} passed, ${fail} failed`);

  if (allErrors.length > 0) {
    console.log('\n  ⚠️  Console errors:');
    allErrors.slice(0, 10).forEach((e, i) => console.log(`    ${i+1}. ${e.substring(0, 150)}`));
  }
  if (failures.length > 0) {
    console.log('\n  ❌ Failures:');
    failures.forEach((f, i) => console.log(`    ${i+1}. ${f}`));
  }

  if (allErrors.length === 0 && failures.length === 0) {
    console.log('\n  🎉 LAUNDRY SHOP SYSTEM: FULLY OPERATIONAL & ERROR-FREE');
  }

  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
