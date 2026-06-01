// Types for the Curve governance vote calendar.
// Source: https://prices.curve.finance/v1/dao/proposals

export type VoteType = 'ownership' | 'parameter'

/** A single DAO proposal as returned by the curve-prices API. */
export interface Proposal {
  vote_id: number
  vote_type: VoteType
  creator: string
  /** Unix seconds — when the 7-day voting window opens. */
  start_date: number
  snapshot_block: number
  ipfs_metadata: string | null
  /** Decoded, human-readable description. */
  metadata: string | null
  /** veCRV-weighted vote totals, 1e18-scaled decimal strings. */
  votes_for: string
  votes_against: string
  /** Number of distinct voters. */
  vote_count: number
  /** Pass threshold as a 1e18-scaled fraction (e.g. "510000000000000000" = 51%). */
  support_required: string
  /** Quorum threshold as a 1e18-scaled fraction. */
  min_accept_quorum: string
  /** Total veCRV supply at the snapshot block, 1e18-scaled string. */
  total_supply: string
  executed: boolean
  execution_tx: string | null
  execution_date: number | null
  transaction_hash: string | null
  dt: string
}

/** Derived lifecycle state of a proposal, used for colouring/badges. */
export type ProposalStatus = 'active' | 'executed' | 'passed' | 'failed'
