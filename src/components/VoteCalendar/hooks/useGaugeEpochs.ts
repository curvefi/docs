import { useCallback, useRef, useState } from 'react'
import useBaseUrl from '@docusaurus/useBaseUrl'
import { EpochDistributionRow, GaugeEpochsFile } from '../types'

// Loads the precomputed weekly gauge weight distributions (static/gauge-epochs.json,
// see scripts/sync-gauge-epochs.mjs). The file is several MB, so it's fetched lazily
// — only when the user first clicks a gauge-epoch bar — and held in a module-level
// cache (one copy per session, rather than sessionStorage which is too small).

type Status = 'idle' | 'loading' | 'ready' | 'error'

let cachedFile: GaugeEpochsFile | null = null
let inflight: Promise<GaugeEpochsFile> | null = null

export interface GaugeEpochsApi {
  status: Status
  error: string | null
  /** Unix seconds the static file was generated (null until loaded). */
  generatedAt: number | null
  /** Idempotently kick off the one-time fetch. Safe to call on every bar click. */
  ensureLoaded: () => void
  /** Distribution rows for an epoch (already sorted by weight desc); [] if absent. */
  getDistribution: (epochStartSec: number) => EpochDistributionRow[]
}

export function useGaugeEpochs(): GaugeEpochsApi {
  const url = useBaseUrl('/gauge-epochs.json')
  const [status, setStatus] = useState<Status>(cachedFile ? 'ready' : 'idle')
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  const ensureLoaded = useCallback(() => {
    if (cachedFile || started.current) return
    started.current = true
    setStatus('loading')
    const p =
      inflight ??
      (inflight = fetch(url).then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return (await res.json()) as GaugeEpochsFile
      }))
    p.then((file) => {
      cachedFile = file
      setStatus('ready')
    }).catch((e) => {
      inflight = null
      started.current = false
      setError((e as Error).message)
      setStatus('error')
    })
  }, [url])

  const getDistribution = useCallback(
    (epochStartSec: number): EpochDistributionRow[] => {
      if (!cachedFile) return []
      const rows = cachedFile.epochs[String(epochStartSec)] ?? []
      return rows.map((r) => {
        const meta = cachedFile!.gauges[r.a]
        return {
          address: r.a,
          name: meta?.name ?? r.a,
          poolName: meta?.pool ?? null,
          relativeWeight: r.w,
          emissions: r.e,
        }
      })
    },
    // re-create once data is ready so consumers re-render with the loaded file
    [status],
  )

  return {
    status,
    error,
    generatedAt: cachedFile?.generated_at ?? null,
    ensureLoaded,
    getDistribution,
  }
}
