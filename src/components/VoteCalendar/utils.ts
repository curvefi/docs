// Derivation helpers for the vote calendar: dates, status, quorum/support math.
import { Proposal, ProposalStatus } from './types'
// @ts-ignore — plain JS util, no types
import { formatNumber } from '@site/src/utils/formatters'

/** Regular Curve proposals run for a fixed 7-day window. */
export const VOTING_PERIOD = 604800 // 7 * 24 * 60 * 60

const WAD = 10n ** 18n

/** Unix-seconds end of the voting window. */
export function endDate(p: Proposal): number {
  return p.start_date + VOTING_PERIOD
}

export function startDateObj(p: Proposal): Date {
  return new Date(p.start_date * 1000)
}

export function endDateObj(p: Proposal): Date {
  return new Date(endDate(p) * 1000)
}

function toBig(s: string | null): bigint {
  if (!s) return 0n
  try {
    return BigInt(s)
  } catch {
    return 0n
  }
}

/** Quorum met when votes_for / total_supply >= min_accept_quorum (all 1e18-scaled). */
export function quorumMet(p: Proposal): boolean {
  return toBig(p.votes_for) * WAD >= toBig(p.min_accept_quorum) * toBig(p.total_supply)
}

/** Support met when votes_for / (votes_for + votes_against) >= support_required. */
export function supportMet(p: Proposal): boolean {
  const cast = toBig(p.votes_for) + toBig(p.votes_against)
  if (cast === 0n) return false
  return toBig(p.votes_for) * WAD >= toBig(p.support_required) * cast
}

export function getStatus(p: Proposal, nowSec = Date.now() / 1000): ProposalStatus {
  if (p.executed) return 'executed'
  if (nowSec < endDate(p)) return 'active'
  return quorumMet(p) && supportMet(p) ? 'passed' : 'failed'
}

export const STATUS_LABEL: Record<ProposalStatus, string> = {
  active: 'Active',
  executed: 'Executed',
  passed: 'Passed',
  failed: 'Failed',
}

// --- Fractions for progress bars (0..1) ---

/** Share of total veCRV supply that voted "for". */
export function quorumFraction(p: Proposal): number {
  const total = Number(p.total_supply)
  if (!total) return 0
  return Number(p.votes_for) / total
}

/** Share of cast votes that are "for". */
export function supportFraction(p: Proposal): number {
  const cast = Number(p.votes_for) + Number(p.votes_against)
  if (!cast) return 0
  return Number(p.votes_for) / cast
}

/** A 1e18-scaled threshold string as a 0..1 fraction. */
export function thresholdFraction(scaled: string): number {
  return Number(scaled) / 1e18
}

// --- Display formatting ---

/** 1e18-scaled veCRV string → human number with k/M/B suffix. */
export function formatVeCrv(scaled: string): string {
  return formatNumber(Number(scaled) / 1e18)
}

export function formatPct(fraction: number): string {
  return `${(fraction * 100).toFixed(2)}%`
}

export function shortAddress(addr: string | null): string {
  if (!addr) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

// --- External links ---

export function etherscanTxUrl(hash: string | null): string | null {
  return hash ? `https://etherscan.io/tx/${hash}` : null
}

export function etherscanAddressUrl(addr: string | null): string | null {
  return addr ? `https://etherscan.io/address/${addr}` : null
}

export function ipfsUrl(ipfsMetadata: string | null): string | null {
  if (!ipfsMetadata) return null
  const hash = ipfsMetadata.replace(/^ipfs:/, '').trim()
  return hash ? `https://ipfs.io/ipfs/${hash}` : null
}

export const GOV_FORUM_URL = 'https://gov.curve.finance'
