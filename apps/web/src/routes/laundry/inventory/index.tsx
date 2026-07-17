/**
 * ─── Laundry Inventory List Page ──────────────────────────────
 */
import { GenericList } from '../../../components/GenericList'
import { laundryInventoryRepo } from '../../../lib/db'

export function LaundryInventoryPage() {
  return (
    <div className="p-6">
      <GenericList
        entityName="laundry_inventory"
        repo={laundryInventoryRepo}
        title="Laundry Inventory"
        columns={[
          { key: 'itemCode', label: 'Item Code' },
          { key: 'name', label: 'Name' },
          { key: 'category', label: 'Category' },
          { key: 'quantityOnHand', label: 'Qty On Hand' },
          { key: 'minStockLevel', label: 'Min Stock' },
          { key: 'costPerUnit', label: 'Cost/Unit' },
          { key: 'status', label: 'Status' },
        ]}
      />
    </div>
  )
}
