/**
 * ─── Laundry Payments List Page ───────────────────────────────
 */
import { GenericList } from '../../../components/GenericList'
import { laundryPaymentRepo } from '../../../lib/db'

export function LaundryPaymentsPage() {
  return (
    <div className="p-6">
      <GenericList
        entityName="laundry_payments"
        repo={laundryPaymentRepo}
        title="Laundry Payments"
        columns={[
          { key: 'paymentCode', label: 'Payment Code' },
          { key: 'amount', label: 'Amount' },
          { key: 'paymentMethod', label: 'Method' },
          { key: 'referenceNumber', label: 'Reference' },
          { key: 'paymentDate', label: 'Date' },
          { key: 'receivedBy', label: 'Received By' },
        ]}
      />
    </div>
  )
}
