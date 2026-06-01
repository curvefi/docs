import { useEffect, useState } from 'react'
import { Proposal } from '../types'

// The curve-prices API returns every proposal (currently ~1.5k) in a single
// request when the page size is large enough, so we fetch once and filter
// client-side. Mirrors the fetch + `cancelled` pattern used elsewhere in this
// repo (see ProtocolMap/hooks/useCrvusdMarkets.ts).
const PROPOSALS_API = 'https://prices.curve.finance/v1/dao/proposals?pagination=2000&page=1'
const CACHE_KEY = 'curve-vote-calendar-proposals'

export interface ProposalsData {
  proposals: Proposal[]
  loading: boolean
  error: string | null
}

function readCache(): Proposal[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as Proposal[]) : null
  } catch {
    return null
  }
}

function writeCache(proposals: Proposal[]): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(proposals))
  } catch {
    // sessionStorage may be unavailable or full — ignore, it's only a cache.
  }
}

export function useProposals(): ProposalsData {
  const cached = readCache()
  const [data, setData] = useState<ProposalsData>({
    proposals: cached ?? [],
    loading: cached === null,
    error: null,
  })

  useEffect(() => {
    if (cached !== null) return // already have a cached copy for this session
    let cancelled = false

    async function fetchData() {
      try {
        const res = await fetch(PROPOSALS_API)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (cancelled) return
        const proposals: Proposal[] = json?.proposals ?? []
        writeCache(proposals)
        setData({ proposals, loading: false, error: null })
      } catch (e) {
        if (!cancelled) {
          setData({ proposals: [], loading: false, error: (e as Error).message })
        }
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return data
}
