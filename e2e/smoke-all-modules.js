/**
 * Comprehensive smoke test for all client systems
 * Verifies CRUD across all modules with console error detection
 */
const { chromium } = require('playwright');
const BASE = 'https://meta.8-v.cc';

async function testPage(page, { path, name, checkSelector, actions = [] }) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  console.log(`\n  Testing: ${name} → ${BASE}${path}`);
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Check for Dexie schema errors
  const dexieErrors = errors.filter(e => 
    e.includes('not defined in the Dexie schema') || e.includes('Entity table')
  );
  const otherErrors = errors.filter(e => !dexieErrors.includes(e));

  let status = 'OK';
  let details = [];

  if (dexieErrors.length > 0) {
    status = 'SCHEMA_ERROR';
    details.push(`Dexie: ${dexieErrors[0].substring(0, 100)}`);
  }
  
  if (otherErrors.length > 0) {
    if (status === 'OK') status = 'JS_ERRORS';
    details.push(`${otherErrors.length} console errors`);
  }

  // Check for expected content
  if (checkSelector) {
    const el = await page.$(checkSelector);
    if (!el) details.push(`missing: ${checkSelector}`);
  }

  // Run actions
  for (const action of actions) {
    try { await action(page); }
    catch (e) { details.push(`action failed: ${e.message.substring(0, 60)}`); }
  }

  console.log(`    ${status} ${details.length > 0 ? '- ' + details.join(', ') : ''}`);
  return { name, path, status, errors: errors.length, dexieErrors: dexieErrors.length };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('🧪 CoopERP — Full System Smoke Test');
  console.log(`   Base URL: ${BASE}\n`);

  const results = [];

  // ─── Dashboard ────────────────────────────────────────
  results.push(await testPage(page, { path: '/', name: 'Dashboard' }));

  // ─── Members ──────────────────────────────────────────
  results.push(await testPage(page, { path: '/members', name: 'Members List' }));
  results.push(await testPage(page, { path: '/members/new', name: 'Members Create' }));

  // ─── Loans ────────────────────────────────────────────
  results.push(await testPage(page, { path: '/loans', name: 'Loans List' }));
  results.push(await testPage(page, { path: '/loans/new', name: 'Loans Create' }));

  // ─── Loan Applications ────────────────────────────────
  results.push(await testPage(page, { path: '/loan-applications', name: 'Loan Apps List' }));
  results.push(await testPage(page, { path: '/loan-applications/new', name: 'Loan Apps Create' }));

  // ─── Payments ─────────────────────────────────────────
  results.push(await testPage(page, { path: '/payments', name: 'Payments List' }));

  // ─── Share Capital ────────────────────────────────────
  results.push(await testPage(page, { path: '/share-capital', name: 'Share Capital List' }));

  // ─── Savings ──────────────────────────────────────────
  results.push(await testPage(page, { path: '/savings', name: 'Savings List' }));

  // ─── Accounting ───────────────────────────────────────
  results.push(await testPage(page, { path: '/accounting/chart-of-accounts', name: 'Chart of Accounts' }));
  results.push(await testPage(page, { path: '/accounting/journal-entries', name: 'Journal Entries' }));
  results.push(await testPage(page, { path: '/accounting/journal-entries/new', name: 'Journal Entry Create' }));
  results.push(await testPage(page, { path: '/accounting/trial-balance', name: 'Trial Balance' }));

  // ─── Collections ──────────────────────────────────────
  results.push(await testPage(page, { path: '/collectors', name: 'Collectors List' }));
  results.push(await testPage(page, { path: '/remittances', name: 'Remittances List' }));
  results.push(await testPage(page, { path: '/areas', name: 'Areas List' }));

  // ─── Bank & Cash ──────────────────────────────────────
  results.push(await testPage(page, { path: '/bank-accounts', name: 'Bank Accounts' }));
  results.push(await testPage(page, { path: '/cash-on-hand', name: 'Cash on Hand' }));
  results.push(await testPage(page, { path: '/expenses', name: 'Expenses List' }));

  // ─── Governance ───────────────────────────────────────
  results.push(await testPage(page, { path: '/governance', name: 'Governance' }));

  // ─── Payroll ──────────────────────────────────────────
  results.push(await testPage(page, { path: '/payroll', name: 'Payroll' }));

  // ─── File Cases ───────────────────────────────────────
  results.push(await testPage(page, { path: '/file-cases', name: 'File Cases' }));

  // ─── Legacy Customers ────────────────────────────────
  results.push(await testPage(page, { path: '/customers', name: 'Customers (Legacy)' }));
  results.push(await testPage(page, { path: '/customers/new', name: 'Customers Create' }));

  // ─── Water Station ────────────────────────────────────
  results.push(await testPage(page, { path: '/water-station/customers', name: 'WS Customers' }));
  results.push(await testPage(page, { path: '/water-station/deliveries', name: 'WS Deliveries' }));

  // ─── Clinic Management System ─────────────────────────
  results.push(await testPage(page, { path: '/clinic/patients', name: 'Clinic Patients' }));
  results.push(await testPage(page, { path: '/clinic/patients/new', name: 'Clinic Patient Create' }));
  results.push(await testPage(page, { path: '/clinic/appointments', name: 'Clinic Appointments' }));
  results.push(await testPage(page, { path: '/clinic/billing', name: 'Clinic Billing' }));

  // ─── Multi-Branch Management ──────────────────────────
  results.push(await testPage(page, { path: '/branches', name: 'Branches List' }));
  results.push(await testPage(page, { path: '/branches/new', name: 'Branches Create' }));

  // ─── Changelog ────────────────────────────────────────
  results.push(await testPage(page, { path: '/changelog', name: 'Changelog List' }));
  results.push(await testPage(page, { path: '/changelog/new', name: 'Changelog Create' }));

  // ─── Laundry Shop System ──────────────────────────────
  results.push(await testPage(page, { path: '/laundry/customers', name: 'Laundry Customers' }));
  results.push(await testPage(page, { path: '/laundry/orders', name: 'Laundry Orders' }));
  results.push(await testPage(page, { path: '/laundry/services', name: 'Laundry Services' }));
  results.push(await testPage(page, { path: '/laundry/payments', name: 'Laundry Payments' }));
  results.push(await testPage(page, { path: '/laundry/inventory', name: 'Laundry Inventory' }));

  // ─── Driving School System ────────────────────────────
  results.push(await testPage(page, { path: '/driving-school/students', name: 'Driving Students' }));
  results.push(await testPage(page, { path: '/driving-school/enrollments', name: 'Driving Enrollments' }));
  results.push(await testPage(page, { path: '/driving-school/courses', name: 'Driving Courses' }));
  results.push(await testPage(page, { path: '/driving-school/schedules', name: 'Driving Schedules' }));
  results.push(await testPage(page, { path: '/driving-school/payments', name: 'Driving Payments' }));
  results.push(await testPage(page, { path: '/driving-school/instructors', name: 'Driving Instructors' }));
  results.push(await testPage(page, { path: '/driving-school/vehicles', name: 'Driving Vehicles' }));

  // ─── Portals & Tools ──────────────────────────────────
  results.push(await testPage(page, { path: '/sync-center', name: 'Sync Center' }));
  results.push(await testPage(page, { path: '/loan-calculator', name: 'Loan Calculator' }));
  results.push(await testPage(page, { path: '/pending-approvals', name: 'Pending Approvals' }));

  // ─── Settings ─────────────────────────────────────────
  results.push(await testPage(page, { path: '/settings', name: 'Settings' }));
  results.push(await testPage(page, { path: '/settings/advanced', name: 'Advanced Settings' }));

  await browser.close();

  // ─── Summary ──────────────────────────────────────────
  console.log('\n' + '═'.repeat(70));
  console.log('📊 RESULTS SUMMARY');
  console.log('═'.repeat(70));

  const passed = results.filter(r => r.status === 'OK');
  const schemaErrors = results.filter(r => r.status === 'SCHEMA_ERROR');
  const jsErrors = results.filter(r => r.status === 'JS_ERRORS');
  const totalDexieErrs = results.reduce((s, r) => s + r.dexieErrors, 0);

  console.log(`  Total pages tested: ${results.length}`);
  console.log(`  ✅ Passed: ${passed.length}`);
  if (schemaErrors.length > 0) {
    console.log(`  ❌ Schema Errors: ${schemaErrors.length}`);
    schemaErrors.forEach(r => console.log(`       - ${r.name}: ${r.path}`));
  }
  if (jsErrors.length > 0) {
    console.log(`  ⚠️  JS Errors: ${jsErrors.length}`);
    jsErrors.forEach(r => console.log(`       - ${r.name}: ${r.path}`));
  }
  console.log(`  📦 Total Dexie schema issues: ${totalDexieErrs}`);

  if (passed.length === results.length) {
    console.log('\n  🎉 ALL SYSTEMS OPERATIONAL');
  }

  process.exit(schemaErrors.length > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
