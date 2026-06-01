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
import { tabs, ENABLED_TABS, TAB_ROUTES } from '../ProtocolMap/data/tabs'
import '../ProtocolMap/ProtocolMap.css' // reuse the exact topbar/tab styles
import { useProposals } from './hooks/useProposals'
import { Proposal, ProposalStatus } from './types'
import {
  endDate,
  endDateObj,
  etherscanAddressUrl,
  etherscanTxUrl,
  formatPct,
  formatVeCrv,
  getStatus,
  GOV_FORUM_URL,
  ipfsUrl,
  quorumFraction,
  shortAddress,
  startDateObj,
  STATUS_LABEL,
  supportFraction,
  thresholdFraction,
} from './utils'
import './VoteCalendar.css'

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
          <a href={GOV_FORUM_URL} target="_blank" rel="noopener noreferrer">Gov forum ↗</a>
        </div>
        </div>
      </div>
    </div>
  )
}

export default function VoteCalendar() {
  const { proposals, loading, error } = useProposals()
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<Proposal | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [nowSec, setNowSec] = useState(() => Date.now() / 1000)

  // Refresh "now" every 30s so active statuses & countdowns stay live.
  useEffect(() => {
    const id = setInterval(() => setNowSec(Date.now() / 1000), 30_000)
    return () => clearInterval(id)
  }, [])

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
          <span className="vc-nav-month">{format(viewMonth, 'MMMM yyyy')}</span>
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
      </div>
    </div>
  )
}
