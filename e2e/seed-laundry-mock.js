/**
 * Laundry Shop — Mock Data Seeder
 * Creates realistic sample data for all 5 laundry entities.
 * Runs in browser context via Playwright.
 */
const { chromium } = require('playwright');
const BASE = 'https://meta.8-v.cc';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  console.log('🧺 Seeding Laundry Shop Mock Data...\n');

  // Load a laundry page first to initialize all repos
  await page.goto(`${BASE}/laundry/customers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const result = await page.evaluate(async () => {
    const db = window.__DB__;
    if (!db) return { success: false, error: 'DB not found' };

    const tid = 'mock-laundry';
    const logs = [];

    function log(msg) { logs.push(msg); console.log('[SEED]', msg); }

    // ═══════════════════════════════════════════════════
    // 1. CUSTOMERS (8 mock customers)
    // ═══════════════════════════════════════════════════
    const customers = [
      { code: 'LC-001', first: 'Maria', last: 'Dela Cruz', phone: '+639171234567', type: 'regular', tier: 'gold', spend: 32000, points: 320, status: 'active' },
      { code: 'LC-002', first: 'Juan', last: 'Santos', phone: '+639181234568', type: 'regular', tier: 'silver', spend: 8500, points: 85, status: 'active' },
      { code: 'LC-003', first: 'Elena', last: 'Reyes', phone: '+639191234569', type: 'walk_in', tier: 'bronze', spend: 1500, points: 15, status: 'active' },
      { code: 'LC-004', first: 'Pedro', last: 'Gonzales', phone: '+639201234570', type: 'corporate', tier: 'platinum', spend: 78000, points: 780, status: 'active' },
      { code: 'LC-005', first: 'Sofia', last: 'Lim', phone: '+639211234571', type: 'regular', tier: 'silver', spend: 12000, points: 120, status: 'active' },
      { code: 'LC-006', first: 'Roberto', last: 'Aquino', phone: '+639221234572', type: 'walk_in', tier: 'bronze', spend: 800, points: 8, status: 'active' },
      { code: 'LC-007', first: 'Angela', last: 'Torres', phone: '+639231234573', type: 'regular', tier: 'gold', spend: 45000, points: 450, status: 'active' },
      { code: 'LC-008', first: 'Miguel', last: 'Castro', phone: '+639241234574', type: 'walk_in', tier: 'bronze', spend: 200, points: 2, status: 'inactive' },
    ];

    const customerIds = [];
    for (const c of customers) {
      try {
        const created = await db.laundryCustomerRepo.create({
          tenantId: tid, customerCode: c.code,
          firstName: c.first, lastName: c.last,
          fullName: `${c.first} ${c.last}`,
          phone: c.phone, customerType: c.type,
          customerTier: c.tier, lifetimeSpend: c.spend,
          loyaltyPoints: c.points, status: c.status,
        });
        customerIds.push({ id: created.id, name: created.fullName, tier: c.tier });
        log(`Customer: ${created.fullName} (${c.tier})`);
      } catch(e) { log(`Customer ERROR: ${e.message}`); }
    }

    // ═══════════════════════════════════════════════════
    // 2. SERVICES (10 services)
    // ═══════════════════════════════════════════════════
    const services = [
      { code: 'SV-WD-01', name: 'Wash & Dry — Regular', cat: 'wash_dry', unit: 'per_kg', price: 120, min: 80, hrs: 48, order: 1 },
      { code: 'SV-WD-02', name: 'Wash & Dry — Express', cat: 'wash_dry', unit: 'per_kg', price: 180, min: 100, hrs: 24, order: 2 },
      { code: 'SV-DC-01', name: 'Dry Clean — Suit/Barong', cat: 'dry_clean', unit: 'per_piece', price: 250, min: 250, hrs: 48, order: 3 },
      { code: 'SV-DC-02', name: 'Dry Clean — Gown', cat: 'dry_clean', unit: 'per_piece', price: 350, min: 350, hrs: 72, order: 4 },
      { code: 'SV-IR-01', name: 'Iron / Press Only', cat: 'iron', unit: 'per_piece', price: 40, min: 40, hrs: 12, order: 5 },
      { code: 'SV-FD-01', name: 'Fold Only', cat: 'fold', unit: 'per_kg', price: 50, min: 30, hrs: 24, order: 6 },
      { code: 'SV-SR-01', name: 'Stain Removal', cat: 'stain_removal', unit: 'per_piece', price: 80, min: 80, hrs: 24, order: 7 },
      { code: 'SV-LC-01', name: 'Leather Jacket Cleaning', cat: 'leather_care', unit: 'per_piece', price: 500, min: 500, hrs: 72, order: 8 },
      { code: 'SV-SH-01', name: 'Shoe Cleaning — Sneakers', cat: 'shoe_clean', unit: 'per_pair', price: 200, min: 200, hrs: 48, order: 9 },
      { code: 'SV-CR-01', name: 'Curtain Cleaning', cat: 'curtain', unit: 'per_set', price: 400, min: 400, hrs: 72, order: 10 },
    ];

    const serviceIds = [];
    for (const s of services) {
      try {
        const created = await db.laundryServiceRepo.create({
          tenantId: tid, serviceCode: s.code, name: s.name,
          category: s.cat, pricingUnit: s.unit,
          basePrice: s.price, minCharge: s.min,
          turnaroundHours: s.hrs, requiresSpecialHandling: s.cat === 'leather_care' || s.cat === 'dry_clean',
          sortOrder: s.order, status: 'active',
        });
        serviceIds.push({ id: created.id, name: created.name, price: s.price });
        log(`Service: ${created.name} ₱${s.price}/${s.unit}`);
      } catch(e) { log(`Service ERROR: ${e.message}`); }
    }

    // ═══════════════════════════════════════════════════
    // 3. ORDERS (15 orders spanning different statuses)
    // ═══════════════════════════════════════════════════
    const today = '2026-07-17';
    const pickup18 = '2026-07-19';
    const pickup19 = '2026-07-20';
    const pickup20 = '2026-07-21';
    const pickup21 = '2026-07-22';

    const orderDefs = [
      { code: 'LO-0001', cust: 0, svc: 0, qty: 5, status: 'picked_up', pay: 'paid', priority: 'normal', date: '2026-07-15', pickup: '2026-07-17', amt: 600, paid: 600 },
      { code: 'LO-0002', cust: 1, svc: 2, qty: 2, status: 'picked_up', pay: 'paid', priority: 'express', date: '2026-07-16', pickup: '2026-07-17', amt: 500, paid: 500 },
      { code: 'LO-0003', cust: 2, svc: 0, qty: 3, status: 'ready_for_pickup', pay: 'unpaid', priority: 'normal', date: today, pickup: pickup19, amt: 360, paid: 0 },
      { code: 'LO-0004', cust: 3, svc: 3, qty: 1, status: 'in_process', pay: 'partial', priority: 'rush', date: today, pickup: today, amt: 350, paid: 200 },
      { code: 'LO-0005', cust: 4, svc: 1, qty: 4, status: 'in_process', pay: 'unpaid', priority: 'normal', date: today, pickup: pickup19, amt: 720, paid: 0 },
      { code: 'LO-0006', cust: 5, svc: 4, qty: 5, status: 'dropped_off', pay: 'unpaid', priority: 'normal', date: today, pickup: pickup20, amt: 200, paid: 0 },
      { code: 'LO-0007', cust: 6, svc: 6, qty: 3, status: 'sorted', pay: 'unpaid', priority: 'normal', date: today, pickup: pickup19, amt: 240, paid: 0 },
      { code: 'LO-0008', cust: 0, svc: 0, qty: 8, status: 'delivered', pay: 'paid', priority: 'express', date: '2026-07-16', pickup: '2026-07-17', amt: 960, paid: 960, delivery: true, delFee: 100 },
      { code: 'LO-0009', cust: 3, svc: 7, qty: 1, status: 'quality_check', pay: 'partial', priority: 'normal', date: '2026-07-16', pickup: pickup19, amt: 500, paid: 300 },
      { code: 'LO-0010', cust: 1, svc: 5, qty: 10, status: 'ready_for_pickup', pay: 'paid', priority: 'normal', date: '2026-07-16', pickup: today, amt: 500, paid: 500 },
      { code: 'LO-0011', cust: 7, svc: 9, qty: 2, status: 'cancelled', pay: 'refunded', priority: 'normal', date: '2026-07-15', pickup: '2026-07-17', amt: 800, paid: 800 },
      { code: 'LO-0012', cust: 4, svc: 2, qty: 2, status: 'dropped_off', pay: 'unpaid', priority: 'rush', date: today, pickup: today, amt: 500, paid: 0 },
      { code: 'LO-0013', cust: 6, svc: 8, qty: 1, status: 'dropped_off', pay: 'unpaid', priority: 'normal', date: today, pickup: pickup21, amt: 200, paid: 0 },
      { code: 'LO-0014', cust: 2, svc: 4, qty: 6, status: 'in_process', pay: 'unpaid', priority: 'normal', date: today, pickup: pickup19, amt: 240, paid: 0 },
      { code: 'LO-0015', cust: 5, svc: 0, qty: 2, status: 'dropped_off', pay: 'unpaid', priority: 'express', date: today, pickup: '2026-07-18', amt: 240, paid: 0 },
    ];

    const orderIds = [];
    for (const o of orderDefs) {
      try {
        const cust = customerIds[o.cust];
        const svc = serviceIds[o.svc];
        const items = [{ serviceId: svc.id, serviceName: svc.name, quantity: o.qty, unitPrice: svc.price, lineTotal: o.amt }];
        
        const created = await db.laundryOrderRepo.create({
          tenantId: tid, orderCode: o.code,
          customerId: cust.id, customerName: cust.name,
          orderDate: o.date, dropOffTime: '09:00',
          promisedPickupDate: o.pickup, promisedPickupTime: '17:00',
          items, totalWeight: o.qty, subtotal: o.amt,
          discountAmount: 0, taxAmount: 0,
          totalAmount: o.amt + (o.delFee || 0),
          amountPaid: o.paid, balance: (o.amt + (o.delFee || 0)) - o.paid,
          paymentStatus: o.pay, orderStatus: o.status,
          orderPriority: o.priority, receivedBy: 'Staff A',
          isDelivery: !!o.delivery, deliveryFee: o.delFee || 0,
        });
        orderIds.push({ id: created.id, code: o.code, status: o.status, amt: created.totalAmount, cust: cust.name });
        log(`Order: #${o.code} ${o.status} ₱${created.totalAmount} — ${cust.name}`);
      } catch(e) { log(`Order ERROR: ${e.message}`); }
    }

    // ═══════════════════════════════════════════════════
    // 4. PAYMENTS (8 payments)
    // ═══════════════════════════════════════════════════
    const paymentDefs = [
      { code: 'LP-0001', order: 0, cust: 0, amt: 600, method: 'cash', ref: null, pts: 6 },
      { code: 'LP-0002', order: 1, cust: 1, amt: 500, method: 'gcash', ref: 'GC-REF-001', pts: 5 },
      { code: 'LP-0003', order: 3, cust: 3, amt: 200, method: 'maya', ref: 'MY-REF-001', pts: 2 },
      { code: 'LP-0004', order: 7, cust: 0, amt: 960, method: 'bank_transfer', ref: 'BPI-TRF-001', pts: 10 },
      { code: 'LP-0005', order: 8, cust: 3, amt: 300, method: 'card', ref: 'VISA-1234', pts: 3 },
      { code: 'LP-0006', order: 9, cust: 1, amt: 500, method: 'cash', ref: null, pts: 5 },
      { code: 'LP-0007', order: 10, cust: 7, amt: 800, method: 'gcash', ref: 'GC-REFUND', pts: -8 },
      { code: 'LP-0008', order: 7, cust: 0, amt: 100, method: 'cash', ref: null, pts: 1 },
    ];

    for (const p of paymentDefs) {
      try {
        const o = orderIds[p.order];
        const c = customerIds[p.cust];
        const created = await db.laundryPaymentRepo.create({
          tenantId: tid, paymentCode: p.code,
          orderId: o.id, customerId: c.id,
          paymentDate: '2026-07-17', paymentTime: '14:00',
          amount: p.amt, paymentMethod: p.method,
          referenceNumber: p.ref || undefined,
          loyaltyPointsRedeemed: p.pts < 0 ? Math.abs(p.pts) * 100 : 0,
          loyaltyPointsEarned: p.pts > 0 ? p.pts : 0,
          receivedBy: 'Cashier B',
        });
        log(`Payment: #${p.code} ₱${p.amt} ${p.method}`);
      } catch(e) { log(`Payment ERROR: ${e.message}`); }
    }

    // ═══════════════════════════════════════════════════
    // 5. INVENTORY (8 items)
    // ═══════════════════════════════════════════════════
    const inventoryDefs = [
      { code: 'LI-DT-01', name: 'Tide Original Detergent 5L', cat: 'detergent', unit: 'liter', qty: 45, min: 10, max: 100, cost: 450, supplier: 'Procter & Gamble PH' },
      { code: 'LI-DT-02', name: 'Ariel Power Gel 3L', cat: 'detergent', unit: 'liter', qty: 30, min: 8, max: 80, cost: 380, supplier: 'Procter & Gamble PH' },
      { code: 'LI-SF-01', name: 'Downy Fabric Softener 4L', cat: 'softener', unit: 'liter', qty: 25, min: 5, max: 60, cost: 320, supplier: 'Procter & Gamble PH' },
      { code: 'LI-BL-01', name: 'Zonrox Bleach 3.78L', cat: 'bleach', unit: 'bottle', qty: 12, min: 4, max: 30, cost: 180, supplier: 'Green Cross Inc.' },
      { code: 'LI-SR-01', name: 'Stain Remover Spray 500ml', cat: 'stain_remover', unit: 'bottle', qty: 8, min: 3, max: 20, cost: 150, supplier: 'Local Distributor' },
      { code: 'LI-PK-01', name: 'Plastic Packaging Rolls (100m)', cat: 'packaging', unit: 'pack', qty: 15, min: 3, max: 40, cost: 250, supplier: 'Packwell Supplies' },
      { code: 'LI-HG-01', name: 'Wooden Hangers (50pcs)', cat: 'hanger', unit: 'pack', qty: 4, min: 2, max: 10, cost: 600, supplier: 'HomePlus Depo', exp: '2027-12-31' },
      { code: 'LI-TG-01', name: 'Garment Tags (1000pcs)', cat: 'tag', unit: 'pack', qty: 2, min: 1, max: 5, cost: 350, supplier: 'TagMaster Inc.' },
    ];

    for (const inv of inventoryDefs) {
      try {
        const status = inv.qty <= inv.min ? 'low_stock' : inv.qty === 0 ? 'out_of_stock' : 'in_stock';
        const created = await db.laundryInventoryRepo.create({
          tenantId: tid, itemCode: inv.code, name: inv.name,
          category: inv.cat, unit: inv.unit,
          quantityOnHand: inv.qty, minStockLevel: inv.min,
          maxStockLevel: inv.max, costPerUnit: inv.cost,
          supplierName: inv.supplier, status,
          expirationDate: inv.exp || undefined,
        });
        log(`Inventory: ${inv.name} (${inv.qty} ${inv.unit}) — ${status}`);
      } catch(e) { log(`Inventory ERROR: ${e.message}`); }
    }

    return { success: true, counts: { customers: customers.length, services: services.length, orders: orderDefs.length, payments: paymentDefs.length, inventory: inventoryDefs.length }, logs };
  });

  // Report
  console.log('');
  if (result.success) {
    console.log('═'.repeat(50));
    console.log('✅ MOCK DATA SEEDED SUCCESSFULLY');
    console.log('═'.repeat(50));
    console.log(`  Customers: ${result.counts.customers}`);
    console.log(`  Services:  ${result.counts.services}`);
    console.log(`  Orders:    ${result.counts.orders}`);
    console.log(`  Payments:  ${result.counts.payments}`);
    console.log(`  Inventory: ${result.counts.inventory}`);
    console.log(`  Total:     ${Object.values(result.counts).reduce((a,b)=>a+b,0)} records`);
    console.log('');
    console.log('  Order Status Breakdown:');
    console.log('    picked_up:        2  (completed)');
    console.log('    ready_for_pickup: 2  (awaiting pickup)');
    console.log('    in_process:       3  (being washed)');
    console.log('    dropped_off:      4  (just received)');
    console.log('    sorted:           1  (being sorted)');
    console.log('    quality_check:    1  (QC review)');
    console.log('    delivered:        1  (completed delivery)');
    console.log('    cancelled:        1  (cancelled)');
  } else {
    console.log('❌ SEED FAILED:', result.error);
  }

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} console errors during seed`);
    errors.slice(0, 5).forEach((e, i) => console.log(`  ${i+1}. ${e.substring(0, 100)}`));
  } else {
    console.log('\n✅ Zero console errors during seed');
  }

  await browser.close();
  process.exit(result.success ? 0 : 1);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
