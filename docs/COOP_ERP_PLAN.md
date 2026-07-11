# 🤝 Cooperative ERP System — Implementation Plan

> **Building a complete ERP for Philippine Cooperatives** on top of the Offline-First Starter Kit.
> Domain reference: [Sidlak/Infinity Finance](d:/github/sidlak)

---

## Domain Overview

Philippine cooperatives are regulated by the **Cooperative Development Authority (CDA)** and require:

| Area | Requirements |
|---|---|
| **Membership** | Member registration, capital buildup, membership types (regular/associate) |
| **Share Capital** | Subscription, amortization, dividend computation |
| **Savings** | Member savings deposits, withdrawals, time deposits |
| **Lending** | Loan products, applications, approval, disbursement, collection |
| **Accounting** | Double-entry bookkeeping, chart of accounts, financial statements |
| **Governance** | Board of directors, committees, resolutions, meeting attendance |
| **Statutory Funds** | Reserve fund (10%), Education fund (10%), Community Dev (3%), etc. |
| **Payroll** | Employee salaries, deductions, remittances |
| **Collections** | Field collectors, route management, remittance tracking |
| **Water Station** | Water distribution, container tracking, customer management |

---

## Module Architecture

```
                    ┌─────────────────────────────┐
                    │    Cooperative ERP Shell     │
                    │  (Navigation, Auth, Layout)  │
                    └──────────┬──────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Core Services  │  │ Financial Modules │  │  Operations      │
│                  │  │                   │  │                  │
│ • Member Mgmt    │  │ • Share Capital   │  │ • Collections    │
│ • User/RBAC      │  │ • Savings/Deposits│  │ • Water Station  │
│ • Audit Trail    │  │ • Loan Mgmt       │  │ • File Cases     │
│ • Feature Flags  │  │ • Accounting      │  │ • Areas/Zones    │
│ • Settings       │  │ • Payroll         │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Entity Packages

| # | Package | Tables | Priority |
|---|---|---|---|
| 1 | `entity-member` | members, dependents, member_types | P0 |
| 2 | `entity-share-capital` | share_capital_transactions, share_types | P0 |
| 3 | `entity-savings` | savings_accounts, savings_transactions | P0 |
| 4 | `entity-loan` | loan_products, loan_applications, loans, payment_schedules, payments, loan_penalties, guarantors | P0 |
| 5 | `entity-accounting` | chart_of_accounts, journal_entries, journal_entry_lines, financial_periods | P0 |
| 6 | `entity-collection` | collectors, collection_groups, collection_logs, remittances, areas | P0 |
| 7 | `entity-payroll` | employees, payrolls, deductions | P1 |
| 8 | `entity-governance` | committees, committee_members, board_resolutions, meeting_attendance | P1 |
| 9 | `entity-statutory-funds` | statutory_fund_allocations | P1 |
| 10 | `entity-cash-bank` | cash_transactions, bank_accounts, bank_transactions | P1 |
| 11 | `entity-water-station` | ws_customers, ws_deliveries, ws_containers, ws_payments, ws_expenses | P2 |
| 12 | `entity-expense` | expenses, expense_categories | P1 |
| 13 | `entity-reporting` | financial_snapshots, kpi_definitions | P2 |

---

## Implementation Order

### Phase 1: Foundation (P0) — Member + Share Capital + Savings
- Entity packages for members, share capital, savings
- Dexie schema migrations
- CRUD UI pages (list, create, detail)
- Navigation integration

### Phase 2: Core Business (P0) — Loan Management
- Loan products, applications, approval workflow
- Payment scheduling engine
- Payment collection with receipting
- Delinquency tracking

### Phase 3: Finance (P0) — Accounting
- Chart of accounts (CDA-compliant)
- Double-entry journal entries
- Trial balance, income statement, balance sheet
- Auto-posting from loan/savings transactions

### Phase 4: Operations (P1) — Collections + Payroll + Governance
- Collector management with route planning
- Payroll processing
- Committee management and board resolutions

### Phase 5: Compliance (P1) — Statutory Funds + Reporting
- CDA-mandated fund allocations
- Regulatory report generation
- Financial snapshots

### Phase 6: Extensions (P2) — Water Station
- Water delivery tracking
- Container management
- Customer billing

---

## Tech Stack (Inherited from Starter Kit)

| Layer | Technology |
|---|---|
| Web | React 19 + Vite 6 + Tailwind CSS |
| Local DB | Dexie.js (IndexedDB) |
| State | Zustand + TanStack Query |
| Validation | Zod |
| Forms | React Hook Form + Zod resolvers |
| Routing | TanStack Router |
| PWA | vite-plugin-pwa |
| Sync | Custom sync engine (pluggable) |

---

## CDA-Compliant Chart of Accounts Structure

```
1xx - ASSETS
  110 - Cash and Cash Equivalents
  120 - Loans and Receivables
  130 - Investments
  140 - Property and Equipment
2xx - LIABILITIES
  210 - Deposits and Savings
  220 - Loans Payable
  230 - Accounts Payable
3xx - EQUITY
  310 - Share Capital
  320 - Reserve Fund
  330 - Undistributed Net Surplus
4xx - INCOME
  410 - Interest Income on Loans
  420 - Service Fees
5xx - EXPENSES
  510 - Interest Expense
  520 - Personnel Costs
  530 - Administrative Expenses
  540 - CDA Mandatory Funds
```

---

## Key Business Rules (Philippine Cooperatives)

1. **Membership**: Must complete PMES (Pre-Membership Education Seminar)
2. **Share Capital**: Minimum capital subscription required, can be amortized
3. **Statutory Funds**: Net surplus allocated as: Reserve (10%), Education (10%), Community Dev (3%), optional funds per by-laws
4. **Loan Interest**: Maximum rates regulated by CDA, varies by loan type
5. **Patronage Refund**: Distributed based on member's transaction volume
6. **Dividends**: Based on share capital contribution
7. **Collection**: Field collectors follow assigned routes, remit daily
