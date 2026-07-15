/**
 * ─── Print Utility ──────────────────────────────────────────
 * Optimized print styles for PDF export of reports.
 * Include this CSS when printing financial reports for CDA compliance.
 */

export const PRINT_STYLES = `
@media print {
  /* Hide UI chrome */
  nav, header, button, .no-print, [role="navigation"],
  .ToastContainer, .animate-spin, input, select {
    display: none !important;
  }

  /* Full-width printing */
  body { margin: 0; padding: 0; background: white !important; }
  main { margin: 0 !important; padding: 0 !important; overflow: visible !important; }
  
  /* Table formatting */
  table { width: 100% !important; border-collapse: collapse !important; font-size: 11px !important; }
  th, td { padding: 4px 8px !important; border: 1px solid #ccc !important; }
  th { background: #f5f5f5 !important; font-weight: bold !important; }

  /* Page breaks */
  .page-break { page-break-before: always; }
  
  /* KPI cards in print */
  .grid { display: block !important; }
  .grid > div { display: inline-block; width: 23%; margin: 1%; padding: 8px; border: 1px solid #ddd; }
  
  /* Report title */
  h2, h3 { color: #000 !important; }
  
  /* Ensure badges are visible */
  .bg-green-50 { background: #f0fdf4 !important; border: 1px solid #22c55e !important; }
  .bg-red-50 { background: #fef2f2 !important; border: 1px solid #ef4444 !important; }
  .bg-yellow-50 { background: #fefce8 !important; border: 1px solid #eab308 !important; }
  .bg-blue-50 { background: #eff6ff !important; border: 1px solid #3b82f6 !important; }
}
`

/** Trigger browser print dialog */
export function printReport(title?: string) {
  if (title) document.title = title
  window.print()
}
