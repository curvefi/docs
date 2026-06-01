import React, { useEffect, useMemo, useState } from 'react'
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, ChartOptions } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { tabs, ENABLED_TABS, TAB_ROUTES } from '../ProtocolMap/data/tabs'
import '../ProtocolMap/ProtocolMap.css' // reuse the exact topbar/tab styles
import { useProposals } from './hooks/useProposals'
import { useGaugeEpochs } from './hooks/useGaugeEpochs'
import { useLiveGaugeWeights } from './hooks/useLiveGaugeWeights'
import { EpochDistributionRow, Proposal, ProposalStatus } from './types'
import {
  endDate,
  endDateObj,
  epochEnd,
  epochEndObj,
  epochNumber,
  epochStart,
  epochStartObj,
  etherscanAddressUrl,
  etherscanTxUrl,
  formatEmissions,
  formatPct,
  formatVeCrv,
  getStatus,
  GOV_FORUM_URL,
  ipfsUrl,
  isOngoingEpoch,
  quorumFraction,
  shortAddress,
  startDateObj,
  STATUS_LABEL,
  supportFraction,
  thresholdFraction,
} from './utils'
import './VoteCalendar.css'

const GAUGE_DIST_LIMIT = 15 // top-N gauges shown in the epoch distribution chart
const GAUGE_VISIBLE_THRESHOLD = 0.0001 // 0.01% — gauges below this hide behind "show all"

const VC_MONO = "System, 'Courier New', monospace"
const VC_INK = '#1a1a2e'
// Distinct retro-leaning hues so adjacent bars read apart (cycled for >15 bars).
const GAUGE_BAR_PALETTE = [
  '#7c3aed', '#3465a4', '#e67e00', '#1f8a3a', '#e5484d',
  '#0ea5e9', '#d6409f', '#9333ea', '#ca8a04', '#0d9488',
  '#dc2626', '#4f46e5', '#db2777', '#65a30d', '#0891b2',
]

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

/** Trim long gauge labels for the chart axis. */
function truncateLabel(s: string, max = 24): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

const WEEK_STARTS_ON = 1 // Monday

interface Bar {
  proposal: Proposal
  startCol: number
  span: number
  lane: number
  clipLeft: boolean // proposal began before this week
  clipRight: boolean // proposal ends after this week
}

interface Week {
  days: Date[]
  bars: Bar[]
}

/** Greedily lay proposals overlapping a week into horizontal lanes. */
function layoutWeek(weekStart: Date, monthProposals: Proposal[]): Week {
  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: WEEK_STARTS_ON }) })
  const weekLo = startOfDay(weekStart)
  const weekHi = endOfDay(days[6])

  const segments = monthProposals
    .map((p) => {
      const ps = startDateObj(p)
      const pe = endDateObj(p)
      if (ps > weekHi || pe < weekLo) return null
      const startCol = Math.max(0, differenceInCalendarDays(ps, weekLo))
      const endCol = Math.min(6, differenceInCalendarDays(pe, weekLo))
      return {
        proposal: p,
        startCol,
        span: endCol - startCol + 1,
        clipLeft: ps < weekLo,
        clipRight: pe > weekHi,
      }
    })
    .filter((s): s is Omit<Bar, 'lane'> => s !== null)
    // Earliest-passing first: the vote that resolves soonest takes the top lane.
    // All proposals run a uniform 7-day window, so start order == pass/end order.
    // Sort on the real start timestamp (not the week-clipped startCol) so bars
    // spilling in from previous weeks still rank by when they actually opened.
    .sort(
      (a, b) =>
        a.proposal.start_date - b.proposal.start_date ||
        endDate(a.proposal) - endDate(b.proposal) ||
        a.proposal.vote_id - b.proposal.vote_id,
    )

  const laneEnds: number[] = [] // last occupied column per lane
  const bars: Bar[] = []

  // No lane cap: every overlapping vote gets a lane so the week grows to fit
  // them all (the bars grid uses grid-auto-rows). Nothing is hidden behind a
  // "+N more" overflow.
  for (const seg of segments) {
    let lane = laneEnds.findIndex((end) => end < seg.startCol)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(-1)
    }
    laneEnds[lane] = seg.startCol + seg.span - 1
    bars.push({ ...seg, lane })
  }

  return { days, bars }
}

interface GaugeSeg {
  epochStart: number
  startCol: number
  span: number
  clipLeft: boolean // epoch began before this week (flows in from the previous row)
  clipRight: boolean // epoch continues past this week (flows out to the next row)
  ongoing: boolean // the live, not-yet-finalized epoch
}

/** Split a Mon–Sun week into its gauge epochs. Epoch boundaries are Thursday 00:00
 *  UTC, so a Monday-start week always breaks into Mon–Wed (prior epoch) and Thu–Sun
 *  (new epoch). Future epochs (beyond the current one) are omitted. */
function layoutGaugeWeek(days: Date[], nowSec: number): GaugeSeg[] {
  const weekLoSec = startOfDay(days[0]).getTime() / 1000
  const weekHiSec = startOfDay(days[6]).getTime() / 1000 + 86400 // exclusive end
  const currentEpoch = epochStart(nowSec)

  // Group consecutive days sharing the same epoch start into runs (1–2 per week).
  const runs: { epoch: number; startCol: number; span: number }[] = []
  days.forEach((d, col) => {
    const e = epochStart(startOfDay(d).getTime() / 1000)
    const last = runs[runs.length - 1]
    if (last && last.epoch === e) last.span++
    else runs.push({ epoch: e, startCol: col, span: 1 })
  })

  return runs
    .filter((r) => r.epoch <= currentEpoch) // never render future epochs
    .map((r) => ({
      epochStart: r.epoch,
      startCol: r.startCol,
      span: r.span,
      clipLeft: r.epoch < weekLoSec,
      clipRight: epochEnd(r.epoch) > weekHiSec,
      ongoing: isOngoingEpoch(r.epoch, nowSec),
    }))
}

/** Shared Visualizations top bar (mirrors the ProtocolMap topbar). */
function VizTopBar({ activeTab }: { activeTab: string }) {
  return (
    <div className="vc-topbar">
      <a href="/" className="protocol-map-back">← Docs</a>
      <div className="protocol-map-tabs">
        {tabs
          .filter((t) => ENABLED_TABS.has(t.id))
          .map((t) => {
            const active = t.id === activeTab
            return (
              <button
                key={t.id}
                className="protocol-map-tab"
                style={{ background: active ? '#e67e00' : '#3465a4' }}
                onClick={() => {
                  const route = TAB_ROUTES[t.id]
                  if (route && !active) window.location.href = route
                }}
              >
                {t.label}
              </button>
            )
          })}
      </div>
    </div>
  )
}

function barLabel(p: Proposal): string {
  const text = (p.metadata || '').replace(/\s+/g, ' ').trim()
  // Cap label length so wide multi-day bars don't become walls of text.
  const short = text.length > 64 ? `${text.slice(0, 64)}…` : text
  return `#${p.vote_id} ${short || 'Proposal'}`
}

function ProgressBar({ value, threshold, label }: { value: number; threshold: number; label: string }) {
  const met = value >= threshold
  return (
    <div className="vc-progress">
      <div className="vc-progress-head">
        <span>{label}</span>
        <span className={met ? 'vc-met' : 'vc-unmet'}>
          {formatPct(value)} / {formatPct(threshold)}
        </span>
      </div>
      <div className="vc-progress-track">
        <div className={`vc-progress-fill ${met ? 'vc-fill-met' : 'vc-fill-unmet'}`} style={{ width: `${Math.min(100, value * 100)}%` }} />
        <div className="vc-progress-threshold" style={{ left: `${Math.min(100, threshold * 100)}%` }} />
      </div>
    </div>
  )
}

function DetailPanel({ proposal, status, nowSec, onClose }: { proposal: Proposal; status: ProposalStatus; nowSec: number; onClose: () => void }) {
  const p = proposal
  const start = startDateObj(p)
  const end = endDateObj(p)
  const remaining = endDate(p) - nowSec
  const tx = etherscanTxUrl(p.transaction_hash)
  const ipfs = ipfsUrl(p.ipfs_metadata)
  const creatorUrl = etherscanAddressUrl(p.creator)

  return (
    <div className="vc-modal-backdrop" onClick={onClose}>
      <div className="vc-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="vc-modal-titlebar">
          <span className="vc-modal-titlebar-text">Vote #{p.vote_id}</span>
          <button className="vc-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="vc-modal-body">
        <div className="vc-modal-tags">
          <span className={`vc-badge vc-status-${status}`}>{STATUS_LABEL[status]}</span>
        </div>

        <p className="vc-modal-desc">{p.metadata || 'No description provided.'}</p>

        <div className="vc-modal-meta">
          <div>
            <span className="vc-meta-key">Opens</span>
            <span>{format(start, 'PPpp')}</span>
          </div>
          <div>
            <span className="vc-meta-key">Closes</span>
            <span>{format(end, 'PPpp')}</span>
          </div>
          {status === 'active' && remaining > 0 && (
            <div>
              <span className="vc-meta-key">Time left</span>
              <span>
                {Math.floor(remaining / 86400)}d {Math.floor((remaining % 86400) / 3600)}h {Math.floor((remaining % 3600) / 60)}m
              </span>
            </div>
          )}
          <div>
            <span className="vc-meta-key">Creator</span>
            <span>{creatorUrl ? <a href={creatorUrl} target="_blank" rel="noopener noreferrer">{shortAddress(p.creator)}</a> : shortAddress(p.creator)}</span>
          </div>
          <div>
            <span className="vc-meta-key">Voters</span>
            <span>{p.vote_count}</span>
          </div>
          <div>
            <span className="vc-meta-key">Snapshot block</span>
            <span>{p.snapshot_block.toLocaleString()}</span>
          </div>
        </div>

        <div className="vc-tally">
          <div className="vc-tally-row">
            <span className="vc-tally-for">For</span>
            <span>{formatVeCrv(p.votes_for)} veCRV</span>
          </div>
          <div className="vc-tally-row">
            <span className="vc-tally-against">Against</span>
            <span>{formatVeCrv(p.votes_against)} veCRV</span>
          </div>
        </div>

        <ProgressBar label="Support" value={supportFraction(p)} threshold={thresholdFraction(p.support_required)} />
        <ProgressBar label="Quorum" value={quorumFraction(p)} threshold={thresholdFraction(p.min_accept_quorum)} />

        <div className="vc-modal-links">
          {tx && <a href={tx} target="_blank" rel="noopener noreferrer">Etherscan ↗</a>}
          {ipfs && <a href={ipfs} target="_blank" rel="noopener noreferrer">IPFS metadata ↗</a>}
        </div>
        </div>
      </div>
    </div>
  )
}

function GaugeEpochModal({
  epochStart: epoch,
  nowSec,
  status,
  error,
  generatedAt,
  rows,
  liveOnChain,
  onClose,
}: {
  epochStart: number
  nowSec: number
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  generatedAt: number | null
  rows: EpochDistributionRow[]
  /** True when these are live on-chain weights (vs. the static fallback). */
  liveOnChain: boolean
  onClose: () => void
}) {
  const ongoing = isOngoingEpoch(epoch, nowSec)
  const [showAll, setShowAll] = useState(false)
  const top = rows.slice(0, GAUGE_DIST_LIMIT)

  // Rows are sorted by weight desc, so the gauges >= 0.01% are a prefix. Hide the
  // long tail of dust gauges behind a "show all" row by default.
  const aboveCount = rows.filter((r) => r.relativeWeight >= GAUGE_VISIBLE_THRESHOLD).length
  const hiddenCount = rows.length - aboveCount
  const tableRows = showAll ? rows : rows.slice(0, aboveCount)

  const chartData = {
    labels: top.map((r) => truncateLabel(r.poolName || r.name)),
    datasets: [
      {
        data: top.map((r) => r.relativeWeight * 100),
        backgroundColor: top.map((_, i) => GAUGE_BAR_PALETTE[i % GAUGE_BAR_PALETTE.length]),
        borderColor: VC_INK,
        borderWidth: 1,
        barThickness: 12,
      },
    ],
  }
  const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: VC_INK,
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 0,
        borderColor: '#fff',
        borderWidth: 1,
        padding: 8,
        titleFont: { family: VC_MONO, weight: 'bold', size: 12 },
        bodyFont: { family: VC_MONO, size: 11 },
        callbacks: {
          title: (items) => top[items[0].dataIndex]?.name ?? '',
          label: (ctx) => {
            const r = top[ctx.dataIndex]
            return `${formatPct(r.relativeWeight)} · ${formatEmissions(r.emissions)} CRV`
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { callback: (v) => `${v}%`, color: VC_INK, font: { family: VC_MONO, size: 10 } },
        grid: { color: 'rgba(26,26,46,0.1)' },
        border: { color: 'rgba(26,26,46,0.35)' },
      },
      y: {
        ticks: { color: VC_INK, font: { family: VC_MONO, size: 10 }, autoSkip: false },
        grid: { display: false },
        border: { color: 'rgba(26,26,46,0.35)' },
      },
    },
  }

  return (
    <div className="vc-modal-backdrop" onClick={onClose}>
      <div className="vc-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="vc-modal-titlebar">
          <span className="vc-modal-titlebar-text">
            Gauge Epoch #{epochNumber(epoch)} · {format(epochStartObj(epoch), 'PP')}
          </span>
          <button className="vc-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="vc-modal-body">
          <div className="vc-modal-tags">
            <span className="vc-badge vc-gauge">{ongoing ? 'In progress' : 'Finalized'}</span>
            <span className="vc-epoch-range">
              {format(epochStartObj(epoch), 'PP')} → {format(epochEndObj(epoch), 'PP')}
            </span>
          </div>

          {(status === 'idle' || status === 'loading') && <div className="vc-message">Loading gauge weights…</div>}
          {status === 'error' && <div className="vc-message vc-error">Failed to load gauge weights: {error}</div>}
          {status === 'ready' && top.length === 0 && (
            <div className="vc-message">
              No gauge weight data for this epoch
              {generatedAt ? ` (data last synced ${format(new Date(generatedAt * 1000), 'PP')})` : ''}.
            </div>
          )}
          {status === 'ready' && top.length > 0 && (
            <>
              <div className="vc-gauge-chart" style={{ height: top.length * 22 + 28 }}>
                <Bar data={chartData} options={chartOptions} />
              </div>

              <div className="vc-gauge-scroll">
                <table className="vc-gauge-table">
                  <thead>
                    <tr>
                      <th className="vc-gauge-th-rank">#</th>
                      <th>Gauge</th>
                      <th className="vc-gauge-th-num">Weight</th>
                      <th className="vc-gauge-th-num">CRV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((r, i) => (
                      <tr key={r.address}>
                        <td className="vc-gauge-td-rank">{i + 1}</td>
                        <td className="vc-gauge-td-name" title={r.name}>{r.poolName || r.name}</td>
                        <td className="vc-gauge-td-num vc-gauge-td-pct">{formatPct(r.relativeWeight)}</td>
                        <td className="vc-gauge-td-num">{formatEmissions(r.emissions)}</td>
                      </tr>
                    ))}
                    {hiddenCount > 0 && (
                      <tr className="vc-gauge-tr-toggle" onClick={() => setShowAll((v) => !v)}>
                        <td colSpan={4}>
                          {showAll ? '▲ Show fewer' : `▼ Show all ${rows.length} gauges (${hiddenCount} below 0.01% hidden)`}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="vc-gauge-note">
                {ongoing
                  ? liveOnChain
                    ? 'Live on-chain weights read from the GaugeController — this epoch finalizes Thursday 00:00 UTC.'
                    : 'Live read unavailable — showing the latest synced weights. This epoch finalizes Thursday 00:00 UTC.'
                  : `Chart shows the top ${GAUGE_DIST_LIMIT} gauges; the table lists those ≥ 0.01% (expand for all ${rows.length}).`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/** Popover to jump straight to a month/year, bounded to the available range. */
function MonthPicker({
  viewMonth,
  earliestMonth,
  thisMonth,
  onSelect,
  onClose,
}: {
  viewMonth: Date
  earliestMonth: Date | null
  thisMonth: Date
  onSelect: (d: Date) => void
  onClose: () => void
}) {
  const [year, setYear] = useState(viewMonth.getFullYear())
  const minYear = (earliestMonth ?? thisMonth).getFullYear()
  const maxYear = thisMonth.getFullYear()
  const lo = earliestMonth ?? new Date(0)

  return (
    <>
      <div className="vc-monthpicker-backdrop" onClick={onClose} />
      <div className="vc-monthpicker" role="dialog" aria-label="Select month">
        <div className="vc-monthpicker-years">
          <button className="vc-nav-btn" onClick={() => setYear((y) => y - 1)} disabled={year <= minYear} aria-label="Previous year">
            ◀
          </button>
          <span className="vc-monthpicker-year">{year}</span>
          <button className="vc-nav-btn" onClick={() => setYear((y) => y + 1)} disabled={year >= maxYear} aria-label="Next year">
            ▶
          </button>
        </div>
        <div className="vc-monthpicker-grid">
          {Array.from({ length: 12 }, (_, m) => new Date(year, m, 1)).map((d, m) => {
            const disabled = d < lo || d > thisMonth
            const selected = isSameMonth(d, viewMonth)
            return (
              <button
                key={m}
                className={`vc-monthpicker-month ${selected ? 'vc-mp-selected' : ''}`}
                disabled={disabled}
                onClick={() => {
                  onSelect(d)
                  onClose()
                }}
              >
                {format(d, 'MMM')}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default function VoteCalendar() {
  const { proposals, loading, error } = useProposals()
  const { status: gaugeStatus, error: gaugeError, generatedAt, ensureLoaded, getDistribution } = useGaugeEpochs()
  const live = useLiveGaugeWeights()
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<Proposal | null>(null)
  const [selectedEpoch, setSelectedEpoch] = useState<number | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [nowSec, setNowSec] = useState(() => Date.now() / 1000)

  // Refresh "now" every 30s so active statuses & countdowns stay live.
  useEffect(() => {
    const id = setInterval(() => setNowSec(Date.now() / 1000), 30_000)
    return () => clearInterval(id)
  }, [])

  // If the live on-chain read fails while viewing the ongoing epoch, lazily load
  // the static file so we can fall back to its latest (same-epoch) weights.
  useEffect(() => {
    if (selectedEpoch !== null && isOngoingEpoch(selectedEpoch, nowSec) && live.status === 'error') {
      ensureLoaded()
    }
  }, [selectedEpoch, live.status, nowSec, ensureLoaded])

  const earliestMonth = useMemo(() => {
    if (proposals.length === 0) return null
    const min = Math.min(...proposals.map((p) => p.start_date))
    return startOfMonth(new Date(min * 1000))
  }, [proposals])

  const thisMonth = startOfMonth(new Date())
  const canGoPrev = earliestMonth ? viewMonth > earliestMonth : false
  const canGoNext = viewMonth < thisMonth

  // Proposals whose voting window overlaps the visible grid (incl. spill weeks).
  const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: WEEK_STARTS_ON })
  const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: WEEK_STARTS_ON })

  const monthProposals = useMemo(() => {
    const lo = gridStart.getTime() / 1000
    const hi = gridEnd.getTime() / 1000 + 86400
    return proposals.filter((p) => p.start_date <= hi && endDate(p) >= lo)
  }, [proposals, viewMonth])

  const weeks: Week[] = useMemo(() => {
    const out: Week[] = []
    let cursor = gridStart
    while (cursor <= gridEnd) {
      out.push(layoutWeek(cursor, monthProposals))
      cursor = new Date(cursor.getTime() + 7 * 86400 * 1000)
    }
    return out
  }, [monthProposals, viewMonth])

  // Gauge epochs laid out per displayed week. Kept in its own memo (depends on
  // nowSec) so the 30s "now" tick doesn't relayout the heavier proposal grid.
  const gaugeWeeks: GaugeSeg[][] = useMemo(
    () => weeks.map((w) => layoutGaugeWeek(w.days, nowSec)),
    [weeks, nowSec],
  )

  const weekdayLabels = weeks[0]?.days.map((d) => format(d, 'EEE')) ?? []

  return (
    <div className="vc-page">
      <VizTopBar activeTab="votes" />
      <div className="vc-root">
      <header className="vc-header">
        <div className="vc-title-block">
          <h1 className="vc-title">Governance Vote Calendar</h1>
        </div>
        <div className="vc-nav">
          <button className="vc-nav-btn" onClick={() => setViewMonth((m) => addMonths(m, -1))} disabled={!canGoPrev} aria-label="Previous month">
            ◀
          </button>
          <div className="vc-month-wrap">
            <button
              className="vc-nav-month"
              onClick={() => setPickerOpen((o) => !o)}
              aria-haspopup="dialog"
              aria-expanded={pickerOpen}
            >
              {format(viewMonth, 'MMMM yyyy')} ▾
            </button>
            {pickerOpen && (
              <MonthPicker
                viewMonth={viewMonth}
                earliestMonth={earliestMonth}
                thisMonth={thisMonth}
                onSelect={(d) => setViewMonth(startOfMonth(d))}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
          <button className="vc-nav-btn" onClick={() => setViewMonth((m) => addMonths(m, 1))} disabled={!canGoNext} aria-label="Next month">
            ▶
          </button>
          <button className="vc-today-btn" onClick={() => setViewMonth(startOfMonth(new Date()))} disabled={isSameMonth(viewMonth, thisMonth)}>
            Today
          </button>
        </div>
      </header>

      <div className="vc-legend">
        <span className="vc-legend-item"><i className="vc-dot vc-status-active" /> Active</span>
        <span className="vc-legend-item"><i className="vc-dot vc-status-passed" /> Passed</span>
        <span className="vc-legend-item"><i className="vc-dot vc-status-failed" /> Failed</span>
        <span className="vc-legend-item"><i className="vc-dot vc-status-executed" /> Executed</span>
        <span className="vc-legend-sep" />
        <span className="vc-legend-item"><i className="vc-dot vc-gauge" /> Gauge epoch</span>
      </div>

      {loading && <div className="vc-message">Loading proposals…</div>}
      {error && <div className="vc-message vc-error">Failed to load proposals: {error}</div>}

      {!loading && !error && (
        <div className="vc-calendar">
          <div className="vc-weekdays">
            {weekdayLabels.map((w) => (
              <div key={w} className="vc-weekday">{w}</div>
            ))}
          </div>

          {weeks.map((week, wi) => (
            <div key={wi} className="vc-week">
              <div className="vc-daynums">
                {week.days.map((d) => (
                  <div key={d.toISOString()} className={`vc-daynum ${isSameMonth(d, viewMonth) ? '' : 'vc-outside'} ${isToday(d) ? 'vc-today' : ''}`}>
                    <span>{format(d, 'd')}</span>
                  </div>
                ))}
              </div>
              {gaugeWeeks[wi]?.length > 0 && (
                <div className="vc-gauge-row" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                  {gaugeWeeks[wi].map((seg) => (
                    <button
                      key={seg.epochStart}
                      className={`vc-gauge-bar ${seg.ongoing ? 'vc-gauge-ongoing' : ''} ${seg.clipLeft ? 'vc-clip-left' : ''} ${seg.clipRight ? 'vc-clip-right' : ''}`}
                      style={{ gridColumn: `${seg.startCol + 1} / span ${seg.span}` }}
                      title={`Gauge epoch #${epochNumber(seg.epochStart)} · ${format(epochStartObj(seg.epochStart), 'PP')} → ${format(epochEndObj(seg.epochStart), 'PP')}${seg.ongoing ? ' (in progress)' : ''}`}
                      onClick={() => {
                        if (seg.ongoing) live.ensureLoaded()
                        else ensureLoaded()
                        setSelectedEpoch(seg.epochStart)
                      }}
                    >
                      <span className="vc-bar-label">
                        {seg.ongoing ? `Gauge #${epochNumber(seg.epochStart)} · live` : `Gauge #${epochNumber(seg.epochStart)}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <div className="vc-bars" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {week.bars.map((bar) => {
                  const status = getStatus(bar.proposal, nowSec)
                  return (
                    <button
                      key={bar.proposal.vote_id}
                      className={`vc-bar vc-status-${status} ${bar.clipLeft ? 'vc-clip-left' : ''} ${bar.clipRight ? 'vc-clip-right' : ''} ${hoveredId === bar.proposal.vote_id ? 'vc-bar-hover' : ''}`}
                      style={{ gridColumn: `${bar.startCol + 1} / span ${bar.span}`, gridRow: bar.lane + 1 }}
                      title={`${barLabel(bar.proposal)}\n${STATUS_LABEL[status]}`}
                      onMouseEnter={() => setHoveredId(bar.proposal.vote_id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setSelected(bar.proposal)}
                    >
                      <span className="vc-bar-label">{barLabel(bar.proposal)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <DetailPanel proposal={selected} status={getStatus(selected, nowSec)} nowSec={nowSec} onClose={() => setSelected(null)} />
      )}

      {selectedEpoch !== null &&
        (() => {
          // Ongoing epoch → live on-chain weights; finalised epochs → static file.
          // If the live read fails, fall back to the static file's entry for this
          // same epoch (its latest epoch is the in-progress one).
          const ongoingSel = isOngoingEpoch(selectedEpoch, nowSec)
          const useLive = ongoingSel && live.status !== 'error'
          return (
            <GaugeEpochModal
              key={selectedEpoch}
              epochStart={selectedEpoch}
              nowSec={nowSec}
              status={useLive ? live.status : gaugeStatus}
              error={useLive ? live.error : gaugeError}
              generatedAt={generatedAt}
              rows={useLive ? live.rows : getDistribution(selectedEpoch)}
              liveOnChain={useLive}
              onClose={() => setSelectedEpoch(null)}
            />
          )
        })()}
      </div>
    </div>
  )
}
