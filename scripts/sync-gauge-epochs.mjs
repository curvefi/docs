#!/usr/bin/env node
// Sweeps every Curve gauge's weight history from the curve-prices API and writes
// a static, epoch-keyed gauge weight distribution to static/gauge-epochs.json.
//
// Gauge weights finalize each week at Thursday 00:00 UTC (Curve's WEEK = 604800s,
// and unix epoch 0 is itself a Thursday, so an epoch start is just
// floor(t / 604800) * 604800). Historical epochs are immutable, so we precompute
// the full distribution once and commit it — the Vote Calendar reads this file for
// past epochs and uses the live /gauges/overview endpoint only for the ongoing one.
//
// There is no bulk historical endpoint, so we fetch per-gauge weight_history for
// every gauge (~1.5k requests) with a bounded concurrency pool. Re-run periodically
// to append newly-finalized epochs:
//
//   yarn sync-gauge-epochs
//
// The output stores the FULL non-zero distribution per epoch (every gauge with
// weight > 0, not just the top N) so the data stays reusable for future features;
// the UI slices to the top 15. Pure-zero entries are dropped (anything not listed
// in an epoch is ~0%, which is lossless for a weight distribution).

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const API = 'https://prices.curve.finance'
const OVERVIEW_URL = `${API}/v1/dao/gauges/overview`
const weightHistoryUrl = (addr) => `${API}/v1/dao/gauges/${addr}/weight_history`

const CONCURRENCY = 15
const OUT_VERSION = 1

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, '..', 'static', 'gauge-epochs.json')

async function fetchJson(url, { retries = 2 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      if (attempt === retries) throw e
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    }
  }
}

/** Run `worker` over `items` with a bounded number of concurrent promises. */
async function pool(items, limit, worker) {
  const results = new Array(items.length)
  let next = 0
  let done = 0
  async function run() {
    while (next < items.length) {
      const i = next++
      results[i] = await worker(items[i], i)
      done++
      if (done % 100 === 0 || done === items.length) {
        process.stdout.write(`  …${done}/${items.length} gauges\n`)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run))
  return results
}

async function main() {
  console.log('Fetching gauge overview…')
  const overview = await fetchJson(OVERVIEW_URL)
  const allGauges = overview?.gauges ?? []
  if (allGauges.length === 0) throw new Error('overview returned no gauges')
  console.log(`  ${allGauges.length} gauges`)

  // address (lowercased) -> display metadata. pool.name is the friendly label
  // (e.g. "crvUSD/zunUSD"); fall back to the gauge name when there's no pool.
  const gaugesMeta = {}
  for (const g of allGauges) {
    const addr = String(g.address).toLowerCase()
    gaugesMeta[addr] = {
      name: g.pool?.name ?? g.name ?? addr,
      pool: g.pool?.name ?? null,
      chain: g.pool?.chain ?? null,
    }
  }

  console.log('Fetching per-gauge weight history…')
  let failed = 0
  // epoch (number) -> array of { a, w, e }
  const epochs = new Map()

  await pool(allGauges, CONCURRENCY, async (g) => {
    const addr = String(g.address).toLowerCase()
    let json
    try {
      json = await fetchJson(weightHistoryUrl(g.address))
    } catch {
      failed++
      return
    }
    for (const rec of json?.data ?? []) {
      // gauge_relative_weight is a 1e18-scaled string ("9567077128701390848" = 9.57%);
      // emissions is already a human CRV number. Verified: per-epoch weights sum to ~1.
      const w = Number(rec.gauge_relative_weight) / 1e18
      if (!(w > 0)) continue
      const epoch = rec.epoch
      if (!epochs.has(epoch)) epochs.set(epoch, [])
      epochs.get(epoch).push({ a: addr, w, e: Number(rec.emissions) || 0 })
    }
  })

  console.log(`  ${failed} gauges failed to fetch (skipped)`) // tolerated

  // Sort each epoch's distribution by relative weight desc, and drop gauges that
  // never appear in any non-zero epoch from the meta dict to keep the file lean.
  const usedAddrs = new Set()
  const epochsOut = {}
  for (const [epoch, rows] of [...epochs.entries()].sort((a, b) => a[0] - b[0])) {
    rows.sort((x, y) => y.w - x.w)
    // round to keep the JSON compact without losing display precision
    for (const r of rows) {
      r.w = Number(r.w.toFixed(6))
      r.e = Number(r.e.toFixed(4))
      usedAddrs.add(r.a)
    }
    epochsOut[epoch] = rows
  }

  const gaugesOut = {}
  for (const addr of usedAddrs) {
    gaugesOut[addr] = gaugesMeta[addr] ?? { name: addr, pool: null, chain: null }
  }

  const out = {
    version: OUT_VERSION,
    generated_at: Math.floor(Date.now() / 1000),
    gauges: gaugesOut,
    epochs: epochsOut,
  }

  await writeFile(OUT_PATH, JSON.stringify(out))
  const bytes = Buffer.byteLength(JSON.stringify(out))
  console.log(
    `\nWrote ${OUT_PATH}\n  epochs: ${Object.keys(epochsOut).length}\n  gauges: ${usedAddrs.size}\n  size: ${(bytes / 1024).toFixed(0)} KB`,
  )
}

main().catch((e) => {
  console.error('sync-gauge-epochs failed:', e)
  process.exit(1)
})
