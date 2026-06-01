import { useCallback, useState, useMemo, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type NodeTypes,
  type EdgeTypes,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { initialNodes, initialEdges, type ProtocolNodeData } from './data/graph'
import { tabs, ENABLED_TABS, TAB_ROUTES } from './data/tabs'
import ContractNode from './nodes/ContractNode'
import SystemNode from './nodes/SystemNode'
import TokenNode from './nodes/TokenNode'
import ExternalNode from './nodes/ExternalNode'
import EpochNode from './nodes/EpochNode'
import GaugeChartNode from './nodes/GaugeChartNode'
import FeeFlowEdge from './edges/FeeFlowEdge'
import GovernanceEdge from './edges/GovernanceEdge'
import DataFlowEdge from './edges/DataFlowEdge'
import EmissionFlowEdge from './edges/EmissionFlowEdge'
import GaugeEmissionEdge from './edges/GaugeEmissionEdge'
import OracleFlowEdge from './edges/OracleFlowEdge'
import VotingEdge from './edges/VotingEdge'
import DetailPanel from './panels/DetailPanel'
import { useLiveData } from './hooks/useLiveData'
import { useCrvusdMarkets, type CrvusdMarket, type PegKeeper } from './hooks/useCrvusdMarkets'
import { useGaugeWeights, type GaugeWeight } from './hooks/useGaugeWeights'
import { formatNumber } from './utils/formatters'
import './ProtocolMap.css'

const nodeTypes: NodeTypes = {
  contractNode: ContractNode,
  systemNode: SystemNode,
  tokenNode: TokenNode,
  externalNode: ExternalNode,
  epochNode: EpochNode,
  gaugeChartNode: GaugeChartNode,
}

const edgeTypes: EdgeTypes = {
  feeFlow: FeeFlowEdge,
  governanceFlow: GovernanceEdge,
  dataFlow: DataFlowEdge,
  emissionFlow: EmissionFlowEdge,
  gaugeEmission: GaugeEmissionEdge,
  oracleFlow: OracleFlowEdge,
  votingFlow: VotingEdge,
}

const BAR_COLORS = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#e84393']

function buildNodesForTab(tabId: string): Node<ProtocolNodeData>[] {
  const tab = tabs.find(t => t.id === tabId)!
  const isOverview = tab.nodeIds.size === 0

  return initialNodes
    .filter(n => isOverview || tab.nodeIds.has(n.id))
    .map(n => {
      const pos = tab.positions[n.id] ?? n.position
      return { ...n, position: pos }
    })
}

function buildEdgesForTab(_tabId: string) {
  return initialEdges.map(e => e)
}

function buildStablecoinDynamic(markets: CrvusdMarket[], pegkeepers: PegKeeper[]) {
  const nodes: Node<ProtocolNodeData>[] = []
  const edges: import('@xyflow/react').Edge[] = []

  if (markets.length > 0) {
    const totalDebt = markets.reduce((s, m) => s + m.total_debt_usd, 0)
    const totalCollateral = markets.reduce((s, m) => s + m.collateral_amount_usd, 0)
    const totalLoans = markets.reduce((s, m) => s + m.n_loans, 0)
    const marketRows = markets
      .sort((a, b) => b.total_debt_usd - a.total_debt_usd)
      .map(m => ({ symbol: m.collateral_token.symbol, debt: m.total_debt_usd, loans: m.n_loans, collateral: m.collateral_amount_usd }))
    nodes.push({
      id: 'dyn-mint-markets',
      type: 'systemNode',
      position: { x: -300, y: -25 },
      data: {
        label: 'Mint Markets',
        category: 'stablecoin',
        description: `${markets.length} crvUSD mint markets with ${totalLoans} active loans, $${formatNumber(totalDebt)} total debt, $${formatNumber(totalCollateral)} collateral.`,
        docPath: '/user/crvusd/understanding-crvusd',
        icon: 'controller',
        marketRows,
      },
    })
    edges.push(
      { id: 'dyn-mint-mint', source: 'dyn-mint-markets', target: 'crvusd-token', sourceHandle: 'right-source', targetHandle: 'left-target', type: 'dataFlow', label: 'Mint crvUSD', animated: true },
      { id: 'dyn-mint-interest', source: 'dyn-mint-markets', target: 'fee-splitter', sourceHandle: 'bottom-source', targetHandle: 'left-target', type: 'feeFlow', label: 'Interest' },
    )
  }

  if (pegkeepers.length > 0) {
    const totalPkDebt = pegkeepers.reduce((s, pk) => s + pk.total_debt, 0)
    const totalProfit = pegkeepers.reduce((s, pk) => s + pk.total_profit, 0)
    const pools = pegkeepers.map(pk => {
      const other = pk.pair.find(t => t.symbol !== 'crvUSD')
      return other?.symbol || '?'
    }).join(', ')
    nodes.push({
      id: 'dyn-pegkeepers',
      type: 'systemNode',
      position: { x: 300, y: -25 },
      data: {
        label: 'PegKeepers',
        category: 'stablecoin',
        description: `${pegkeepers.length} active PegKeepers stabilizing crvUSD peg via ${pools} pools. Total debt: $${formatNumber(totalPkDebt)}, total profit: $${formatNumber(totalProfit)}.`,
        docPath: '/developer/crvusd/pegkeepers/overview',
        icon: 'pegkeeper',
      },
    })
    edges.push(
      { id: 'dyn-pk-stabilize', source: 'dyn-pegkeepers', target: 'crvusd-token', sourceHandle: 'left-source', targetHandle: 'right-target', type: 'dataFlow', label: 'Stabilize Peg', animated: true },
    )
  }

  return { nodes, edges }
}

function buildGovernanceDynamic(gauges: GaugeWeight[]) {
  const nodes: Node<ProtocolNodeData>[] = []
  const edges: import('@xyflow/react').Edge[] = []

  if (gauges.length === 0) return { nodes, edges }

  // Fan out to the right of GaugeController (300, 50)
  const startX = 600
  const startY = -150
  const spacing = 100

  gauges.forEach((g, i) => {
    const id = `dyn-gauge-${i}`
    const pct = (g.gauge_relative_weight * 100).toFixed(2)
    nodes.push({
      id,
      type: 'contractNode',
      position: { x: startX, y: startY + i * spacing },
      data: {
        label: g.pool_name || g.name,
        category: 'gauge',
        description: `${pct}% of total gauge weight. ${formatNumber(g.emissions)} CRV emissions this epoch.${g.chain ? ` Chain: ${g.chain}.` : ''}`,
        address: g.address,
        icon: 'gauge',
      },
    })
    edges.push({
      id: `dyn-gc-gauge-${i}`,
      source: 'gauge-controller',
      target: id,
      sourceHandle: 'right-source',
      targetHandle: 'left-target',
      type: 'emissionFlow',
      label: `${pct}%`,
    })
  })

  return { nodes, edges }
}

// ── Emissions simulation ──────────────────────────────────────────────

// Fictional gauges with weight drift patterns (start → mid → end of week)
// Smooth gauge weight simulation. Each gauge drifts via overlapping sine waves.
// Non-integer frequencies so each week looks different.
const SIM_GAUGES = [
  { name: 'Liquidity Gauge', shortName: 'Gauge', base: 25, icon: 'optimism', color: '#e74c3c', crosschain: true, waves: [{ amp: 12, freq: 0.7, phase: 0 }, { amp: 5, freq: 1.8, phase: 1.2 }] },
  { name: 'Liquidity Gauge', shortName: 'Gauge', base: 22, icon: 'ethereum', color: '#e67e22', crosschain: false, waves: [{ amp: 10, freq: 0.5, phase: 2.1 }, { amp: 6, freq: 1.3, phase: 0.5 }] },
  { name: 'Fundraising Gauge', shortName: 'Gauge', base: 20, icon: 'vyper', color: '#f1c40f', crosschain: false, description: 'Fundraising gauges are public good gauges used to fund initiatives and development. CRV emissions are directed to the gauge recipient instead of LPs. [Learn more](https://github.com/vefunder/crvfunder)', waves: [{ amp: 11, freq: 0.9, phase: 4.0 }, { amp: 4, freq: 1.6, phase: 1.8 }] },
  { name: 'Liquidity Gauge', shortName: 'Gauge', base: 18, icon: 'ethereum', color: '#2ecc71', crosschain: false, waves: [{ amp: 9, freq: 0.6, phase: 0.8 }, { amp: 5, freq: 1.4, phase: 3.5 }] },
  { name: 'Liquidity Gauge', shortName: 'Gauge', base: 10, icon: 'arbitrum', color: '#3498db', crosschain: true, waves: [{ amp: 5, freq: 0.8, phase: 3.0 }, { amp: 3, freq: 1.7, phase: 0.3 }] },
]

const SNAPSHOT_POINT = 3 / 7 // Thursday ≈ 0.43

function rawGaugeWeight(gauge: typeof SIM_GAUGES[0], t: number): number {
  let w = gauge.base
  for (const wave of gauge.waves) {
    w += wave.amp * Math.sin(2 * Math.PI * wave.freq * t + wave.phase)
  }
  return Math.max(1, w)
}

// Returns weights normalized to sum to 100%
function getEmissionsCurrentWeights(progress: number) {
  const raw = SIM_GAUGES.map(g => rawGaugeWeight(g, progress))
  const total = raw.reduce((a, b) => a + b, 0)
  return raw.map(w => (w / total) * 100)
}

function getEmissionsSnapshotWeights(progress: number) {
  const snapT = Math.floor(progress) + SNAPSHOT_POINT
  const raw = SIM_GAUGES.map(g => rawGaugeWeight(g, snapT))
  const total = raw.reduce((a, b) => a + b, 0)
  return raw.map(w => (w / total) * 100)
}


function buildEmissionsDynamic(snapshotWeights: number[]) {
  const nodes: Node<ProtocolNodeData>[] = []
  const edges: import('@xyflow/react').Edge[] = []
  const gaugeX = 550
  const startY = -30
  const spacing = 70
  const crosschainX = 933

  SIM_GAUGES.forEach((g, i) => {
    const pct = snapshotWeights[i].toFixed(1)
    const chainLabel = g.crosschain ? 'L2' : 'Ethereum'
    nodes.push({
      id: `dyn-em-gauge-${i}`,
      type: 'tokenNode',
      position: { x: gaugeX, y: startY + i * spacing },
      data: {
        label: g.name,
        category: 'gauge',
        description: (g as any).description
          || (g.crosschain
            ? `Proxy gauge on Ethereum receiving ${pct}% of CRV emissions. CRV is streamed over 7 days, then bridged to the L2 chain.`
            : `Receives ${pct}% of CRV emissions, streamed over one week until the next snapshot.`),
        icon: g.icon,
        colorOverride: g.color,
      },
    })
    edges.push({
      id: `dyn-em-gc-gauge-${i}`,
      source: 'gauge-controller',
      target: `dyn-em-gauge-${i}`,
      sourceHandle: 'right-source',
      targetHandle: 'left-target',
      type: 'gaugeEmission',
      label: `${pct}%`,
    })

    // Crosschain gauges: add a ChildGauge node and bridging edge
    if (g.crosschain) {
      const childId = `dyn-em-child-${i}`
      nodes.push({
        id: childId,
        type: 'tokenNode',
        position: { x: crosschainX, y: startY + i * spacing },
        data: {
          label: 'Crosschain Liquidity Gauge',
          category: 'gauge',
          description: `L2 gauge that distributes CRV to LPs. Receives bridged CRV from the proxy gauge on Ethereum after the 7-day streaming period ends.`,
          icon: g.icon,
          colorOverride: g.color,
        },
      })
      edges.push({
        id: `dyn-em-bridge-${i}`,
        source: `dyn-em-gauge-${i}`,
        target: childId,
        sourceHandle: 'right-source',
        targetHandle: 'left-target',
        type: 'gaugeEmission',
        label: 'Bridge CRV',
      })
    }
  })

  // Annotation label
  nodes.push({
    id: 'dyn-em-label',
    type: 'default',
    position: { x: 359, y: -35 },
    data: { label: 'CRV emissions streamed\nover 1 week based on\nThursday snapshot' } as any,
    sourcePosition: undefined,
    targetPosition: undefined,
    connectable: false,
    selectable: true,
    draggable: true,
    style: {
      background: '#505070',
      border: '1px solid #8888a8',
      borderRadius: 0,
      boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
      color: 'white',
      fontSize: 9,
      fontFamily: 'System, monospace',
      width: 'auto',
      whiteSpace: 'pre-line',
      textAlign: 'center',
      lineHeight: 1.3,
      cursor: 'grab',
      padding: '3px 8px',
    } as any,
  } as any)

  return { nodes, edges }
}

interface ProtocolMapCanvasProps {
  defaultTab?: string
}

function FlowCanvas({ defaultTab = 'fees' }: ProtocolMapCanvasProps) {
  const { fitView } = useReactFlow()
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodesForTab(defaultTab))
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildEdgesForTab(defaultTab))
  const [hiddenEdges, setHiddenEdges] = useState<Set<string>>(new Set())

  const [selectedNode, setSelectedNode] = useState<Node<ProtocolNodeData> | null>(null)
  const [popupPos, setPopupPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [search, setSearch] = useState('')
  const [animationsOn, setAnimationsOn] = useState(true)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [simProgress, setSimProgress] = useState(0) // emissions simulation (endless weeks)
  const [simPlaying, setSimPlaying] = useState(true)
  const simRef = useRef<number | null>(null)
  const snapshotRef = useRef<number[] | null>(null) // locked snapshot weights
  const prevProgressRef = useRef(0) // to detect week wrap
  const liveData = useLiveData()
  const crvusdData = useCrvusdMarkets()
  const gaugeData = useGaugeWeights()

  const switchTab = useCallback((tabId: string) => {
    const route = TAB_ROUTES[tabId]
    if (route && window.location.pathname !== route) {
      window.location.href = route
      return
    }
    setActiveTab(tabId)
    setNodes(buildNodesForTab(tabId))
    setEdges(buildEdgesForTab(tabId))
    setHiddenEdges(new Set())
    setSelectedNode(null)
    setHoveredNode(null)
    setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 50)
  }, [setNodes, setEdges, fitView])

  const onEdgesDelete = useCallback((deleted: { id: string }[]) => {
    setHiddenEdges(prev => {
      const next = new Set(prev)
      deleted.forEach(e => next.add(e.id))
      return next
    })
  }, [])

  useEffect(() => {
    // Initialize emissions simulation data on first load — trigger initial snapshot
    if (defaultTab === 'emissions') {
      snapshotRef.current = getEmissionsSnapshotWeights(0)
      const currentWeights = getEmissionsCurrentWeights(simProgress)
      const gauges = SIM_GAUGES.map((g, i) => ({
        name: g.shortName, weight: currentWeights[i], snapshot: snapshotRef.current![i],
      }))

      const { nodes: dynNodes, edges: dynEdges } = buildEmissionsDynamic(snapshotRef.current!)

      setNodes(prev => {
        const updated = prev.map(n => {
          if (n.id === 'gauge-controller') return { ...n, data: { ...n.data, gauges, snapshotFlash: false } }
          return n
        })
        return [...updated, ...dynNodes]
      })
      setEdges(prev => [...prev, ...dynEdges])
    }
    setTimeout(() => fitView({ padding: 0.15 }), 100)
  }, [fitView])

  useEffect(() => {
    if (activeTab !== 'stablecoin' || crvusdData.loading) return
    const { nodes: dynNodes, edges: dynEdges } = buildStablecoinDynamic(crvusdData.markets, crvusdData.pegkeepers)
    setNodes(prev => {
      const staticNodes = prev.filter(n => !n.id.startsWith('dyn-'))
      return [...staticNodes, ...dynNodes]
    })
    setEdges(prev => {
      const staticEdges = prev.filter(e => !e.id.startsWith('dyn-'))
      return [...staticEdges, ...dynEdges]
    })
    setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 100)
  }, [activeTab, crvusdData.loading, crvusdData.markets, crvusdData.pegkeepers, setNodes, setEdges, fitView])

  useEffect(() => {
    if (activeTab !== 'governance' || gaugeData.loading) return
    const { nodes: dynNodes, edges: dynEdges } = buildGovernanceDynamic(gaugeData.gauges)
    setNodes(prev => {
      const staticNodes = prev.filter(n => !n.id.startsWith('dyn-'))
      return [...staticNodes, ...dynNodes]
    })
    setEdges(prev => {
      const staticEdges = prev.filter(e => !e.id.startsWith('dyn-'))
      return [...staticEdges, ...dynEdges]
    })
    setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 100)
  }, [activeTab, gaugeData.loading, gaugeData.gauges, setNodes, setEdges, fitView])

  // Emissions simulation: update gauge-controller bar chart on every tick (lightweight)
  useEffect(() => {
    if (activeTab !== 'emissions') return
    const prevWeekPos = prevProgressRef.current % 1
    const currWeekPos = simProgress % 1
    const crossedSnapshot = prevWeekPos < SNAPSHOT_POINT && currWeekPos >= SNAPSHOT_POINT
    const newWeek = Math.floor(simProgress) > Math.floor(prevProgressRef.current)
    const snapshotEvent = crossedSnapshot || (newWeek && currWeekPos >= SNAPSHOT_POINT)
    if (snapshotEvent) {
      snapshotRef.current = getEmissionsSnapshotWeights(simProgress)
    }
    prevProgressRef.current = simProgress

    const snapshotFlash = Math.abs(currWeekPos - SNAPSHOT_POINT) < 0.02
    const currentWeights = getEmissionsCurrentWeights(simProgress)
    const gauges = SIM_GAUGES.map((g, i) => ({
      name: g.shortName,
      weight: currentWeights[i],
      snapshot: snapshotRef.current?.[i],
    }))

    // Only update gauge-controller data (no node add/remove)
    setNodes(ns => ns.map(n => {
      if (n.id === 'gauge-controller') return { ...n, data: { ...n.data, gauges, snapshotFlash } }
      return n
    }))

    // Add/update dynamic gauge nodes only on snapshot events
    if (snapshotEvent && snapshotRef.current) {
      // Trigger CRV flow animation on all gauge emission edges
      window.dispatchEvent(new Event('crv-flow-trigger'))
      const { nodes: dynNodes, edges: dynEdges } = buildEmissionsDynamic(snapshotRef.current)
      setNodes(ns => {
        const existing = ns.some(n => n.id === 'dyn-em-gauge-0')
        if (!existing) {
          const without = ns.filter(n => !n.id.startsWith('dyn-em-'))
          return [...without, ...dynNodes]
        }
        return ns.map(n => {
          const dynMatch = dynNodes.find(d => d.id === n.id)
          if (dynMatch) return { ...n, data: dynMatch.data }
          return n
        })
      })
      setEdges(es => {
        const existing = es.some(e => e.id === 'dyn-em-gc-gauge-0')
        if (!existing) {
          const without = es.filter(e => !e.id.startsWith('dyn-em-'))
          return [...without, ...dynEdges]
        }
        return es.map(e => {
          const dynMatch = dynEdges.find(d => d.id === e.id)
          if (dynMatch) return { ...e, label: dynMatch.label }
          return e
        })
      })
    }
  }, [activeTab, simProgress, setNodes, setEdges])

  // Auto-play: advance simulation continuously
  useEffect(() => {
    if (activeTab !== 'emissions' || !simPlaying) {
      if (simRef.current) { cancelAnimationFrame(simRef.current); simRef.current = null }
      return
    }
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000 // seconds elapsed
      last = now
      // Speed: ~1 week per 5 seconds, never wraps
      setSimProgress(prev => prev + dt / 5)
      simRef.current = requestAnimationFrame(tick)
    }
    simRef.current = requestAnimationFrame(tick)
    return () => { if (simRef.current) cancelAnimationFrame(simRef.current) }
  }, [activeTab, simPlaying])

  const handleNodesChange = useCallback((changes: Parameters<typeof onNodesChange>[0]) => {
    onNodesChange(changes)
  }, [onNodesChange])

  // Press "p" to print current node positions to console
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'p' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const positions: Record<string, { x: number; y: number }> = {}
        nodes.forEach(n => {
          positions[n.id] = { x: Math.round(n.position.x), y: Math.round(n.position.y) }
        })
        console.log(`\n=== Node positions (${activeTab}) ===`)
        console.log(JSON.stringify(positions, null, 2))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nodes, activeTab])

  const onReconnect = useCallback((_oldEdge: { id: string }, _newConnection: Connection) => {
    // Edges are locked — no reconnecting
  }, [])

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const data = n.data as ProtocolNodeData
      if (search && !data.label.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [nodes, search])

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes])

  const filteredEdges = useMemo(() => {
    const rhVal = liveData.rhEffectiveWeight != null ? (liveData.rhEffectiveWeight / 100).toFixed(0) : '~80'
    const fcVal = liveData.rhEffectiveWeight != null ? (100 - liveData.rhEffectiveWeight / 100).toFixed(0) : '~20'
    const rhPct = `${rhVal}% (dynamic)`
    const fcPct = `${fcVal}% (dynamic)`

    const treasuryAddr = '0x6508ef65b0bd57eabd0f1d52685a70433b2d290b'
    const treasuryReceiver = liveData.allocatorReceivers?.find(r => r.address.toLowerCase() === treasuryAddr)
    const allocTreasuryLabel = treasuryReceiver != null ? `${(treasuryReceiver.weight / 100).toFixed(0)}% Treasury` : '10% Treasury'
    const allocDistLabel = liveData.allocatorDistributorWeight != null ? `${(liveData.allocatorDistributorWeight / 100).toFixed(0)}% to veCRV` : '90% to veCRV'

    return edges
      .filter(e => !hiddenEdges.has(e.id))
      .filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target))
      .map(e => {
        let edge = e
        if (e.id === 'splitter-rh') edge = { ...e, label: rhPct }
        if (e.id === 'splitter-fc') edge = { ...e, label: fcPct }
        if (e.id === 'allocator-treasury') edge = { ...e, label: allocTreasuryLabel }
        if (e.id === 'allocator-dist') edge = { ...e, label: allocDistLabel }
        return animationsOn ? edge : { ...edge, animated: false }
      })
  }, [edges, filteredNodeIds, animationsOn, liveData.rhEffectiveWeight, liveData.allocatorReceivers, liveData.allocatorDistributorWeight, hiddenEdges])

  const styledEdges = useMemo(() => {
    if (!hoveredNode) return filteredEdges
    return filteredEdges.map(e => {
      const connected = e.source === hoveredNode || e.target === hoveredNode
      return { ...e, style: { ...e.style, opacity: connected ? 1 : 0.15 } }
    })
  }, [filteredEdges, hoveredNode])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'default') return // skip annotation labels
    setSelectedNode(node as Node<ProtocolNodeData>)
    setPopupPos({ x: event.clientX, y: event.clientY })
  }, [])

  return (
    <div className="protocol-map-container">
      {/* Top bar */}
      <div className="protocol-map-topbar">
        <a href="/" className="protocol-map-back">
          ← Docs
        </a>

        {/* Tab buttons — only live tabs are shown */}
        <div className="protocol-map-tabs">
          {tabs.filter(tab => ENABLED_TABS.has(tab.id)).map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className="protocol-map-tab"
                style={{ background: active ? '#e67e00' : '#3465a4' }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1 }} />
      </div>

      <ReactFlow
        nodes={filteredNodes}
        edges={styledEdges}
        onNodesChange={handleNodesChange}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={useCallback((_: React.MouseEvent, node: Node) => setHoveredNode(node.id), [])}
        onNodeMouseLeave={useCallback(() => setHoveredNode(null), [])}
        onPaneClick={() => setSelectedNode(null)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={true}
        nodesConnectable={false}
        edgesReconnectable={false}
        elementsSelectable={true}
        deleteKeyCode={null}
        fitView
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="bottom-left" />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.2)" />
      </ReactFlow>

      {/* Hint box */}
      <div
        className="protocol-map-hint"
        style={{
          position: 'absolute',
          top: 68,
          right: 16,
          zIndex: 10,
          fontFamily: 'System, monospace',
          fontSize: 10,
          color: 'rgba(255,255,255,0.7)',
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '5px 10px',
          pointerEvents: 'none',
        }}
      >
        Tap nodes and edges for live data &amp; details
      </div>

      {/* Emissions timeline conveyor */}
      {activeTab === 'emissions' && (() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
        const trackW = isMobile ? Math.min(window.innerWidth - 160, 260) : 420
        const weekPx = trackW
        const offset = simProgress * weekPx
        const currentWeek = Math.floor(simProgress) + 1
        const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        return (
          <div
            className="protocol-map-timeline"
            style={{
              position: 'absolute',
              bottom: isMobile ? 8 : 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              fontFamily: 'System, monospace',
              border: isMobile ? '4px double white' : '6px double white',
              boxShadow: isMobile ? '0 0 0 2px #3465a4, 4px 4px 2px rgba(0,0,0,0.5)' : '0 0 0 3px #3465a4, 8px 8px 3px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              maxWidth: 'calc(100vw - 16px)',
            }}
          >
            {/* Title bar */}
            <div style={{
              background: '#3465a4',
              padding: isMobile ? '2px 8px' : '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              borderBottom: '2px solid rgba(255,255,255,0.3)',
            }}>
              <span style={{ fontSize: isMobile ? 8 : 10, fontWeight: 'bold', color: 'white' }}>Epoch Simulation</span>
              <span style={{ fontSize: isMobile ? 7 : 9, color: 'rgba(255,255,255,0.5)' }}>Week {currentWeek}</span>
            </div>
            {/* Track area */}
            <div style={{ background: '#3465a4', padding: isMobile ? '4px 8px 4px' : '8px 12px 6px' }}>
              <div style={{ position: 'relative', width: trackW, height: isMobile ? 24 : 30, overflow: 'hidden', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {/* Moving tape */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: trackW / 2,
                  transform: `translateX(${-offset}px)`,
                  height: '100%',
                  whiteSpace: 'nowrap',
                }}>
                  {Array.from({ length: 6 }, (_, wi) => {
                    const weekIdx = Math.floor(simProgress) - 2 + wi
                    return DAYS.map((day, di) => {
                      const x = (weekIdx + di / 7) * weekPx
                      const isThursday = di === 3
                      const isMonday = di === 0
                      return (
                        <div key={`${weekIdx}-${di}`} style={{
                          position: 'absolute',
                          left: x,
                          top: 0,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}>
                          <div style={{
                            width: isThursday ? 2 : 1,
                            height: isThursday ? (isMobile ? 10 : 14) : isMonday ? (isMobile ? 7 : 10) : (isMobile ? 4 : 6),
                            background: isThursday ? '#e67e00' : 'rgba(255,255,255,0.25)',
                          }} />
                          <span style={{
                            fontSize: isMobile ? 6 : 8,
                            color: isThursday ? '#e67e00' : 'rgba(255,255,255,0.4)',
                            fontWeight: isThursday ? 'bold' : 'normal',
                            marginTop: 1,
                          }}>
                            {isMobile ? day.charAt(0) : day}
                          </span>
                        </div>
                      )
                    })
                  })}
                </div>
                {/* Fixed center needle */}
                <div style={{
                  position: 'absolute',
                  left: trackW / 2,
                  top: 0,
                  width: 2,
                  height: isMobile ? 14 : 20,
                  background: 'white',
                  zIndex: 2,
                  boxShadow: '0 0 4px rgba(255,255,255,0.5)',
                }} />
                <div style={{
                  position: 'absolute',
                  left: trackW / 2 - 3,
                  top: isMobile ? 14 : 20,
                  width: 0,
                  height: 0,
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '5px solid white',
                  zIndex: 2,
                }} />
              </div>
            </div>
          </div>
        )
      })()}

      <DetailPanel node={selectedNode} liveData={liveData} position={popupPos} activeTab={activeTab} onClose={() => setSelectedNode(null)} />
    </div>
  )
}

interface ProtocolMapProps {
  tab?: string
}

export default function ProtocolMap({ tab = 'fees' }: ProtocolMapProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvas defaultTab={tab} />
    </ReactFlowProvider>
  )
}
