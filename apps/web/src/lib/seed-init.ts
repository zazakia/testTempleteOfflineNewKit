/**
 * ─── Seed Initialization ─────────────────────────────────────
 * Seeds default data on first launch (tracked via localStorage).
 */

import {
  chartOfAccountRepo,
  laundryCustomerRepo,
  laundryServiceRepo,
  laundryOrderRepo,
  laundryPaymentRepo,
  laundryInventoryRepo,
} from './db'
import { DEFAULT_CHART_OF_ACCOUNTS } from './seed-data'
import { SEED_LAUNDRY_CUSTOMERS, SEED_LAUNDRY_SERVICES } from './seed-laundry'

const SEED_KEY = 'cooperp_seeded_v2'

export async function initializeSeedData(): Promise<void> {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(SEED_KEY)) return

  try {
    console.log('[Seed] Initializing default data...')
    const tid = 'default'

    // Seed Chart of Accounts
    const existingCoA = await chartOfAccountRepo.count({})
    if (existingCoA === 0) {
      for (const account of DEFAULT_CHART_OF_ACCOUNTS) {
        await chartOfAccountRepo.create({
          ...account,
          tenantId: tid,
          createdBy: 'system',
          updatedBy: 'system',
        } as any)
      }
      console.log(`[Seed] Created ${DEFAULT_CHART_OF_ACCOUNTS.length} chart of accounts`)
    }

    // ─── Laundry Shop Mock Data ──────────────────────────
    const existingLaundry = await laundryCustomerRepo.count({})
    if (existingLaundry === 0) {
      // 1. Seed Customers
      const customerIds: { id: string; name: string }[] = []
      for (const c of SEED_LAUNDRY_CUSTOMERS) {
        const created = await laundryCustomerRepo.create(c as any)
        customerIds.push({ id: created.id, name: created.fullName })
      }
      console.log(`[Seed] ${SEED_LAUNDRY_CUSTOMERS.length} laundry customers`)

      // 2. Seed Services
      const serviceIds: { id: string; name: string; price: number }[] = []
      for (const s of SEED_LAUNDRY_SERVICES) {
        const created = await laundryServiceRepo.create(s as any)
        serviceIds.push({ id: created.id, name: created.name, price: created.basePrice })
      }
      console.log(`[Seed] ${SEED_LAUNDRY_SERVICES.length} laundry services`)

      // 3. Seed Orders (15 orders)
      const today = '2026-07-17'
      const orderDefs = [
        { code: 'LO-0001', ci: 0, si: 0, qty: 5, status: 'picked_up' as const, pay: 'paid' as const, pri: 'normal' as const, date: '2026-07-15', pickup: '2026-07-17', amt: 600, paid: 600, del: false, df: 0 },
        { code: 'LO-0002', ci: 1, si: 2, qty: 2, status: 'picked_up' as const, pay: 'paid' as const, pri: 'express' as const, date: '2026-07-16', pickup: '2026-07-17', amt: 500, paid: 500, del: false, df: 0 },
        { code: 'LO-0003', ci: 2, si: 0, qty: 3, status: 'ready_for_pickup' as const, pay: 'unpaid' as const, pri: 'normal' as const, date: today, pickup: '2026-07-19', amt: 360, paid: 0, del: false, df: 0 },
        { code: 'LO-0004', ci: 3, si: 3, qty: 1, status: 'in_process' as const, pay: 'partial' as const, pri: 'rush' as const, date: today, pickup: today, amt: 350, paid: 200, del: false, df: 0 },
        { code: 'LO-0005', ci: 4, si: 1, qty: 4, status: 'in_process' as const, pay: 'unpaid' as const, pri: 'normal' as const, date: today, pickup: '2026-07-19', amt: 720, paid: 0, del: false, df: 0 },
        { code: 'LO-0006', ci: 5, si: 4, qty: 5, status: 'dropped_off' as const, pay: 'unpaid' as const, pri: 'normal' as const, date: today, pickup: '2026-07-20', amt: 200, paid: 0, del: false, df: 0 },
        { code: 'LO-0007', ci: 6, si: 6, qty: 3, status: 'sorted' as const, pay: 'unpaid' as const, pri: 'normal' as const, date: today, pickup: '2026-07-19', amt: 240, paid: 0, del: false, df: 0 },
        { code: 'LO-0008', ci: 0, si: 0, qty: 8, status: 'delivered' as const, pay: 'paid' as const, pri: 'express' as const, date: '2026-07-16', pickup: '2026-07-17', amt: 960, paid: 960, del: true, df: 100 },
        { code: 'LO-0009', ci: 3, si: 7, qty: 1, status: 'quality_check' as const, pay: 'partial' as const, pri: 'normal' as const, date: '2026-07-16', pickup: '2026-07-19', amt: 500, paid: 300, del: false, df: 0 },
        { code: 'LO-0010', ci: 1, si: 5, qty: 10, status: 'ready_for_pickup' as const, pay: 'paid' as const, pri: 'normal' as const, date: '2026-07-16', pickup: today, amt: 500, paid: 500, del: false, df: 0 },
        { code: 'LO-0011', ci: 7, si: 9, qty: 2, status: 'cancelled' as const, pay: 'refunded' as const, pri: 'normal' as const, date: '2026-07-15', pickup: '2026-07-17', amt: 800, paid: 800, del: false, df: 0 },
        { code: 'LO-0012', ci: 4, si: 2, qty: 2, status: 'dropped_off' as const, pay: 'unpaid' as const, pri: 'rush' as const, date: today, pickup: today, amt: 500, paid: 0, del: false, df: 0 },
        { code: 'LO-0013', ci: 6, si: 8, qty: 1, status: 'dropped_off' as const, pay: 'unpaid' as const, pri: 'normal' as const, date: today, pickup: '2026-07-21', amt: 200, paid: 0, del: false, df: 0 },
        { code: 'LO-0014', ci: 2, si: 4, qty: 6, status: 'in_process' as const, pay: 'unpaid' as const, pri: 'normal' as const, date: today, pickup: '2026-07-19', amt: 240, paid: 0, del: false, df: 0 },
        { code: 'LO-0015', ci: 5, si: 0, qty: 2, status: 'dropped_off' as const, pay: 'unpaid' as const, pri: 'express' as const, date: today, pickup: '2026-07-18', amt: 240, paid: 0, del: false, df: 0 },
      ];

      const orderIds: string[] = []
      for (const o of orderDefs) {
        const cust = customerIds[o.ci]!
        const svc = serviceIds[o.si]!
        const items = [{ serviceId: svc.id, serviceName: svc.name, quantity: o.qty, unitPrice: svc.price, lineTotal: o.amt }]
        const total = o.amt + o.df
        const created = await laundryOrderRepo.create({
          tenantId: tid, orderCode: o.code, customerId: cust.id, customerName: cust.name,
          orderDate: o.date, dropOffTime: '09:00',
          promisedPickupDate: o.pickup, promisedPickupTime: '17:00',
          items, totalWeight: o.qty, subtotal: o.amt,
          discountAmount: 0, taxAmount: 0, totalAmount: total,
          amountPaid: o.paid, balance: total - o.paid,
          paymentStatus: o.pay, orderStatus: o.status, orderPriority: o.pri,
          receivedBy: 'Staff A', isDelivery: o.del, deliveryFee: o.df,
        } as any)
        orderIds.push(created.id)
      }
      console.log(`[Seed] ${orderDefs.length} laundry orders`)

      // 4. Seed Payments
      const paymentDefs = [
        { code: 'LP-0001', oi: 0, ci: 0, amt: 600, method: 'cash' as const, ref: undefined, ptsR: 0, ptsE: 6 },
        { code: 'LP-0002', oi: 1, ci: 1, amt: 500, method: 'gcash' as const, ref: 'GC-REF-001', ptsR: 0, ptsE: 5 },
        { code: 'LP-0003', oi: 3, ci: 3, amt: 200, method: 'maya' as const, ref: 'MY-REF-001', ptsR: 0, ptsE: 2 },
        { code: 'LP-0004', oi: 7, ci: 0, amt: 960, method: 'bank_transfer' as const, ref: 'BPI-TRF-001', ptsR: 0, ptsE: 10 },
        { code: 'LP-0005', oi: 8, ci: 3, amt: 300, method: 'card' as const, ref: 'VISA-1234', ptsR: 0, ptsE: 3 },
        { code: 'LP-0006', oi: 9, ci: 1, amt: 500, method: 'cash' as const, ref: undefined, ptsR: 0, ptsE: 5 },
        { code: 'LP-0007', oi: 10, ci: 7, amt: 800, method: 'gcash' as const, ref: 'GC-REFUND', ptsR: 800, ptsE: 0 },
        { code: 'LP-0008', oi: 7, ci: 0, amt: 100, method: 'cash' as const, ref: undefined, ptsR: 0, ptsE: 1 },
      ];
      for (const p of paymentDefs) {
        await laundryPaymentRepo.create({
          tenantId: tid, paymentCode: p.code,
          orderId: orderIds[p.oi]!, customerId: customerIds[p.ci]!.id,
          paymentDate: today, paymentTime: '14:00',
          amount: p.amt, paymentMethod: p.method,
          referenceNumber: p.ref, loyaltyPointsRedeemed: p.ptsR,
          loyaltyPointsEarned: p.ptsE, receivedBy: 'Cashier B',
        } as any)
      }
      console.log(`[Seed] ${paymentDefs.length} laundry payments`)

      // 5. Seed Inventory
      const invDefs = [
        { code: 'LI-DT-01', name: 'Tide Original Detergent 5L', cat: 'detergent' as const, unit: 'liter' as const, qty: 45, min: 10, max: 100, cost: 450, supplier: 'Procter & Gamble PH' },
        { code: 'LI-DT-02', name: 'Ariel Power Gel 3L', cat: 'detergent' as const, unit: 'liter' as const, qty: 30, min: 8, max: 80, cost: 380, supplier: 'Procter & Gamble PH' },
        { code: 'LI-SF-01', name: 'Downy Fabric Softener 4L', cat: 'softener' as const, unit: 'liter' as const, qty: 25, min: 5, max: 60, cost: 320, supplier: 'Procter & Gamble PH' },
        { code: 'LI-BL-01', name: 'Zonrox Bleach 3.78L', cat: 'bleach' as const, unit: 'bottle' as const, qty: 12, min: 4, max: 30, cost: 180, supplier: 'Green Cross Inc.' },
        { code: 'LI-SR-01', name: 'Stain Remover Spray 500ml', cat: 'stain_remover' as const, unit: 'bottle' as const, qty: 8, min: 3, max: 20, cost: 150, supplier: 'Local Distributor' },
        { code: 'LI-PK-01', name: 'Plastic Packaging Rolls (100m)', cat: 'packaging' as const, unit: 'pack' as const, qty: 15, min: 3, max: 40, cost: 250, supplier: 'Packwell Supplies' },
        { code: 'LI-HG-01', name: 'Wooden Hangers (50pcs)', cat: 'hanger' as const, unit: 'pack' as const, qty: 4, min: 2, max: 10, cost: 600, supplier: 'HomePlus Depo', exp: '2027-12-31' },
        { code: 'LI-TG-01', name: 'Garment Tags (1000pcs)', cat: 'tag' as const, unit: 'pack' as const, qty: 2, min: 1, max: 5, cost: 350, supplier: 'TagMaster Inc.' },
      ];
      for (const inv of invDefs) {
        const status = inv.qty <= inv.min ? 'low_stock' as const : 'in_stock' as const
        await laundryInventoryRepo.create({
          tenantId: tid, itemCode: inv.code, name: inv.name,
          category: inv.cat, unit: inv.unit,
          quantityOnHand: inv.qty, minStockLevel: inv.min,
          maxStockLevel: inv.max, costPerUnit: inv.cost,
          supplierName: inv.supplier, status,
          expirationDate: (inv as any).exp,
        } as any)
      }
      console.log(`[Seed] ${invDefs.length} laundry inventory items`)

      console.log('[Seed] 🧺 Laundry shop: 49 records seeded')
    }

    localStorage.setItem(SEED_KEY, 'true')
    console.log('[Seed] Initialization complete')
  } catch (error) {
    console.error('[Seed] Error:', error)
  }
}
