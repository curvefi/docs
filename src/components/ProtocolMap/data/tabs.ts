export interface TabConfig {
  id: string
  label: string
  nodeIds: Set<string>
  // Per-tab default positions (overrides graph.ts defaults)
  positions: Record<string, { x: number; y: number }>
}

export const tabs: TabConfig[] = [
  {
    id: 'fees',
    label: 'Fee Architecture',
    nodeIds: new Set([
      'stableswap', 'twocrypto', 'tricrypto',
      'fee-collector', 'cowswap-burner', 'fee-allocator', 'fee-splitter', 'fee-distributor',
      'vecrv', 'crvusd-mint-markets', 'rewards-handler', 'scrvusd',
      'treasury',
    ]),
    positions: {
      // Left column: AMM fee sources
      'stableswap': { x: -350, y: 50 },
      'twocrypto': { x: -350, y: 180 },
      'tricrypto': { x: -350, y: 310 },
      // Top: crvUSD interest path → scrvUSD
      'crvusd-mint-markets': { x: 50, y: -280 },
      'fee-splitter': { x: 50, y: -80 },
      'rewards-handler': { x: 450, y: -80 },
      'scrvusd': { x: 800, y: -80 },
      // Center: fee collection & burn loop
      'fee-collector': { x: 50, y: 180 },
      'cowswap-burner': { x: 450, y: 250 },
      // Bottom: allocation & distribution
      'fee-allocator': { x: 50, y: 440 },
      'treasury': { x: -250, y: 640 },
      'fee-distributor': { x: 350, y: 640 },
      'vecrv': { x: 700, y: 640 },
    },
  },
  {
    id: 'emissions',
    label: 'Emissions',
    nodeIds: new Set([
      'vlcvx-holders', 'sdcrv-holders',
      'voter-convex', 'voter-stakedao', 'voter-yearn',
      'voter-user1', 'voter-user2',
      'gauge-controller',
    ]),
    positions: {
      'vlcvx-holders': { x: -571, y: -4 },
      'sdcrv-holders': { x: -570, y: 56 },
      'voter-convex': { x: -250, y: -4 },
      'voter-stakedao': { x: -250, y: 56 },
      'voter-yearn': { x: -250, y: 120 },
      'voter-user1': { x: -250, y: 183 },
      'voter-user2': { x: -250, y: 246 },
      'gauge-controller': { x: 50, y: 30 },
    },
  },
  {
    // Vote Calendar lives on its own page (/vote-calendar), not in the flow
    // graph — no nodes. The topbar routes to it via TAB_ROUTES below.
    id: 'votes',
    label: 'Vote Calendar',
    nodeIds: new Set(),
    positions: {},
  },
  {
    id: 'governance',
    label: 'veCRV',
    nodeIds: new Set([
      'crv', 'vecrv', 'gauge-controller',
      'dao-voting',
      'fee-distributor',
    ]),
    positions: {
      // Top: CRV token
      'crv': { x: -50, y: -200 },
      // Center: veCRV (hub)
      'vecrv': { x: -50, y: 50 },
      // Right: Gauge voting
      'gauge-controller': { x: 300, y: 50 },
      // Bottom-right: DAO governance
      'dao-voting': { x: 300, y: 300 },
      // Left: Revenue distribution
      'fee-distributor': { x: -400, y: 50 },
    },
  },
  {
    id: 'stablecoin',
    label: 'Stablecoin (crvUSD)',
    nodeIds: new Set([
      'crvusd-token',
      'scrvusd', 'rewards-handler', 'fee-splitter',
    ]),
    positions: {
      'crvusd-token': { x: 37, y: 166 },
      'fee-splitter': { x: -247, y: 148 },
      'rewards-handler': { x: -123, y: 428 },
      'scrvusd': { x: 200, y: 400 },
      'dyn-mint-markets': { x: 23, y: -42 },
      'dyn-pegkeepers': { x: 315, y: -2 },
    },
  },
  {
    id: 'amm',
    label: 'AMM Pools',
    nodeIds: new Set([
      'stableswap', 'twocrypto', 'tricrypto',
      'router', 'stableswap-factory', 'twocrypto-factory', 'tricrypto-factory',
      'gauges',
    ]),
    positions: {
      'router': { x: -300, y: 400 },
      'stableswap': { x: 0, y: -150 },
      'twocrypto': { x: 0, y: 50 },
      'tricrypto': { x: 0, y: 250 },
      'gauges': { x: 407, y: 50 },
      'stableswap-factory': { x: -300, y: -150 },
      'twocrypto-factory': { x: -300, y: 50 },
      'tricrypto-factory': { x: -300, y: 250 },
    },
  },
  {
    id: 'lending',
    label: 'Llamalend',
    nodeIds: new Set([
      'llamalend', 'llamalend-factory', 'llamma',
    ]),
    positions: {
      'llamalend': { x: 0, y: 50 },
      // Dev-only
      'llamalend-factory': { x: -350, y: 50 },
      'llamma': { x: 300, y: 50 },
    },
  },
  {
    id: 'overview',
    label: 'Overview',
    nodeIds: new Set(), // empty = show all
    positions: {}, // uses graph.ts defaults
  },
]

// Tabs that are live vs coming soon (shared by the ProtocolMap topbar and the
// Vote Calendar page topbar).
export const ENABLED_TABS = new Set(['fees', 'emissions', 'votes'])

// Map tab IDs to their page URLs for navigation.
export const TAB_ROUTES: Record<string, string> = {
  fees: '/fee-architecture',
  governance: '/governance',
  emissions: '/emissions',
  votes: '/vote-calendar',
}
