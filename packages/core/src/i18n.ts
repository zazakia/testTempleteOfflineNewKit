/**
 * ─── Internationalization (i18n) ─────────────────────────────
 * Lightweight i18n for Philippine cooperatives.
 * Supports English (default) and Tagalog.
 * Extracted strings live in ./locales/{lang}.json
 *
 * Usage:
 *   import { t } from './i18n'
 *   t('dashboard.title') // "Executive Dashboard" or "Pangunahing Dashboard"
 *   t('common.save')     // "Save" or "I-save"
 */

type Locale = 'en' | 'tl'

const DEFAULT_LOCALE: Locale = 'en'

const STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    'app.name': 'CoopERP',
    'app.tagline': 'Enterprise Cooperative ERP — Offline-First',

    'nav.dashboard': 'Dashboard',
    'nav.members': 'Members',
    'nav.loans': 'Loans',
    'nav.payments': 'Payments',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.sync': 'Sync Center',

    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.create': 'Create',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.export': 'Export CSV',
    'common.loading': 'Loading...',
    'common.noData': 'No data found',
    'common.error': 'Something went wrong',
    'common.retry': 'Try Again',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.filter': 'Filter',
    'common.clear': 'Clear',

    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',

    'member.title': 'Members',
    'member.create': 'New Member',
    'member.firstName': 'First Name',
    'member.lastName': 'Last Name',
    'member.phone': 'Phone Number',
    'member.email': 'Email Address',
    'member.status': 'Membership Status',
    'member.membershipNumber': 'Membership Number',

    'loan.title': 'Loans',
    'loan.create': 'New Loan',
    'loan.principal': 'Principal Amount',
    'loan.interest': 'Interest Rate',
    'loan.term': 'Term',
    'loan.status': 'Loan Status',

    'payment.title': 'Payments',
    'payment.amount': 'Amount',
    'payment.date': 'Payment Date',
    'payment.receipt': 'Receipt Number',

    'report.title': 'Reports',
    'report.dashboard': 'Executive Dashboard',
    'report.incomeStatement': 'Income Statement',
    'report.balanceSheet': 'Balance Sheet',
    'report.trialBalance': 'Trial Balance',

    'setting.title': 'Settings',
    'setting.general': 'General',
    'setting.advanced': 'Advanced',
  },

  tl: {
    'app.name': 'CoopERP',
    'app.tagline': 'Sistemang Kooperatiba — Offline-First',

    'nav.dashboard': 'Dashboard',
    'nav.members': 'Mga Miyembro',
    'nav.loans': 'Mga Utang',
    'nav.payments': 'Mga Bayad',
    'nav.reports': 'Mga Ulat',
    'nav.settings': 'Mga Setting',
    'nav.sync': 'Sync Center',

    'common.save': 'I-save',
    'common.cancel': 'Kanselahin',
    'common.create': 'Gumawa',
    'common.edit': 'I-edit',
    'common.delete': 'Burahin',
    'common.search': 'Maghanap',
    'common.export': 'I-export',
    'common.loading': 'Naglo-load...',
    'common.noData': 'Walang datos',
    'common.error': 'May problema',
    'common.retry': 'Subukan Muli',
    'common.confirm': 'Kumpirmahin',
    'common.back': 'Bumalik',
    'common.next': 'Susunod',
    'common.filter': 'Filter',
    'common.clear': 'Burahin',

    'status.active': 'Aktibo',
    'status.inactive': 'Hindi Aktibo',
    'status.pending': 'Nakabinbin',
    'status.approved': 'Aprubado',
    'status.rejected': 'Tinanggihan',

    'member.title': 'Mga Miyembro',
    'member.create': 'Bagong Miyembro',
    'member.firstName': 'Pangalan',
    'member.lastName': 'Apelyido',
    'member.phone': 'Telepono',
    'member.email': 'Email',
    'member.status': 'Katayuan',
    'member.membershipNumber': 'Numero ng Miyembro',

    'loan.title': 'Mga Utang',
    'loan.create': 'Bagong Utang',
    'loan.principal': 'Halaga',
    'loan.interest': 'Interes',
    'loan.term': 'Termino',
    'loan.status': 'Katayuan ng Utang',

    'payment.title': 'Mga Bayad',
    'payment.amount': 'Halaga',
    'payment.date': 'Petsa ng Bayad',
    'payment.receipt': 'Numero ng Resibo',

    'report.title': 'Mga Ulat',
    'report.dashboard': 'Pangunahing Dashboard',
    'report.incomeStatement': 'Pahayag ng Kita',
    'report.balanceSheet': 'Balance Sheet',
    'report.trialBalance': 'Trial Balance',

    'setting.title': 'Mga Setting',
    'setting.general': 'Pangkalahatan',
    'setting.advanced': 'Advanced',
  },
}

let currentLocale: Locale = (() => {
  try {
    const stored = localStorage.getItem('cooperp_locale')
    if (stored === 'tl') return 'tl'
  } catch {}
  return DEFAULT_LOCALE
})()

/** Get a translated string by key */
export function t(key: string, fallback?: string): string {
  return STRINGS[currentLocale]?.[key] ?? fallback ?? key
}

/** Switch locale (persists to localStorage) */
export function setLocale(locale: Locale): void {
  currentLocale = locale
  try { localStorage.setItem('cooperp_locale', locale) } catch {}
}

/** Get current locale */
export function getLocale(): Locale {
  return currentLocale
}
