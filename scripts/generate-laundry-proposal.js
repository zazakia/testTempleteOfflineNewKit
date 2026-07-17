/**
 * Generate Laundry Shop Management System — Business Proposal (.docx)
 */
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType,
  ShadingType, PageBreak, TabStopPosition, TabStopType,
  NumberFormat, LevelFormat, Header, Footer, PageNumber,
  ImageRun, convertInchesToTwip,
} = require('docx');

// ═══════════════════════════════════════════════════════════════
// Brand Colors
// ═══════════════════════════════════════════════════════════════
const BLUE = '1A73E8';
const DARK = '1F2937';
const GRAY = '6B7280';
const GREEN = '16A34A';
const WHITE = 'FFFFFF';
const LIGHT_BG = 'F3F4F6';
const ACCENT = '3B82F6';

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun({ text, bold: true, color: DARK, size: level === HeadingLevel.HEADING_1 ? 40 : level === HeadingLevel.HEADING_2 ? 32 : 28 })] });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text, size: 22, color: opts.color || DARK, bold: opts.bold || false, italics: opts.italics || false })],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    spacing: { after: 100, before: 0 },
    bullet: { level },
    children: [new TextRun({ text, size: 22, color: DARK })],
  });
}

function small(text) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 20, color: GRAY, italics: true })],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 100 }, children: [] });
}

function featureRow(module, features) {
  return new TableRow({
    children: [
      new TableCell({
        shading: { type: ShadingType.SOLID, color: LIGHT_BG },
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: module, bold: true, size: 20, color: BLUE })] })],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: features, size: 20 })] })],
      }),
    ],
  });
}

function featureTableHeader() {
  return new TableRow({
    children: [
      new TableCell({
        shading: { type: ShadingType.SOLID, color: BLUE },
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: 'Module', bold: true, size: 22, color: WHITE })] })],
      }),
      new TableCell({
        shading: { type: ShadingType.SOLID, color: BLUE },
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: 'Features', bold: true, size: 22, color: WHITE })] })],
      }),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENT CONTENT
// ═══════════════════════════════════════════════════════════════

const children = [];

// ─── COVER PAGE ──────────────────────────────────────────────
children.push(emptyLine(), emptyLine(), emptyLine(), emptyLine());
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text: 'Laundry Shop', size: 64, bold: true, color: BLUE })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
  children: [new TextRun({ text: 'Management System', size: 56, bold: true, color: DARK })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 400 },
  children: [new TextRun({ text: '━━━━━━━━━━━━━━━━━━━━━━━━━', size: 28, color: ACCENT })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text: 'Multi-Branch • Offline-First • Metadata-Driven', size: 28, color: GRAY, italics: true })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text: 'Enterprise Solution for Laundry Businesses', size: 24, color: DARK })],
}));
children.push(emptyLine(), emptyLine());
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Business Proposal & Technical Specification', size: 26, bold: true, color: DARK })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
  children: [new TextRun({ text: 'Version 1.0 — July 2026', size: 22, color: GRAY })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Confidential Document', size: 20, color: GRAY, italics: true })],
}));

// Page break
children.push(new Paragraph({ children: [new PageBreak()] }));

// ─── TABLE OF CONTENTS ──────────────────────────────────────
children.push(heading('Table of Contents', HeadingLevel.HEADING_1));
children.push(emptyLine());
const toc = [
  '1. Executive Summary',
  '2. System Overview & Architecture',
  '3. Complete Feature Matrix',
  '4. Customer Management',
  '5. Order & Workflow Management',
  '6. Service Catalog & Pricing',
  '7. Payment & Billing',
  '8. Inventory & Supply Management',
  '9. Loyalty & Promotions Engine',
  '10. Customer Mobile Application',
  '11. Multi-Branch Architecture',
  '12. Reporting & Analytics',
  '13. Staff Roles & Access Control',
  '14. Offline-First Technology',
  '15. Metadata-Driven Customization',
  '16. Technical Architecture',
  '17. Security & Compliance',
  '18. Implementation Timeline',
  '19. Pricing & Plans',
  '20. Why This Solution',
];
toc.forEach(t => children.push(para(t)));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ─── 1. EXECUTIVE SUMMARY ──────────────────────────────────
children.push(heading('1. Executive Summary'));
children.push(para('The Laundry Shop Management System (LSMS) is a state-of-the-art, multi-branch, offline-first platform designed specifically for modern laundry businesses operating single or multiple locations across the Philippines and Southeast Asia.'));
children.push(para('Built on an enterprise-grade architecture that has already proven successful in cooperative banking, medical clinics, water stations, and driving schools, this laundry-specific module brings the same reliability, scalability, and metadata-driven customization that powers thousands of daily transactions.'));
children.push(emptyLine());
children.push(para('Key Differentiators:', { bold: true }));
children.push(bullet('Works WITHOUT internet — full functionality offline, syncs when connected'));
children.push(bullet('Unlimited branches from a single dashboard — real-time consolidated view'));
children.push(bullet('AI-ready loyalty engine with automatic tier upgrades and point rewards'));
children.push(bullet('Customer mobile app for order tracking, notifications, and self-service'));
children.push(bullet('Zero hardcoding — every pricing rule, workflow, and promotion is configurable per tenant per branch'));
children.push(bullet('Deployed on battle-tested infrastructure (Vercel + Supabase) with 99.9% uptime'));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ─── 2. SYSTEM OVERVIEW ────────────────────────────────────
children.push(heading('2. System Overview & Architecture'));
children.push(para('The system is built on a metadata-driven, multi-tenant architecture where each laundry business (tenant) gets complete data isolation with its own configuration, pricing, staff roles, and branding. Branches within a tenant share a unified customer database while maintaining independent operations.'));
children.push(emptyLine());
children.push(para('Core Technology Stack:', { bold: true }));
children.push(bullet('Frontend: React 19 PWA (Progressive Web App) — works on any device, any browser'));
children.push(bullet('Mobile: Dedicated customer PWA app with push notifications'));
children.push(bullet('Backend: Supabase PostgreSQL with Row-Level Security'));
children.push(bullet('Offline Engine: IndexedDB (Dexie.js) with automatic sync queue'));
children.push(bullet('Hosting: Vercel Edge Network (global CDN, instant load)'));
children.push(bullet('Sync Protocol: Idempotent, conflict-resolving, delta-optimized'));

// ─── 3. FEATURE MATRIX ─────────────────────────────────────
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading('3. Complete Feature Matrix'));
children.push(emptyLine());

const featureTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    featureTableHeader(),
    featureRow('Customer Management', 'Registration with photo/signature, tier system (Bronze→Silver→Gold→Platinum), lifetime spend tracking, loyalty points, preferences & special instructions, delivery address book, visit history, corporate accounts, customer blocking/fraud prevention'),
    featureRow('Order Management', 'Drop-off workflow with garment tagging, barcode/QR code tracking, order status lifecycle (8 stages), express/rush/normal priority, weight-based and piece-based pricing, delivery & pickup management, damage notation at drop-off, care instruction capture, multi-item orders, promised vs actual pickup tracking'),
    featureRow('Service Catalog', '10 service categories (Wash & Dry, Dry Clean, Iron, Fold, Stain Removal, Leather Care, Shoe Clean, Carpet, Curtain, Custom), multiple pricing units (per kg, per piece, per set, per pair, flat rate), branch-specific price overrides, minimum charges, turnaround SLA tracking, special handling flags, seasonal service toggling'),
    featureRow('Payment & Billing', '6 payment methods (Cash, GCash, Maya, Bank Transfer, Card, Loyalty Points), partial payment tracking, automatic balance computation, VAT computation (configurable), official receipt numbering, refund processing, installment support, daily cash reconciliation, payment history per customer'),
    featureRow('Inventory Management', '8 inventory categories (Detergent, Softener, Bleach, Stain Remover, Packaging, Hangers, Tags, Other), multi-unit tracking (liter, kg, piece, pack, box, bottle), minimum/maximum stock levels with automatic reorder alerts, supplier management, cost tracking, expiration date monitoring, branch-specific inventory levels, consumption analytics'),
    featureRow('Loyalty & Promotions', 'Points-per-peso earning (configurable rate), automatic tier upgrades based on lifetime spend, tier-based discounts (0%–15%), points redemption at checkout, birthday promotions, referral bonuses, first-time customer discounts, promo code engine, seasonal campaign management'),
  ],
});
children.push(featureTable);
children.push(emptyLine());

const featureTable2 = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    featureTableHeader(),
    featureRow('Customer Mobile App', 'Real-time order status tracking, push notifications (ready for pickup, delayed, completed), self-service registration, order history & reorder, loyalty points balance, nearest branch locator, promo notifications, feedback & rating system'),
    featureRow('Multi-Branch Management', 'Unlimited branches per tenant, centralized customer database with branch assignment, branch-specific pricing overrides, branch-level inventory, consolidated reports across all branches, branch performance comparison, staff assignment per branch, inter-branch transfer tracking'),
    featureRow('Staff & Access Control', '7 predefined roles (Admin, Laundry Admin, Branch Manager, Counter Staff, Washer Operator, Delivery Rider, Cashier), granular permission matrix per role, action audit trail, PIN-based quick login for counter staff, shift management, productivity tracking'),
    featureRow('Reporting & Analytics', 'Daily sales report per branch, service popularity analytics, customer lifetime value, inventory consumption reports, staff productivity metrics, peak hour analysis, revenue forecasting, profit margin per service, export to Excel/PDF/CSV, automated email reports'),
    featureRow('Technical Capabilities', '100% offline operation (no internet needed), automatic background sync when online, conflict resolution (last-write-wins, per-field, manual), PWA installable on any device (iOS, Android, Windows, Mac), data encrypted at rest and in transit, automatic daily backups, 99.9% uptime SLA'),
  ],
});
children.push(featureTable2);

children.push(new Paragraph({ children: [new PageBreak()] }));

// ─── 4. CUSTOMER MANAGEMENT ────────────────────────────────
children.push(heading('4. Customer Management'));
children.push(para('The customer module is the heart of the laundry system. Every customer gets a unique profile with comprehensive tracking across all branches.'));
children.push(emptyLine());
children.push(para('Customer Profile Fields:', { bold: true }));
children.push(bullet('Personal: Full name, phone, email, address (with barangay/city/province)'));
children.push(bullet('Classification: Customer type (Walk-in, Regular, Corporate), Tier (Bronze/Silver/Gold/Platinum)'));
children.push(bullet('Financial: Lifetime spend (auto-computed), loyalty points balance'));
children.push(bullet('Preferences: Fabric care preferences, special washing instructions'));
children.push(bullet('Delivery: Default delivery address, delivery zone'));
children.push(bullet('History: First visit date, last order date, total orders count'));
children.push(bullet('Status: Active, Inactive, Blocked (fraud prevention)'));
children.push(emptyLine());
children.push(para('Tier System:', { bold: true }));
children.push(bullet('Bronze: < ₱5,000 lifetime spend — 0% discount'));
children.push(bullet('Silver: ₱5,000–₱19,999 — 5% discount, priority queuing'));
children.push(bullet('Gold: ₱20,000–₱49,999 — 10% discount, free delivery (2x/month)'));
children.push(bullet('Platinum: ₱50,000+ — 15% discount, free delivery (unlimited), dedicated account manager'));
children.push(small('Thresholds are fully configurable per tenant via metadata'));

// ─── 5. ORDER MANAGEMENT ───────────────────────────────────
children.push(heading('5. Order & Workflow Management'));
children.push(para('Every laundry order follows a precise 8-stage lifecycle tracked in real-time:'));
children.push(emptyLine());
children.push(bullet('1. DROPPED OFF — Customer brings items, staff records weight/quantity, tags garments, prints receipt'));
children.push(bullet('2. SORTED — Items sorted by type, color, and service required'));
children.push(bullet('3. IN PROCESS — Washing/drying/cleaning in progress'));
children.push(bullet('4. QUALITY CHECK — Post-cleaning inspection for stains, damage, completeness'));
children.push(bullet('5. READY FOR PICKUP — Customer notified via app/SMS'));
children.push(bullet('6. PICKED UP — Customer collects items, signs confirmation'));
children.push(bullet('7. DELIVERED — Items delivered to customer address, POD captured'));
children.push(bullet('8. CANCELLED — Order cancelled (with reason tracking)'));
children.push(emptyLine());
children.push(para('Order Priorities:', { bold: true }));
children.push(bullet('Normal: Standard turnaround (default 48 hours)'));
children.push(bullet('Express: 50% surcharge, 24-hour turnaround'));
children.push(bullet('Rush: 100% surcharge, 6-hour turnaround'));
children.push(small('Surcharge multipliers and turnaround times are metadata-configurable per tenant'));

// ─── 6. SERVICE CATALOG ─────────────────────────────────────
children.push(heading('6. Service Catalog & Pricing'));
children.push(para('The service catalog provides complete flexibility in defining services, pricing models, and turnaround commitments.'));
children.push(emptyLine());
children.push(para('Supported Service Categories:', { bold: true }));
children.push(bullet('Wash & Dry — Regular and Express variants'));
children.push(bullet('Dry Clean — Suits, gowns, barongs, formal wear'));
children.push(bullet('Iron / Press Only — Per piece pricing'));
children.push(bullet('Fold Only — Bulk laundry folding service'));
children.push(bullet('Stain Removal — Specialized treatment per stain type'));
children.push(bullet('Leather Care — Jackets, bags, shoes'));
children.push(bullet('Shoe Cleaning — Sneakers, formal, boots'));
children.push(bullet('Carpet / Rug — Deep cleaning'));
children.push(bullet('Curtain / Drapery — Take-down, clean, re-hang'));
children.push(bullet('Custom — Any other service the business offers'));
children.push(emptyLine());
children.push(para('Pricing Flexibility:', { bold: true }));
children.push(bullet('Per kilogram — Bulk laundry pricing'));
children.push(bullet('Per piece — Individual garments'));
children.push(bullet('Per set — Bed sheets, curtains'));
children.push(bullet('Per pair — Shoes'));
children.push(bullet('Flat rate — Fixed price services'));
children.push(bullet('Minimum charge — Floor price per transaction'));
children.push(bullet('Branch overrides — Different prices per location'));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ─── 7-8. PAYMENTS & INVENTORY ──────────────────────────
children.push(heading('7. Payment & Billing'));
children.push(para('Comprehensive payment processing with support for all major Philippine payment methods.'));
children.push(bullet('Cash, GCash, Maya, Bank Transfer, Credit/Debit Card, Loyalty Points'));
children.push(bullet('Partial payments with automatic balance tracking'));
children.push(bullet('VAT computation with configurable rate and threshold'));
children.push(bullet('Official receipt numbering with sequential tracking'));
children.push(bullet('Refund processing with reason capture'));
children.push(bullet('Daily cash reconciliation report'));
children.push(bullet('Payment history per customer (full audit trail)'));

children.push(emptyLine());
children.push(heading('8. Inventory & Supply Management'));
children.push(para('Track every supply and consumable across all branches with automatic reorder alerts.'));
children.push(bullet('Real-time quantity tracking per branch'));
children.push(bullet('Minimum stock level alerts — never run out of detergent'));
children.push(bullet('Maximum stock level caps — avoid over-ordering'));
children.push(bullet('Supplier management with cost history'));
children.push(bullet('Expiration date tracking'));
children.push(bullet('Consumption analytics — know your cost per kilo washed'));
children.push(bullet('Automatic reorder recommendations with quantity and estimated cost'));

// ─── 9. LOYALTY ENGINE ──────────────────────────────────
children.push(heading('9. Loyalty & Promotions Engine'));
children.push(para('A fully automated, metadata-driven loyalty system that rewards customers and drives repeat business.'));
children.push(emptyLine());
children.push(para('Loyalty Points System:', { bold: true }));
children.push(bullet('Configurable earn rate: Default 1 point per ₱100 spent'));
children.push(bullet('Configurable redemption: Default ₱50 value per 100 points'));
children.push(bullet('Minimum redemption threshold: Default 500 points'));
children.push(bullet('Points earned automatically on every payment'));
children.push(bullet('Points redeemable at checkout for instant discount'));
children.push(emptyLine());
children.push(para('Promotion Engine:', { bold: true }));
children.push(bullet('First-time customer discount: Configurable percentage'));
children.push(bullet('Referral bonus: Reward existing customers who refer new ones'));
children.push(bullet('Birthday month promo: Automatic discount during birth month'));
children.push(bullet('Seasonal campaigns: Define date-range promotions (e.g., Christmas, Summer)'));
children.push(bullet('Volume discount: Automatic discount for orders above weight/value threshold'));
children.push(bullet('Loyalty tier upgrade: Automatic notification when customer reaches next tier'));
children.push(bullet('Promo codes: Generate and distribute discount codes'));
children.push(bullet('Push notification campaigns: Send targeted offers via customer app'));

// ─── 10. CUSTOMER MOBILE APP ───────────────────────────
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading('10. Customer Mobile Application'));
children.push(para('A Progressive Web App (PWA) that customers can install on their phone — no app store download required. Works on iOS, Android, and any modern browser.'));
children.push(emptyLine());
children.push(para('Customer App Features:', { bold: true }));
children.push(emptyLine());

const appFeatures = [
  ['Registration & Profile', 'Self-service signup with phone number, profile photo upload, manage preferences and delivery addresses'],
  ['Order Tracking', 'Real-time status of current orders with push notifications at every stage (dropped off → sorted → washing → QC → ready → picked up)'],
  ['Order History', 'Complete history of all past orders with details, receipts, and reorder capability'],
  ['Quick Reorder', 'One-tap reorder of previous service combinations — skip the counter'],
  ['Loyalty Dashboard', 'View points balance, tier status, progress to next tier, available rewards'],
  ['Promotions', 'Browse active promotions, claim promo codes, see personalized offers'],
  ['Branch Locator', 'Find nearest branch with map integration, operating hours, contact info'],
  ['Notifications', 'Push notifications: order ready, delayed, promotion available, tier upgraded, points expiring'],
  ['Feedback & Ratings', 'Rate service quality, leave reviews, report issues with photo upload'],
  ['Payment Wallet', 'Link GCash/Maya for contactless payment, view payment history'],
];
appFeatures.forEach(([feature, desc]) => {
  children.push(para(feature, { bold: true }));
  children.push(bullet(desc));
  children.push(emptyLine());
});

// ─── 11. MULTI-BRANCH ──────────────────────────────────
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading('11. Multi-Branch Architecture'));
children.push(para('Built from the ground up for businesses with multiple locations. The multi-branch system provides centralized management while allowing each branch to operate independently.'));
children.push(emptyLine());
children.push(para('Branch Features:', { bold: true }));
children.push(bullet('Unlimited branches — add as many locations as you need'));
children.push(bullet('Branch-specific pricing — charge differently per location/neighborhood'));
children.push(bullet('Branch-specific inventory — each location tracks its own supplies'));
children.push(bullet('Branch performance dashboard — compare revenue, orders, efficiency'));
children.push(bullet('Cross-branch customer lookup — customer walks into any branch, their data is there'));
children.push(bullet('Branch staff assignment — manager, counter staff, operators per location'));
children.push(bullet('Consolidated reporting — view all branches together or drill down'));
children.push(bullet('Branch status management — active, inactive, suspended'));
children.push(emptyLine());
children.push(para('Data Model:', { bold: true }));
children.push(bullet('Every entity (customer, order, payment, inventory) can be branch-scoped'));
children.push(bullet('Optional cross-branch access for regional managers'));
children.push(bullet('Branch-level RBAC — staff only see their assigned branch data'));
children.push(bullet('Main branch designation with special privileges'));

// ─── 12-14. REPORTS, ROLES, OFFLINE ─────────────────────
children.push(heading('12. Reporting & Analytics'));
children.push(para('Comprehensive reporting suite for data-driven decision making.'));
children.push(bullet('Daily Sales Report — Revenue breakdown by service, branch, payment method'));
children.push(bullet('Service Analytics — Most/least popular services, profit margins'));
children.push(bullet('Customer Analytics — Lifetime value, retention rate, tier distribution'));
children.push(bullet('Inventory Reports — Consumption rate, reorder recommendations, wastage'));
children.push(bullet('Staff Productivity — Orders processed per staff, efficiency metrics'));
children.push(bullet('Financial Reports — Revenue, expenses, profit per branch'));
children.push(bullet('All reports exportable to Excel, PDF, CSV'));

children.push(emptyLine());
children.push(heading('13. Staff Roles & Access Control'));
children.push(para('Granular, role-based access control ensuring every staff member sees only what they need.'));
children.push(bullet('Admin — Full system access, configuration, user management'));
children.push(bullet('Laundry Admin — All laundry operations across all branches'));
children.push(bullet('Branch Manager — Manage their branch: staff, discounts, reports'));
children.push(bullet('Counter Staff — Create customers, accept drop-offs, process payments'));
children.push(bullet('Washer Operator — Update order status, manage inventory consumption'));
children.push(bullet('Delivery Rider — View assigned deliveries, update delivery status'));
children.push(bullet('Cashier — Process payments and view payment history only'));
children.push(bullet('Every action is logged in an immutable audit trail'));

children.push(emptyLine());
children.push(heading('14. Offline-First Technology'));
children.push(para('The system operates at full capacity WITHOUT internet — critical for Philippine businesses where connectivity can be unreliable.'));
children.push(bullet('Local database stores all data on the device (IndexedDB in browser)'));
children.push(bullet('All CRUD operations work instantly offline'));
children.push(bullet('Automatic background sync when internet is available'));
children.push(bullet('Idempotent operations — no duplicate data on sync'));
children.push(bullet('Conflict resolution: Last-write-wins, per-field merge, manual resolution'));
children.push(bullet('Sync queue with retry logic and dead-letter handling'));
children.push(bullet('PWA installable — works like a native app on any device'));

// ─── 15-17. METADATA, TECH, SECURITY ────────────────────
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading('15. Metadata-Driven Customization'));
children.push(para('Every business rule, pricing model, workflow, and promotion is stored as JSON metadata — not hardcoded. This means:'));  
children.push(bullet('New features added without code changes — just update metadata'));
children.push(bullet('Different tenants have different configurations — no code forks'));
children.push(bullet('Branch-specific overrides without duplicating data'));
children.push(bullet('A/B testing of pricing and promotions'));
children.push(bullet('Instant configuration changes — no redeployment needed'));
children.push(emptyLine());
children.push(para('Configurable via metadata:', { bold: true }));
children.push(bullet('Loyalty point rates and redemption values'));
children.push(bullet('Tier thresholds and discount percentages'));
children.push(bullet('Express/Rush surcharge multipliers'));
children.push(bullet('VAT rate and threshold'));
children.push(bullet('Turnaround SLA times per priority'));
children.push(bullet('Custom fields per entity'));
children.push(bullet('Approval workflows'));
children.push(bullet('UI theme colors and branding'));

children.push(emptyLine());
children.push(heading('16. Technical Architecture'));
children.push(emptyLine());
children.push(para('Frontend (PWA):', { bold: true }));
children.push(bullet('React 19 with TypeScript — type-safe, component-driven'));
children.push(bullet('TanStack Router — file-based routing, lazy loading'));
children.push(bullet('TanStack Query — server state management'));
children.push(bullet('Zustand — client state management'));
children.push(bullet('Tailwind CSS — utility-first styling'));
children.push(bullet('React Hook Form + Zod — type-safe form validation'));
children.push(bullet('Dexie.js — IndexedDB wrapper for offline storage'));
children.push(bullet('Vite — fast build tool with PWA plugin'));
children.push(emptyLine());
children.push(para('Backend:', { bold: true }));
children.push(bullet('Supabase PostgreSQL — managed, scalable database'));
children.push(bullet('Row-Level Security — tenant data isolation at database level'));
children.push(bullet('Supabase Auth — JWT-based authentication'));
children.push(bullet('Supabase Realtime — live data sync'));
children.push(bullet('Hono.js — lightweight API server for sync endpoints'));
children.push(emptyLine());
children.push(para('Infrastructure:', { bold: true }));
children.push(bullet('Vercel — global CDN deployment, instant rollbacks'));
children.push(bullet('GitHub Actions — CI/CD pipeline with automated testing'));
children.push(bullet('Playwright — end-to-end browser testing'));
children.push(bullet('Vitest — unit and integration testing'));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ─── 17. SECURITY & COMPLIANCE ──────────────────────────
children.push(heading('17. Security & Compliance'));
children.push(bullet('All data encrypted at rest (AES-256) and in transit (TLS 1.3)'));
children.push(bullet('Tenant isolation enforced at database level via Row-Level Security'));
children.push(bullet('JWT authentication with automatic token refresh'));
children.push(bullet('Role-based access control with granular permissions'));
children.push(bullet('Immutable audit trail — every data change is logged and attributable'));
children.push(bullet('Soft delete — data is never permanently destroyed'));
children.push(bullet('Automatic daily database backups (Supabase PITR)'));
children.push(bullet('GDPR-compliant data handling (customer data export/deletion)'));
children.push(bullet('Brute-force protection via rate limiting'));
children.push(bullet('Regular security updates and vulnerability scanning'));

// ─── 18. TIMELINE ───────────────────────────────────────
children.push(emptyLine());
children.push(heading('18. Implementation Timeline'));
children.push(emptyLine());

const timeline = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: [
        new TableCell({ shading: { type: ShadingType.SOLID, color: BLUE }, width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Phase', bold: true, color: WHITE, size: 20 })] })] }),
        new TableCell({ shading: { type: ShadingType.SOLID, color: BLUE }, width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Duration', bold: true, color: WHITE, size: 20 })] })] }),
        new TableCell({ shading: { type: ShadingType.SOLID, color: BLUE }, width: { size: 55, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Deliverables', bold: true, color: WHITE, size: 20 })] })] }),
      ],
    }),
    featureRow('Phase 1: Foundation', 'Week 1–2', 'Database setup, tenant onboarding, core entity deployment, admin dashboard, staff role configuration'),
    featureRow('Phase 2: Core Operations', 'Week 3–4', 'Customer registration, order workflow, service catalog setup, payment processing, receipt printing'),
    featureRow('Phase 3: Advanced Features', 'Week 5–6', 'Loyalty engine, promotions, inventory management, multi-branch configuration, reporting dashboard'),
    featureRow('Phase 4: Customer App', 'Week 7–8', 'Customer PWA deployment, push notifications, order tracking, loyalty dashboard, branch locator'),
    featureRow('Phase 5: Go Live', 'Week 9–10', 'Data migration from existing systems, staff training (2 days onsite), UAT, production cutover, hypercare support'),
  ],
});
children.push(timeline);

// ─── 19. PRICING ────────────────────────────────────────
children.push(emptyLine());
children.push(heading('19. Pricing & Plans'));
children.push(emptyLine());

const pricing = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: [
        new TableCell({ shading: { type: ShadingType.SOLID, color: BLUE }, width: { size: 16, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: '', bold: true, color: WHITE, size: 20 })] })] }),
        new TableCell({ shading: { type: ShadingType.SOLID, color: BLUE }, width: { size: 28, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Starter', bold: true, color: WHITE, size: 20 })] })] }),
        new TableCell({ shading: { type: ShadingType.SOLID, color: BLUE }, width: { size: 28, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Professional', bold: true, color: WHITE, size: 20 })] })] }),
        new TableCell({ shading: { type: ShadingType.SOLID, color: BLUE }, width: { size: 28, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Enterprise', bold: true, color: WHITE, size: 20 })] })] }),
      ],
    }),
    featureRow('Price/Month', '₱2,999', '₱5,999', '₱12,999'),
    featureRow('Branches', '1 Branch', 'Up to 5 Branches', 'Unlimited'),
    featureRow('Staff Users', 'Up to 5', 'Up to 20', 'Unlimited'),
    featureRow('Customer App', '✓', '✓', '✓'),
    featureRow('Loyalty Program', 'Basic', 'Full', 'Full + Custom'),
    featureRow('Inventory', '✓', '✓', '✓'),
    featureRow('Reports', 'Standard', 'Advanced', 'Custom + API'),
    featureRow('Custom Branding', '—', '✓', '✓'),
    featureRow('Priority Support', 'Email', 'Email + Chat', 'Dedicated Manager'),
    featureRow('SLA', '48h response', '24h response', '4h response'),
  ],
});
children.push(pricing);
children.push(emptyLine());
children.push(small('All plans include: unlimited orders, automatic updates, data backups, SSL encryption. Annual billing = 2 months free.'));

// ─── 20. WHY THIS SOLUTION ──────────────────────────────
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading('20. Why This Solution'));
children.push(emptyLine());
children.push(para('Proven Technology', { bold: true }));
children.push(bullet('Built on the same architecture that powers cooperative banking systems, medical clinics, water stations, and driving schools — handling thousands of transactions daily.'));
children.push(bullet('The offline-first engine has been battle-tested in areas with intermittent connectivity across the Philippines.'));
children.push(emptyLine());
children.push(para('Future-Proof', { bold: true }));
children.push(bullet('Metadata-driven means you can add new services, change pricing, create promotions, and customize workflows WITHOUT any code changes.'));
children.push(bullet('The system grows with your business — from 1 branch to 100, the architecture scales seamlessly.'));
children.push(emptyLine());
children.push(para('No Vendor Lock-in', { bold: true }));
children.push(bullet('Your data lives in YOUR Supabase database. Export it anytime.'));
children.push(bullet('Open standards: PostgreSQL, TypeScript, React. No proprietary black boxes.'));
children.push(emptyLine());
children.push(para('Rapid Deployment', { bold: true }));
children.push(bullet('Go from signing to live in 10 weeks. Existing data migrated. Staff trained.'));
children.push(bullet('PWA means no app store approval — customers start using immediately.'));

children.push(emptyLine(), emptyLine());
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 400, after: 200 },
  children: [new TextRun({ text: '━━━━━━━━━━━━━━━━━━━━━━━━━', size: 28, color: ACCENT })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Thank you for considering our solution.', size: 24, color: DARK, italics: true })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text: 'For inquiries and technical demo, please contact our sales team.', size: 22, color: GRAY })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Live Demo: https://meta.8-v.cc', size: 22, bold: true, color: BLUE })],
}));

// ═══════════════════════════════════════════════════════════════
// BUILD DOCUMENT
// ═══════════════════════════════════════════════════════════════

const doc = new Document({
  creator: 'CoopERP — Laundry Shop Management System',
  title: 'Laundry Shop Management System — Business Proposal',
  description: 'Comprehensive multi-branch laundry management solution with customer app, loyalty engine, and offline-first architecture',
  sections: [{
    properties: {
      page: {
        margin: { top: convertInchesToTwip(0.8), bottom: convertInchesToTwip(0.8), left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'Laundry Shop Management System — Business Proposal', size: 16, color: GRAY, italics: true })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Page ', size: 16, color: GRAY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAY }), new TextRun({ text: ' | Confidential', size: 16, color: GRAY })],
        })],
      }),
    },
    children,
  }],
});

const outputPath = 'docs/LAUNDRY_SHOP_PROPOSAL.docx';
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log('✅ Proposal generated:', outputPath);
  console.log('   Size:', (buffer.length / 1024).toFixed(1), 'KB');
});
