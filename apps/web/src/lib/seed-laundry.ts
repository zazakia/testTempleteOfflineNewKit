/**
 * ─── Laundry Shop Mock Data ──────────────────────────────────
 * 49 realistic records for demonstration and testing.
 */
import type { CreateInput } from '@repo/core'
import type {
  LaundryCustomer,
  LaundryService,
  LaundryOrder,
  LaundryPayment,
  LaundryInventory,
} from '@repo/entity-laundry'

export interface SeedCustomer extends Omit<CreateInput<LaundryCustomer>, 'tenantId'> {
  tenantId: string
}
export interface SeedService extends Omit<CreateInput<LaundryService>, 'tenantId'> {
  tenantId: string
}
export interface SeedOrder extends Omit<CreateInput<LaundryOrder>, 'tenantId'> {
  tenantId: string
}
export interface SeedPayment extends Omit<CreateInput<LaundryPayment>, 'tenantId'> {
  tenantId: string
}
export interface SeedInventory extends Omit<CreateInput<LaundryInventory>, 'tenantId'> {
  tenantId: string
}

const tid = 'default'
const today = '2026-07-17'

export const SEED_LAUNDRY_CUSTOMERS = [
  { tenantId: tid, customerCode: 'LC-001', firstName: 'Maria', lastName: 'Dela Cruz', fullName: 'Maria Dela Cruz', phone: '+639171234567', customerType: 'regular' as const, customerTier: 'gold' as const, lifetimeSpend: 32000, loyaltyPoints: 320, status: 'active' as const },
  { tenantId: tid, customerCode: 'LC-002', firstName: 'Juan', lastName: 'Santos', fullName: 'Juan Santos', phone: '+639181234568', customerType: 'regular' as const, customerTier: 'silver' as const, lifetimeSpend: 8500, loyaltyPoints: 85, status: 'active' as const },
  { tenantId: tid, customerCode: 'LC-003', firstName: 'Elena', lastName: 'Reyes', fullName: 'Elena Reyes', phone: '+639191234569', customerType: 'walk_in' as const, customerTier: 'bronze' as const, lifetimeSpend: 1500, loyaltyPoints: 15, status: 'active' as const },
  { tenantId: tid, customerCode: 'LC-004', firstName: 'Pedro', lastName: 'Gonzales', fullName: 'Pedro Gonzales', phone: '+639201234570', customerType: 'corporate' as const, customerTier: 'platinum' as const, lifetimeSpend: 78000, loyaltyPoints: 780, status: 'active' as const },
  { tenantId: tid, customerCode: 'LC-005', firstName: 'Sofia', lastName: 'Lim', fullName: 'Sofia Lim', phone: '+639211234571', customerType: 'regular' as const, customerTier: 'silver' as const, lifetimeSpend: 12000, loyaltyPoints: 120, status: 'active' as const },
  { tenantId: tid, customerCode: 'LC-006', firstName: 'Roberto', lastName: 'Aquino', fullName: 'Roberto Aquino', phone: '+639221234572', customerType: 'walk_in' as const, customerTier: 'bronze' as const, lifetimeSpend: 800, loyaltyPoints: 8, status: 'active' as const },
  { tenantId: tid, customerCode: 'LC-007', firstName: 'Angela', lastName: 'Torres', fullName: 'Angela Torres', phone: '+639231234573', customerType: 'regular' as const, customerTier: 'gold' as const, lifetimeSpend: 45000, loyaltyPoints: 450, status: 'active' as const },
  { tenantId: tid, customerCode: 'LC-008', firstName: 'Miguel', lastName: 'Castro', fullName: 'Miguel Castro', phone: '+639241234574', customerType: 'walk_in' as const, customerTier: 'bronze' as const, lifetimeSpend: 200, loyaltyPoints: 2, status: 'inactive' as const },
]

export const SEED_LAUNDRY_SERVICES = [
  { tenantId: tid, serviceCode: 'SV-WD-01', name: 'Wash & Dry — Regular', category: 'wash_dry' as const, pricingUnit: 'per_kg' as const, basePrice: 120, minCharge: 80, turnaroundHours: 48, requiresSpecialHandling: false, sortOrder: 1, status: 'active' as const },
  { tenantId: tid, serviceCode: 'SV-WD-02', name: 'Wash & Dry — Express', category: 'wash_dry' as const, pricingUnit: 'per_kg' as const, basePrice: 180, minCharge: 100, turnaroundHours: 24, requiresSpecialHandling: false, sortOrder: 2, status: 'active' as const },
  { tenantId: tid, serviceCode: 'SV-DC-01', name: 'Dry Clean — Suit/Barong', category: 'dry_clean' as const, pricingUnit: 'per_piece' as const, basePrice: 250, minCharge: 250, turnaroundHours: 48, requiresSpecialHandling: true, sortOrder: 3, status: 'active' as const },
  { tenantId: tid, serviceCode: 'SV-DC-02', name: 'Dry Clean — Gown', category: 'dry_clean' as const, pricingUnit: 'per_piece' as const, basePrice: 350, minCharge: 350, turnaroundHours: 72, requiresSpecialHandling: true, sortOrder: 4, status: 'active' as const },
  { tenantId: tid, serviceCode: 'SV-IR-01', name: 'Iron / Press Only', category: 'iron' as const, pricingUnit: 'per_piece' as const, basePrice: 40, minCharge: 40, turnaroundHours: 12, requiresSpecialHandling: false, sortOrder: 5, status: 'active' as const },
  { tenantId: tid, serviceCode: 'SV-FD-01', name: 'Fold Only', category: 'fold' as const, pricingUnit: 'per_kg' as const, basePrice: 50, minCharge: 30, turnaroundHours: 24, requiresSpecialHandling: false, sortOrder: 6, status: 'active' as const },
  { tenantId: tid, serviceCode: 'SV-SR-01', name: 'Stain Removal', category: 'stain_removal' as const, pricingUnit: 'per_piece' as const, basePrice: 80, minCharge: 80, turnaroundHours: 24, requiresSpecialHandling: true, sortOrder: 7, status: 'active' as const },
  { tenantId: tid, serviceCode: 'SV-LC-01', name: 'Leather Jacket Cleaning', category: 'leather_care' as const, pricingUnit: 'per_piece' as const, basePrice: 500, minCharge: 500, turnaroundHours: 72, requiresSpecialHandling: true, sortOrder: 8, status: 'active' as const },
  { tenantId: tid, serviceCode: 'SV-SH-01', name: 'Shoe Cleaning — Sneakers', category: 'shoe_clean' as const, pricingUnit: 'per_pair' as const, basePrice: 200, minCharge: 200, turnaroundHours: 48, requiresSpecialHandling: false, sortOrder: 9, status: 'active' as const },
  { tenantId: tid, serviceCode: 'SV-CR-01', name: 'Curtain Cleaning', category: 'curtain' as const, pricingUnit: 'per_set' as const, basePrice: 400, minCharge: 400, turnaroundHours: 72, requiresSpecialHandling: true, sortOrder: 10, status: 'active' as const },
]

// Note: Order, Payment, Inventory seeds reference IDs generated at runtime,
// so they're seeded procedurally in seed-init.ts after customers/services are created.
