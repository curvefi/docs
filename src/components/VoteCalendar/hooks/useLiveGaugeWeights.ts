import { useCallback, useRef, useState } from 'react'
import { createPublicClient, http, fallback } from 'viem'
import { mainnet } from 'viem/chains'
import { EpochDistributionRow } from '../types'
import { EPOCH_PERIOD, epochStart } from '../utils'

// Live on-chain gauge weight distribution for the CURRENT epoch. The precomputed
// static file only has weights as of the last sync; for the ongoing (not-yet-
// finalised) epoch we read gauge_relative_weight straight from the GaugeController
// via a multicall, so the numbers track live votes. Uses only free public RPCs
// (no API keys) behind a fallback, mirroring ProtocolMap/hooks/useLiveData.ts.

const GAUGE_CONTROLLER = '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB' as const
const CRV = '0xD533a949740bb3306d119CC777fa900bA034cd52' as const
const OVERVIEW_API = 'https://prices.curve.finance/v1/dao/gauges/overview'

const gcAbi = [
  {
    name: 'gauge_relative_weight',
    inputs: [{ name: 'addr', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const crvAbi = [
  { name: 'rate', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
] as const

const client = createPublicClient({
  chain: mainnet,
  transport: fallback([
    http('https://ethereum-rpc.publicnode.com/'),
    http('https://rpc.ankr.com/eth'),
    http('https://eth.drpc.org'),
    http('https://1rpc.io/eth'),
  ]),
  batch: { multicall: true },
})

// The installed viem version ships over-strict call-param generics (the repo's
// ProtocolMap/hooks/useLiveData.ts hits the same friction). We only need two
// read methods, so go through a thin typed facade that keeps the result types.
type MulticallResult = { status: 'success' | 'failure'; result?: bigint }
const rpc = client as unknown as {
  multicall(args: { contracts: unknown[]; allowFailure: boolean }): Promise<MulticallResult[]>
  readContract(args: unknown): Promise<bigint>
}

type Status = 'idle' | 'loading' | 'ready' | 'error'

// Persisted cache: the current epoch's weights drift slowly, so we keep the last
// read in localStorage for a short TTL and reuse it across reloads instead of
// hammering the RPC on every page load. Invalidated when the epoch rolls over.
const CACHE_KEY = 'curve-vote-calendar-live-gauges'
const CACHE_VERSION = 1
const TTL_MS = 10 * 60 * 1000 // 10 minutes

interface LiveCache {
  version: number
  epoch: number
  fetchedAt: number
  rows: EpochDistributionRow[]
}

function readCache(): EpochDistributionRow[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as LiveCache
    if (c.version !== CACHE_VERSION) return null
    if (Date.now() - c.fetchedAt > TTL_MS) return null
    if (c.epoch !== epochStart(Date.now() / 1000)) return null // epoch rolled over
    return c.rows
  } catch {
    return null
  }
}

function writeCache(rows: EpochDistributionRow[]): void {
  try {
    const c: LiveCache = { version: CACHE_VERSION, epoch: epochStart(Date.now() / 1000), fetchedAt: Date.now(), rows }
    localStorage.setItem(CACHE_KEY, JSON.stringify(c))
  } catch {
    // localStorage may be unavailable/full — ignore, it's only a cache.
  }
}

let cachedRows: EpochDistributionRow[] | null = null
let inflight: Promise<EpochDistributionRow[]> | null = null

/** Module + localStorage-backed initial value (within TTL and same epoch). */
function getInitialRows(): EpochDistributionRow[] | null {
  if (cachedRows) return cachedRows
  const c = readCache()
  if (c) cachedRows = c
  return cachedRows
}

export interface LiveGaugeWeightsApi {
  status: Status
  error: string | null
  rows: EpochDistributionRow[]
  ensureLoaded: () => void
}

interface OverviewGauge {
  address: string
  name: string | null
  pool: { name: string | null } | null
}

async function fetchLive(): Promise<EpochDistributionRow[]> {
  const res = await fetch(OVERVIEW_API)
  if (!res.ok) throw new Error(`overview HTTP ${res.status}`)
  const json = await res.json()
  const gauges: OverviewGauge[] = json?.gauges ?? []

  // Dedupe by address (overview can repeat a gauge across chain views).
  const seen = new Set<string>()
  const list = gauges.filter((g) => {
    const a = (g.address || '').toLowerCase()
    if (!a || seen.has(a)) return false
    seen.add(a)
    return true
  })

  const weightCalls = list.map((g) => ({
    address: GAUGE_CONTROLLER,
    abi: gcAbi,
    functionName: 'gauge_relative_weight' as const,
    args: [g.address as `0x${string}`] as const,
  }))

  const [weights, rate] = await Promise.all([
    rpc.multicall({ contracts: weightCalls, allowFailure: true }),
    rpc.readContract({ address: CRV, abi: crvAbi, functionName: 'rate' }),
  ])

  // Weekly CRV inflation split by each gauge's relative weight (matches how the
  // sync script's emissions are derived): emissions = rate(CRV/s) · WEEK · weight.
  const weeklyCrv = (Number(rate) / 1e18) * EPOCH_PERIOD

  const rows: EpochDistributionRow[] = []
  list.forEach((g, i) => {
    const r = weights[i]
    const w = r?.status === 'success' ? Number(r.result) / 1e18 : 0
    if (!(w > 0)) return
    rows.push({
      address: g.address.toLowerCase(),
      name: g.pool?.name ?? g.name ?? g.address,
      poolName: g.pool?.name ?? null,
      relativeWeight: w,
      emissions: w * weeklyCrv,
    })
  })
  rows.sort((a, b) => b.relativeWeight - a.relativeWeight)
  writeCache(rows)
  return rows
}

export function useLiveGaugeWeights(): LiveGaugeWeightsApi {
  const [status, setStatus] = useState<Status>(getInitialRows() ? 'ready' : 'idle')
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  const ensureLoaded = useCallback(() => {
    if (cachedRows || started.current) return
    started.current = true
    setStatus('loading')
    const p = inflight ?? (inflight = fetchLive())
    p.then((rows) => {
      cachedRows = rows
      setStatus('ready')
    }).catch((e) => {
      inflight = null
      started.current = false
      setError((e as Error).message)
      setStatus('error')
    })
  }, [])

  return { status, error, rows: cachedRows ?? [], ensureLoaded }
}
