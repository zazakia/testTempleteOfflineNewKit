/**
 * Driving School — Full CRUD E2E Test
 */
const { chromium } = require('playwright');
const BASE = 'https://meta.8-v.cc';

const failures = [];
const allErrors = [];

function log(icon, msg) { console.log(`  ${icon} ${msg}`); }

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

  console.log('🚗 Driving School — Full CRUD Validation');
  console.log(`   URL: ${BASE}\n`);

  // ═════════════════════════════════════════════════════
  // 1. PAGE RENDERING — ALL 7 ENTITY PAGES
  // ═════════════════════════════════════════════════════
  console.log('─'.repeat(50));
  console.log('📋 PAGE RENDERING CHECK');
  console.log('─'.repeat(50));

  const pages = [
    { path: '/driving-school/students', name: 'Students' },
    { path: '/driving-school/enrollments', name: 'Enrollments' },
    { path: '/driving-school/courses', name: 'Courses' },
    { path: '/driving-school/schedules', name: 'Schedules' },
    { path: '/driving-school/payments', name: 'Payments' },
    { path: '/driving-school/instructors', name: 'Instructors' },
    { path: '/driving-school/vehicles', name: 'Vehicles' },
  ];

  for (const p of pages) {
    const startErrors = allErrors.length;
    await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);

    const newErrors = allErrors.slice(startErrors);
    const dexieErr = newErrors.find(e => e.includes('Dexie') || e.includes('not defined'));

    // Get page heading
    let heading = '';
    try { heading = await page.textContent('h1, h2', { timeout: 2000 }); } catch {}
    if (!heading) try { heading = await page.textContent('h3', { timeout: 2000 }); } catch {}

    // Check for table or grid
    let hasTable = false, hasGrid = false;
    try { hasTable = !!(await page.$('table')); } catch {}
    try { hasGrid = !!(await page.$('.grid')); } catch {}

    if (dexieErr) {
      log('❌', `${p.name}: Dexie — ${dexieErr.substring(0, 80)}`);
      failures.push(`${p.name}: ${dexieErr}`);
    } else {
      const info = heading ? ' — "' + heading.trim().substring(0,35) + '"' : '';
      const elem = hasTable ? ' (table)' : hasGrid ? ' (grid)' : ' (content)';
      log('✅', `${p.name}: renders OK${info}${elem}`);
    }
  }

  // ═════════════════════════════════════════════════════
  // 2. CRUD OPERATIONS (via IndexedDB)
  // ═════════════════════════════════════════════════════
  console.log('\n' + '─'.repeat(50));
  console.log('✏️ CRUD OPERATIONS (IndexedDB)');
  console.log('─'.repeat(50));

  await page.goto(`${BASE}/driving-school/students`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const crudResults = await page.evaluate(async () => {
    const results = [];
    const db = window.__DB__;
    if (!db) return [{ op: 'setup', pass: false, detail: 'window.__DB__ not found' }];

    const tid = 'ds-test';
    function ok(op, pass, detail) { results.push({ op, pass, detail: String(detail || '') }); }

    // ── STUDENT CRUD ──
    try {
      const s = await db.drivingStudentRepo.create({
        tenantId: tid, studentCode: 'DS-TEST1', firstName: 'Carlos', lastName: 'Reyes',
        fullName: 'Carlos Reyes', sex: 'male', dateOfBirth: '2000-05-15',
        nationality: 'Filipino', civilStatus: 'single', phone: '+639991111111',
        address: '123 Main St', city: 'Manila', province: 'NCR',
        emergencyContactName: 'Maria Reyes', emergencyContactPhone: '+639992222222',
        bloodType: 'O+', highestEducation: 'college',
        hasPriorDrivingExperience: false, hasExistingLicense: false,
        hasEyeglasses: false, status: 'enrolled', registrationDate: '2026-07-17',
      });
      ok('CREATE student', !!s, s ? s.studentCode : 'null');

      if (s) {
        const r = await db.drivingStudentRepo.findById(s.id);
        ok('READ student', r?.fullName === 'Carlos Reyes', r?.fullName);

        const u = await db.drivingStudentRepo.update(s.id, {
          lastName: 'Reyes-Updated', fullName: 'Carlos Reyes-Updated',
          status: 'active', ltoStudentPermitNumber: 'LTO-SP-12345', version: s.version,
        });
        ok('UPDATE student', u?.fullName === 'Carlos Reyes-Updated' && u?.ltoStudentPermitNumber === 'LTO-SP-12345', u?.fullName);

        await db.drivingStudentRepo.delete(s.id);
        ok('DELETE student', await db.drivingStudentRepo.findById(s.id) === null, 'null');
      }
    } catch(e) { ok('STUDENT CRUD', false, e.message); }

    // ── INSTRUCTOR CRUD ──
    try {
      const i = await db.drivingInstructorRepo.create({
        tenantId: tid, instructorCode: 'DI-TEST1', firstName: 'Ramon', lastName: 'Santos',
        fullName: 'Ramon Santos', phone: '+639993333333',
        ltoAccreditationNumber: 'LTO-ACC-67890', ltoAccreditationIssueDate: '2025-01-01',
        ltoAccreditationExpiryDate: '2027-01-01',
        specializations: ['practical_car', 'theoretical'],
        yearsOfExperience: 8, licenseType: 'professional', licenseNumber: 'D01-23-000123',
        licenseExpiryDate: '2028-06-15', dateHired: '2023-03-01',
        employmentType: 'full_time', maxStudentsPerDay: 6, ratePerHour: 350,
        status: 'active',
      });
      ok('CREATE instructor', !!i, i ? i.instructorCode : 'null');

      if (i) {
        const r = await db.drivingInstructorRepo.findById(i.id);
        ok('READ instructor', r?.fullName === 'Ramon Santos', r?.fullName);

        const u = await db.drivingInstructorRepo.update(i.id, {
          ratePerHour: 400, maxStudentsPerDay: 8, version: i.version,
        });
        ok('UPDATE instructor', u?.ratePerHour === 400, '₱400/hr, max ' + u?.maxStudentsPerDay + ' students');
      }
    } catch(e) { ok('INSTRUCTOR CRUD', false, e.message); }

    // ── COURSE CRUD ──
    try {
      const c = await db.drivingCourseRepo.create({
        tenantId: tid, courseCode: 'DC-TEST1', name: 'TDC — Basic',
        category: 'tdc', totalHours: 15, theoryHours: 15, practicalHours: 0,
        minSessionsRequired: 5, baseTuitionFee: 1500, registrationFee: 200,
        assessmentFee: 300, certificateFee: 100,
        ltoAccredited: true, requiresStudentPermit: false,
        requiresMedicalCertificate: true, minimumAge: 16,
        maxStudentsPerClass: 20, defaultStartTime: '08:00',
        defaultSessionHours: 3, status: 'active', sortOrder: 1,
      });
      ok('CREATE course', !!c, c ? c.name : 'null');

      if (c) {
        const r = await db.drivingCourseRepo.findById(c.id);
        ok('READ course', r?.baseTuitionFee === 1500, '₱' + r?.baseTuitionFee);

        const u = await db.drivingCourseRepo.update(c.id, {
          baseTuitionFee: 1800, maxStudentsPerClass: 25, version: c.version,
        });
        ok('UPDATE course', u?.baseTuitionFee === 1800, '₱1800, max ' + u?.maxStudentsPerClass);
      }
    } catch(e) { ok('COURSE CRUD', false, e.message); }

    // ── ENROLLMENT CRUD ──
    try {
      // Create a student first
      const stu = await db.drivingStudentRepo.create({
        tenantId: tid, studentCode: 'DS-ENRL1', firstName: 'Enrollment', lastName: 'Test',
        fullName: 'Enrollment Test', sex: 'male', dateOfBirth: '2000-01-01',
        nationality: 'Filipino', civilStatus: 'single', phone: '+639990000001',
        address: 'Test', city: 'Test', province: 'Test',
        emergencyContactName: 'Test', emergencyContactPhone: '+639990000002',
        bloodType: 'unknown', highestEducation: 'high_school',
        hasPriorDrivingExperience: false, hasExistingLicense: false,
        hasEyeglasses: false, status: 'enrolled', registrationDate: '2026-07-17',
      });

      const e = await db.drivingEnrollmentRepo.create({
        tenantId: tid, enrollmentCode: 'DE-TEST1', studentId: stu.id,
        studentName: stu.fullName, courseId: 'test-course', courseName: 'TDC Basic',
        enrollmentDate: '2026-07-17', tuitionFee: 1500, registrationFee: 200,
        assessmentFee: 300, certificateFee: 100, discountAmount: 0,
        totalFee: 2100, amountPaid: 1000, balance: 1100,
        enrollmentType: 'installment', theoryHoursCompleted: 0,
        practicalHoursCompleted: 0, sessionsAttended: 0, sessionsTotal: 5,
        status: 'confirmed',
      });
      ok('CREATE enrollment', !!e, e ? '#' + e.enrollmentCode + ' ₱' + e.totalFee : 'null');

      if (e) {
        const r = await db.drivingEnrollmentRepo.findById(e.id);
        ok('READ enrollment', r?.balance === 1100, 'balance ₱' + r?.balance);

        const u = await db.drivingEnrollmentRepo.update(e.id, {
          amountPaid: 2100, balance: 0, status: 'in_progress', version: e.version,
        });
        ok('UPDATE enrollment', u?.status === 'in_progress' && u?.balance === 0, u?.status + ' / fully paid');
      }
    } catch(e) { ok('ENROLLMENT CRUD', false, e.message); }

    // ── SCHEDULE CRUD ──
    try {
      const s = await db.drivingScheduleRepo.create({
        tenantId: tid, scheduleCode: 'SCH-TEST1', enrollmentId: 'test-e',
        studentId: 'test-s', studentName: 'Test Student',
        instructorId: 'test-i', instructorName: 'Test Instructor',
        sessionType: 'practical', sessionDate: '2026-07-20',
        startTime: '08:00', endTime: '10:00', durationHours: 2,
        studentAttended: false, instructorConfirmed: false,
        isOnsite: true, rescheduleCount: 0, status: 'scheduled',
      });
      ok('CREATE schedule', !!s, s ? s.scheduleCode + ' ' + s.sessionDate : 'null');

      if (s) {
        const r = await db.drivingScheduleRepo.findById(s.id);
        ok('READ schedule', r?.sessionDate === '2026-07-20', r?.sessionDate + ' ' + r?.startTime + '-' + r?.endTime);

        const u = await db.drivingScheduleRepo.update(s.id, {
          studentAttended: true, instructorConfirmed: true,
          status: 'completed', version: s.version,
        });
        ok('UPDATE schedule', u?.status === 'completed', 'completed, attended');
      }
    } catch(e) { ok('SCHEDULE CRUD', false, e.message); }

    // ── PAYMENT CRUD ──
    try {
      const p = await db.drivingPaymentRepo.create({
        tenantId: tid, paymentCode: 'DP-TEST1', enrollmentId: 'test-e',
        studentId: 'test-s', studentName: 'Test Student',
        paymentDate: '2026-07-17', paymentTime: '14:00', amount: 1000,
        paymentMethod: 'gcash', paymentFor: 'installment',
        installmentNumber: 1, receivedBy: 'Cashier', isRefund: false,
      });
      ok('CREATE payment', !!p, p ? '₱' + p.amount + ' ' + p.paymentMethod : 'null');

      if (p) {
        const r = await db.drivingPaymentRepo.findById(p.id);
        ok('READ payment', r?.amount === 1000, '₱' + r?.amount);

        await db.drivingPaymentRepo.delete(p.id);
        ok('DELETE payment', await db.drivingPaymentRepo.findById(p.id) === null, 'null');
      }
    } catch(e) { ok('PAYMENT CRUD', false, e.message); }

    // ── VEHICLE CRUD ──
    try {
      const v = await db.drivingVehicleRepo.create({
        tenantId: tid, vehicleCode: 'DV-TEST1', plateNumber: 'ABC-1234',
        make: 'Toyota', model: 'Vios', year: 2023,
        type: 'sedan', transmission: 'manual', fuelType: 'gasoline',
        color: 'White', ltoRegistrationNumber: 'LTO-REG-12345',
        ltoRegistrationExpiry: '2027-07-17',
        hasDualControl: true, hasDashCam: true, hasStudentSignage: true,
        odometerReading: 15000, status: 'active',
      });
      ok('CREATE vehicle', !!v, v ? v.plateNumber + ' ' + v.make + ' ' + v.model : 'null');

      if (v) {
        const r = await db.drivingVehicleRepo.findById(v.id);
        ok('READ vehicle', r?.plateNumber === 'ABC-1234', r?.make + ' ' + r?.model);

        const u = await db.drivingVehicleRepo.update(v.id, {
          odometerReading: 25000, status: 'maintenance', version: v.version,
        });
        ok('UPDATE vehicle', u?.odometerReading === 25000 && u?.status === 'maintenance', u?.status + ' / ' + u?.odometerReading + 'km');
      }
    } catch(e) { ok('VEHICLE CRUD', false, e.message); }

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
  // 3. REPOSITORY INTEGRITY
  // ═════════════════════════════════════════════════════
  console.log('\n' + '─'.repeat(50));
  console.log('🔍 REPOSITORY INTEGRITY');
  console.log('─'.repeat(50));

  const repoCheck = await page.evaluate(() => {
    const db = window.__DB__;
    if (!db) return [];

    const repos = {
      drivingStudentRepo: 'driving_students',
      drivingInstructorRepo: 'driving_instructors',
      drivingCourseRepo: 'driving_courses',
      drivingEnrollmentRepo: 'driving_enrollments',
      drivingScheduleRepo: 'driving_schedules',
      drivingPaymentRepo: 'driving_payments',
      drivingVehicleRepo: 'driving_vehicles',
    };

    return Object.entries(repos).map(([key, table]) => ({
      repo: key, table,
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
  // 4. NAVIGATION STRESS
  // ═════════════════════════════════════════════════════
  console.log('\n' + '─'.repeat(50));
  console.log('🔗 NAVIGATION STRESS');
  console.log('─'.repeat(50));

  const cycles = [
    ['/driving-school/students', '/driving-school/courses', '/driving-school/enrollments'],
    ['/driving-school/schedules', '/laundry/customers', '/driving-school/vehicles'],
    ['/driving-school/instructors', '/members', '/driving-school/payments'],
  ];

  for (const cycle of cycles) {
    const start = allErrors.length;
    for (const path of cycle) {
      await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(600);
    }
    const newErrs = allErrors.length - start;
    log(newErrs === 0 ? '✅' : '❌', `${cycle.join(' → ')}: ${newErrs === 0 ? 'clean' : newErrs + ' errors'}`);
    if (newErrs > 0) failures.push(`Nav cycle errors: ${newErrs}`);
  }

  await browser.close();

  // ═════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(50));
  console.log('🏁 DRIVING SCHOOL VERDICT');
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
    console.log('\n  🎉 DRIVING SCHOOL SYSTEM: FULLY OPERATIONAL & ERROR-FREE');
  }

  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
