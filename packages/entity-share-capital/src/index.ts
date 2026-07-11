/**
 * ─── @repo/entity-share-capital — Barrel Export ──────────────
 */

export { ShareCapitalEntity } from './share-capital.entity'

export type { ShareCapitalTransaction, ShareCapitalAccount, ShareTransactionType, ShareType } from './share-capital.schema'

export {
  CreateShareCapitalTransactionSchema,
  UpdateShareCapitalTransactionSchema,
  ShareCapitalQuerySchema,
  ShareTransactionTypeSchema,
  ShareTypeSchema,
  SHARE_TRANSACTION_TYPE_LABELS,
  SHARE_TYPE_LABELS,
} from './share-capital.schema'

export { ShareCapitalService } from './share-capital.service'
