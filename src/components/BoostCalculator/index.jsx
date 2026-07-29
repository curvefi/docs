import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';
import styles from './styles.module.css';

const GAUGES_URL = 'https://prices.curve.finance/v1/dao/gauges/overview';
const CRV_PRICE_URL = 'https://prices.curve.finance/v1/usd_price/ethereum/0xD533a949740bb3306d119CC777fa900bA034cd52';
const VECRV_LOCKERS_URL = 'https://prices.curve.finance/v1/dao/lockers/1000';
const DEFILLAMA_HOLDERS_REVENUE_URL = 'https://api.llama.fi/summary/fees/crv-usd?dataType=dailyHoldersRevenue';
const VECRV_ADDRESS = '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2';
const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

const CHAIN_CONFIG = {
  ethereum: {
    id: 1,
    label: 'Ethereum',
    poolsApiSlug: 'ethereum',
    rpcUrl: 'https://ethereum-rpc.publicnode.com/',
    explorerUrl: 'https://etherscan.io',
  },
  arbitrum: {
    id: 42161,
    label: 'Arbitrum',
    poolsApiSlug: 'arbitrum',
    rpcUrl: 'https://arbitrum-one-rpc.publicnode.com/',
    explorerUrl: 'https://arbiscan.io',
  },
  fraxtal: {
    id: 252,
    label: 'Fraxtal',
    poolsApiSlug: 'fraxtal',
    rpcUrl: 'https://rpc.frax.com/',
    explorerUrl: 'https://fraxscan.com',
  },
  optimism: {
    id: 10,
    label: 'Optimism',
    poolsApiSlug: 'optimism',
    rpcUrl: 'https://optimism-rpc.publicnode.com/',
    explorerUrl: 'https://optimistic.etherscan.io',
  },
  base: {
    id: 8453,
    label: 'Base',
    poolsApiSlug: 'base',
    rpcUrl: 'https://base-rpc.publicnode.com/',
    explorerUrl: 'https://basescan.org',
  },
};

const MULTICALL3_ABI = [
  'function aggregate3((address target, bool allowFailure, bytes callData)[] calls) view returns ((bool success, bytes returnData)[])',
];

const VECRV_ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
];

const GAUGE_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function voting_escrow() view returns (address)',
];

const DEFAULTS = {
  depositLpTokens: '',
  depositValue: '',
  poolValue: '',
  totalVecrv: '',
  userVecrv: '',
  crvAmount: '',
  lockYears: '4',
};

const SORT_OPTIONS = {
  stakedTvl: 'Staked TVL',
  name: 'Name',
  poolTvl: 'Pool TVL',
  poolAddress: 'Pool address',
  gaugeAddress: 'Gauge address',
  network: 'Network',
  created: 'Creation date',
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toTimestamp(value) {
  const number = Number(value);
  if (Number.isFinite(number) && number > 0) return number;

  const parsedDate = Date.parse(value);
  return Number.isFinite(parsedDate) ? parsedDate : 0;
}

function formatUsd(value, maximumFractionDigits = 0) {
  const number = toNumber(value);
  if (!number) return '$0';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: Math.abs(number) >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits,
  }).format(number);
}

function formatAmount(value, maximumFractionDigits = 2) {
  const number = toNumber(value);
  if (!number) return '0';

  return new Intl.NumberFormat('en-US', {
    notation: Math.abs(number) >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits,
  }).format(number);
}

function formatPercent(value, maximumFractionDigits = 4) {
  const number = toNumber(value);
  if (!number) return '0%';

  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits,
  }).format(number);
}

function shortAddress(address) {
  if (!address) return 'No address';
  return `${address.slice(0, 7)}...${address.slice(-5)}`;
}

function parseVecrvWeight(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number / 1e18 : 0;
}

function getGaugeTokens(gauge) {
  if (!gauge?.symbol) return [];
  return gauge.symbol.split('/').map((token) => token.trim()).filter(Boolean);
}

function getGaugeValueUpdates(gauge, currentValues) {
  if (!gauge) return {};

  const depositValue = toNumber(currentValues.depositValue);

  return {
    depositLpTokens: gauge.lpTokenPrice > 0 && depositValue > 0
      ? String(depositValue / gauge.lpTokenPrice)
      : currentValues.depositLpTokens,
    poolValue: String(Math.round(gauge.stakedTvl || 0)),
  };
}

function getPoolLpTokenPrice(pool) {
  const supply = pool?.totalSupply ? Number(ethers.formatEther(BigInt(pool.totalSupply))) : 0;
  return supply > 0 ? toNumber(pool?.usdTotal) / supply : 0;
}

function overviewChain(gauge) {
  return String(gauge?.pool?.chain || gauge?.market?.chain || gauge?.side_chain || gauge?.chain || '').toLowerCase();
}

function getOverviewKeys(gauge) {
  const chain = overviewChain(gauge);
  return [gauge?.effective_address, gauge?.address, gauge?.pool?.address, gauge?.pool_address, gauge?.lp_token]
    .filter(Boolean)
    .map((address) => `${chain}:${String(address).toLowerCase()}`);
}

function makeOverviewIndex(rawGauges) {
  const index = new Map();
  rawGauges.forEach((gauge) => {
    getOverviewKeys(gauge).forEach((key) => index.set(key, gauge));
  });
  return index;
}

function normalizeGauge(pool, chain, overviewIndex) {
  const overview = overviewIndex.get(`${chain}:${String(pool?.gaugeAddress || '').toLowerCase()}`)
    || overviewIndex.get(`${chain}:${String(pool?.lpTokenAddress || '').toLowerCase()}`);
  const gaugeAddress = pool?.gaugeAddress || overview?.effective_address || overview?.address || '';
  const tokenSymbols = Array.isArray(pool?.coins)
    ? pool.coins.map((token) => token?.symbol).filter(Boolean).join(' / ')
    : '';
  const name = pool?.name || overview?.pool?.name || overview?.market?.name || overview?.name || 'Curve gauge';
  const lpTokenPrice = toNumber(overview?.lp_token_price, getPoolLpTokenPrice(pool));
  const poolAddress = pool?.address || pool?.lpTokenAddress || overview?.pool?.address || overview?.pool_address || '';
  const poolTvl = toNumber(pool?.usdTotal, toNumber(overview?.pool?.usd_total || overview?.pool?.tvl_usd || overview?.market?.usd_total));
  const createdAt = toTimestamp(pool?.creationTs || overview?.pool?.created_at || overview?.pool?.creation_date || overview?.created_at);

  return {
    id: `${chain}:${gaugeAddress || poolAddress || name}`,
    chain,
    chainLabel: CHAIN_CONFIG[chain].label,
    address: gaugeAddress,
    originalAddress: overview?.address || '',
    poolAddress,
    lpTokenAddress: pool?.lpTokenAddress || poolAddress,
    registryId: pool?.registryId || '',
    name,
    symbol: tokenSymbols,
    poolTvl,
    stakedTvl: 0,
    gaugeSupply: 0,
    lpTokenPrice,
    createdAt,
    crvAprBase: toNumber(pool?.gaugeCrvApy?.[0], toNumber(overview?.crv_apr_base, 0)),
    crvAprBoosted: toNumber(pool?.gaugeCrvApy?.[1], toNumber(overview?.crv_apr_boosted, 0)),
  };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function decodeBigint(iface, method, result) {
  if (!result?.success || result.returnData === '0x') return null;
  return iface.decodeFunctionResult(method, result.returnData)[0];
}

async function fetchTotalVecrv() {
  const provider = new ethers.JsonRpcProvider(CHAIN_CONFIG.ethereum.rpcUrl, 1, { staticNetwork: true });
  const multicall = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
  const vecrvIface = new ethers.Interface(VECRV_ABI);
  const [result] = await multicall.aggregate3([
    {
      target: VECRV_ADDRESS,
      allowFailure: false,
      callData: vecrvIface.encodeFunctionData('totalSupply'),
    },
  ]);

  return Number(ethers.formatEther(decodeBigint(vecrvIface, 'totalSupply', result) || 0n));
}

async function fetchGaugeStakedTvls(gauges) {
  const gaugeIface = new ethers.Interface(GAUGE_ABI);
  const chunkSize = 120;
  const enrichedGauges = [];

  await Promise.all(Object.keys(CHAIN_CONFIG).map(async (chain) => {
    const chainGauges = gauges.filter((gauge) => gauge.chain === chain && ethers.isAddress(gauge.address));
    if (!chainGauges.length) return;

    try {
      const config = CHAIN_CONFIG[chain];
      const provider = new ethers.JsonRpcProvider(config.rpcUrl, config.id, { staticNetwork: true });
      const multicall = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);

      for (let index = 0; index < chainGauges.length; index += chunkSize) {
        const chunk = chainGauges.slice(index, index + chunkSize);
        const results = await multicall.aggregate3(chunk.map((gauge) => ({
          target: gauge.address,
          allowFailure: true,
          callData: gaugeIface.encodeFunctionData('totalSupply'),
        })));

        enrichedGauges.push(...chunk.map((gauge, chunkIndex) => {
          const gaugeSupply = Number(ethers.formatEther(decodeBigint(gaugeIface, 'totalSupply', results[chunkIndex]) || 0n));
          return {
            ...gauge,
            gaugeSupply,
            stakedTvl: gauge.lpTokenPrice > 0 && gaugeSupply > 0 ? gaugeSupply * gauge.lpTokenPrice : 0,
          };
        }));
      }
    } catch (error) {
      // Preserve the pool API data and manual calculator inputs when one chain RPC is unavailable.
      enrichedGauges.push(...chainGauges);
    }
  }));

  return enrichedGauges.sort((a, b) => b.stakedTvl - a.stakedTvl);
}

async function fetchVecrvLeaderboard() {
  const response = await fetchJson(VECRV_LOCKERS_URL);
  const users = Array.isArray(response?.users) ? response.users : [];

  return users
    .filter((user) => user?.user && user.user !== 'Others')
    .map((user, index) => ({
      address: user.user.toLowerCase(),
      rank: index + 1,
      vecrv: parseVecrvWeight(user.weight),
    }))
    .filter((user) => user.vecrv > 0);
}

async function fetchVecrvRevenue() {
  const response = await fetchJson(DEFILLAMA_HOLDERS_REVENUE_URL);
  return {
    total7d: toNumber(response?.total7d),
    total30d: toNumber(response?.total30d),
  };
}

export default function BoostCalculator() {
  const selectorButtonRef = useRef(null);
  const pickerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [gauges, setGauges] = useState([]);
  const [selectedGaugeId, setSelectedGaugeId] = useState('');
  const [poolSearch, setPoolSearch] = useState('');
  const [status, setStatus] = useState('loading');
  const [notice, setNotice] = useState('');
  const [crvPrice, setCrvPrice] = useState(0);
  const [mode, setMode] = useState('crv');
  const [address, setAddress] = useState('');
  const [addressStatus, setAddressStatus] = useState('idle');
  const [addressError, setAddressError] = useState('');
  const [addressData, setAddressData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState('loading');
  const [revenueData, setRevenueData] = useState(null);
  const [revenueStatus, setRevenueStatus] = useState('loading');
  const [ethereumVotingSupply, setEthereumVotingSupply] = useState(0);
  const [positionMode, setPositionMode] = useState('new');
  const [showEmptyGauges, setShowEmptyGauges] = useState(false);
  const [isGaugePickerOpen, setIsGaugePickerOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [gaugeSort, setGaugeSort] = useState('stakedTvl');
  const [values, setValues] = useState(DEFAULTS);

  useEffect(() => {
    let ignore = false;

    async function loadCalculatorData() {
      try {
        const [gaugesResponse, priceResponse, totalVecrvResponse, ...poolResponses] = await Promise.all([
          fetchJson(GAUGES_URL),
          fetchJson(CRV_PRICE_URL).catch(() => null),
          fetchTotalVecrv().catch(() => null),
          ...Object.values(CHAIN_CONFIG).map((chain) => fetchJson(`https://api.curve.finance/v1/getPools/all/${chain.poolsApiSlug}`).catch(() => null)),
        ]);

        if (ignore) return;

        const rawGauges = gaugesResponse?.data?.gauges || gaugesResponse?.gauges || [];
        const overviewIndex = makeOverviewIndex(rawGauges);
        const activeGauges = Object.keys(CHAIN_CONFIG).flatMap((chain, index) => {
          const pools = poolResponses[index]?.data?.poolData || poolResponses[index]?.poolData || [];
          return pools
            .filter((pool) => pool?.gaugeAddress)
            .map((pool) => normalizeGauge(pool, chain, overviewIndex))
            .filter((gauge) => ethers.isAddress(gauge.address));
        });

        if (!activeGauges.length) throw new Error('No active gauges found.');

        const gaugesWithStakedTvl = await fetchGaugeStakedTvls(activeGauges);
        if (ignore) return;

        setGauges(gaugesWithStakedTvl);
        setSelectedGaugeId(gaugesWithStakedTvl[0].id);
        setEthereumVotingSupply(totalVecrvResponse || 0);
        setValues((current) => ({
          ...current,
          ...getGaugeValueUpdates(gaugesWithStakedTvl[0], current),
          totalVecrv: gaugesWithStakedTvl[0].chain === 'ethereum' && totalVecrvResponse ? String(totalVecrvResponse) : '',
        }));
        setCrvPrice(toNumber(priceResponse?.data?.usd_price, 0));
        setStatus('ready');
      } catch (error) {
        if (ignore) return;
        setStatus('fallback');
        setNotice('Live gauge data is unavailable. You can still enter the value staked in the gauge and voting supply manually.');
      }
    }

    loadCalculatorData();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isGaugePickerOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => searchInputRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isGaugePickerOpen]);

  useEffect(() => {
    let ignore = false;

    fetchVecrvRevenue()
      .then((data) => {
        if (ignore) return;
        setRevenueData(data);
        setRevenueStatus(data.total7d || data.total30d ? 'ready' : 'unavailable');
      })
      .catch(() => {
        if (!ignore) setRevenueStatus('unavailable');
      });

    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadLeaderboard() {
      try {
        const nextLeaderboard = await fetchVecrvLeaderboard();
        if (ignore) return;
        setLeaderboard(nextLeaderboard);
        setLeaderboardStatus(nextLeaderboard.length ? 'ready' : 'unavailable');
      } catch (error) {
        if (ignore) return;
        setLeaderboardStatus('unavailable');
      }
    }

    loadLeaderboard();
    return () => {
      ignore = true;
    };
  }, []);

  const selectedGauge = useMemo(
    () => gauges.find((gauge) => gauge.id === selectedGaugeId) || null,
    [gauges, selectedGaugeId],
  );

  const tokenOptions = useMemo(() => {
    const tokenCounts = new Map();

    gauges.forEach((gauge) => {
      getGaugeTokens(gauge).forEach((token) => {
        tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
      });
    });

    return Array.from(tokenCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([token]) => token);
  }, [gauges]);

  const filteredGauges = useMemo(() => {
    const query = poolSearch.trim().toLowerCase();
    const availableGauges = showEmptyGauges
      ? gauges
      : gauges.filter((gauge) => gauge.stakedTvl > 0);
    const token = selectedToken.trim().toLowerCase();
    const network = selectedNetwork.trim().toLowerCase();
    const matchedGauges = availableGauges.filter((gauge) => {
      if (network && gauge.chain !== network) return false;
      const matchesToken = token
        ? getGaugeTokens(gauge).some((gaugeToken) => gaugeToken.toLowerCase() === token)
        : true;
      if (!matchesToken) return false;
      if (!query) return true;

      const searchable = [
        gauge.name,
        gauge.chainLabel,
        gauge.symbol,
        gauge.address,
        gauge.originalAddress,
        gauge.poolAddress,
        formatUsd(gauge.stakedTvl),
        formatUsd(gauge.poolTvl),
      ].join(' ').toLowerCase();

      return searchable.includes(query);
    });

    return [...matchedGauges].sort((a, b) => {
      if (gaugeSort === 'name') return a.name.localeCompare(b.name);
      if (gaugeSort === 'network') return a.chainLabel.localeCompare(b.chainLabel) || b.stakedTvl - a.stakedTvl;
      if (gaugeSort === 'poolTvl') return (b.poolTvl || b.stakedTvl) - (a.poolTvl || a.stakedTvl);
      if (gaugeSort === 'poolAddress') return (a.poolAddress || '').localeCompare(b.poolAddress || '');
      if (gaugeSort === 'gaugeAddress') return (a.address || '').localeCompare(b.address || '');
      if (gaugeSort === 'created') return (b.createdAt || 0) - (a.createdAt || 0) || b.stakedTvl - a.stakedTvl;
      return b.stakedTvl - a.stakedTvl;
    });
  }, [gauges, gaugeSort, poolSearch, selectedNetwork, selectedToken, showEmptyGauges]);

  useEffect(() => {
    if (!filteredGauges.length || filteredGauges.some((gauge) => gauge.id === selectedGaugeId)) return;

    const nextGauge = filteredGauges[0];
    setSelectedGaugeId(nextGauge.id);
    setAddressData(null);
    setAddressError('');
    setValues((current) => ({
      ...current,
      ...getGaugeValueUpdates(nextGauge, current),
      totalVecrv: nextGauge.chain === 'ethereum' ? String(ethereumVotingSupply || '') : '',
    }));
  }, [ethereumVotingSupply, filteredGauges, selectedGaugeId]);

  const lockYears = Math.min(Math.max(toNumber(values.lockYears, 4), 0.01), 4);
  const depositLpTokens = toNumber(values.depositLpTokens);
  const depositValue = selectedGauge?.lpTokenPrice > 0
    ? depositLpTokens * selectedGauge.lpTokenPrice
    : toNumber(values.depositValue);
  const currentStakedGaugeTvl = toNumber(values.poolValue);
  const futureStakedGaugeTvl = positionMode === 'new'
    ? currentStakedGaugeTvl + depositValue
    : currentStakedGaugeTvl;
  const totalVecrv = toNumber(values.totalVecrv);
  const userVecrv = mode === 'vecrv'
    ? toNumber(values.userVecrv)
    : toNumber(values.crvAmount) * (lockYears / 4);
  const futureTotalVecrv = mode === 'crv' ? totalVecrv + userVecrv : totalVecrv;
  const vecrvShare = futureTotalVecrv > 0 ? userVecrv / futureTotalVecrv : 0;
  const revenueUserVecrv = mode === 'crv' ? userVecrv : addressData?.ethereumVecrv ?? userVecrv;
  const revenueTotalVecrv = addressData?.ethereumTotalVecrv || ethereumVotingSupply;
  const futureRevenueTotalVecrv = mode === 'crv' ? revenueTotalVecrv + revenueUserVecrv : revenueTotalVecrv;
  const revenueVecrvShare = futureRevenueTotalVecrv > 0 ? revenueUserVecrv / futureRevenueTotalVecrv : 0;
  const futureGaugeShare = futureStakedGaugeTvl > 0 ? depositValue / futureStakedGaugeTvl : 0;
  const leaderboardMatch = addressData?.address
    ? leaderboard.find((holder) => holder.address === addressData.address.toLowerCase())
    : null;
  const estimatedLeaderboardRank = userVecrv > 0 && leaderboard.length
    ? leaderboard.filter((holder) => holder.vecrv > userVecrv).length + 1
    : 0;
  const displayedLeaderboardRank = leaderboardMatch?.rank || estimatedLeaderboardRank;
  const isOutsideFetchedLeaderboard = userVecrv > 0
    && leaderboard.length > 0
    && estimatedLeaderboardRank > leaderboard.length;

  const hasDeposit = depositValue > 0;
  const hasBoostInputs = hasDeposit && futureStakedGaugeTvl > 0 && totalVecrv > 0;
  const boost = hasBoostInputs
    ? Math.min(2.5, Math.max(1, 1 + 1.5 * (vecrvShare / futureGaugeShare)))
    : 1;
  // `totalVecrv` includes an existing position's veCRV balance. To reach 2.5x,
  // the user's balance must equal their gauge share of the resulting veCRV supply.
  const otherVecrv = Math.max(totalVecrv - (mode === 'vecrv' ? userVecrv : 0), 0);
  const maxBoostIsUnreachable = hasBoostInputs && futureGaugeShare >= 1 && otherVecrv > 0;
  const minVecrv = hasBoostInputs && futureGaugeShare > 0 && futureGaugeShare < 1
    ? (futureGaugeShare * otherVecrv) / (1 - futureGaugeShare)
    : 0;
  const effectiveDeposit = depositValue * boost;
  const remainingVecrv = Math.max(minVecrv - userVecrv, 0);
  const crvForMaxBoost = lockYears > 0 ? minVecrv / (lockYears / 4) : 0;
  const remainingCrvForMaxBoost = lockYears > 0 ? remainingVecrv / (lockYears / 4) : 0;
  const crvInputCost = mode === 'crv' && crvPrice > 0 ? toNumber(values.crvAmount) * crvPrice : 0;
  const crvForMaxBoostCost = crvPrice > 0 ? crvForMaxBoost * crvPrice : 0;
  const weeklyRevenueEstimate = revenueData?.total7d ? revenueVecrvShare * revenueData.total7d : 0;
  const monthlyRevenueEstimate = revenueData?.total30d ? revenueVecrvShare * revenueData.total30d : 0;
  const hasRevenueData = revenueStatus === 'ready';
  const automaticBoostUnavailable = selectedGauge?.chain !== 'ethereum' && addressData?.oracleUnavailable;

  function updateValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function closeGaugePicker({ restoreFocus = true } = {}) {
    setIsGaugePickerOpen(false);
    if (restoreFocus) {
      window.setTimeout(() => selectorButtonRef.current?.focus(), 0);
    }
  }

  function handleGaugePickerKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeGaugePicker();
      return;
    }

    if (event.key !== 'Tab' || !pickerRef.current) return;

    const focusableElements = Array.from(pickerRef.current.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.offsetParent !== null);
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function handleGaugeChange(id) {
    const nextGauge = gauges.find((gauge) => gauge.id === id);
    setSelectedGaugeId(id);
    setAddressData(null);
    setAddressError('');
    closeGaugePicker();

    setValues((current) => ({
      ...current,
      ...getGaugeValueUpdates(nextGauge, current),
      totalVecrv: nextGauge?.chain === 'ethereum' ? String(ethereumVotingSupply || '') : '',
    }));
  }

  async function loadAddressPosition(event) {
    event.preventDefault();

    if (!selectedGauge?.address) {
      setAddressError('Select a gauge before loading an address.');
      return;
    }

    if (!ethers.isAddress(address.trim())) {
      setAddressError('Enter a valid EVM address.');
      return;
    }

    setAddressStatus('loading');
    setAddressError('');

    try {
      const userAddress = ethers.getAddress(address.trim());
      const config = CHAIN_CONFIG[selectedGauge.chain];
      const provider = new ethers.JsonRpcProvider(config.rpcUrl, config.id, { staticNetwork: true });
      const multicall = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
      const vecrvIface = new ethers.Interface(VECRV_ABI);
      const gaugeIface = new ethers.Interface(GAUGE_ABI);

      const gaugeResults = await multicall.aggregate3([
        {
          target: selectedGauge.address,
          allowFailure: true,
          callData: gaugeIface.encodeFunctionData('balanceOf', [userAddress]),
        },
        {
          target: selectedGauge.address,
          allowFailure: true,
          callData: gaugeIface.encodeFunctionData('totalSupply'),
        },
        {
          target: selectedGauge.address,
          allowFailure: true,
          callData: gaugeIface.encodeFunctionData('voting_escrow'),
        },
      ]);

      const gaugeBalance = Number(ethers.formatEther(decodeBigint(gaugeIface, 'balanceOf', gaugeResults[0]) || 0n));
      const gaugeSupply = Number(ethers.formatEther(decodeBigint(gaugeIface, 'totalSupply', gaugeResults[1]) || 0n));
      const oracleAddress = gaugeResults[2]?.success && gaugeResults[2].returnData !== '0x'
        ? gaugeIface.decodeFunctionResult('voting_escrow', gaugeResults[2].returnData)[0]
        : '';
      let nextTotalVecrv = 0;
      let nextUserVecrv = 0;
      let oracleUnavailable = false;

      if (selectedGauge.chain === 'ethereum') {
        const vecrvResults = await multicall.aggregate3([
          { target: VECRV_ADDRESS, allowFailure: false, callData: vecrvIface.encodeFunctionData('totalSupply') },
          { target: VECRV_ADDRESS, allowFailure: false, callData: vecrvIface.encodeFunctionData('balanceOf', [userAddress]) },
        ]);
        nextTotalVecrv = Number(ethers.formatEther(decodeBigint(vecrvIface, 'totalSupply', vecrvResults[0]) || 0n));
        nextUserVecrv = Number(ethers.formatEther(decodeBigint(vecrvIface, 'balanceOf', vecrvResults[1]) || 0n));
      } else if (ethers.isAddress(oracleAddress) && oracleAddress !== ethers.ZeroAddress) {
        const oracleResults = await multicall.aggregate3([
          { target: oracleAddress, allowFailure: true, callData: vecrvIface.encodeFunctionData('totalSupply') },
          { target: oracleAddress, allowFailure: true, callData: vecrvIface.encodeFunctionData('balanceOf', [userAddress]) },
        ]);
        nextTotalVecrv = Number(ethers.formatEther(decodeBigint(vecrvIface, 'totalSupply', oracleResults[0]) || 0n));
        nextUserVecrv = Number(ethers.formatEther(decodeBigint(vecrvIface, 'balanceOf', oracleResults[1]) || 0n));
        oracleUnavailable = !nextTotalVecrv;
      } else {
        oracleUnavailable = true;
      }

      const ethereumProvider = selectedGauge.chain === 'ethereum'
        ? provider
        : new ethers.JsonRpcProvider(CHAIN_CONFIG.ethereum.rpcUrl, 1, { staticNetwork: true });
      const ethereumMulticall = selectedGauge.chain === 'ethereum'
        ? multicall
        : new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, ethereumProvider);
      const ethereumResults = selectedGauge.chain === 'ethereum'
        ? null
        : await ethereumMulticall.aggregate3([
          { target: VECRV_ADDRESS, allowFailure: true, callData: vecrvIface.encodeFunctionData('totalSupply') },
          { target: VECRV_ADDRESS, allowFailure: true, callData: vecrvIface.encodeFunctionData('balanceOf', [userAddress]) },
        ]);
      const ethereumTotalVecrv = selectedGauge.chain === 'ethereum'
        ? nextTotalVecrv
        : Number(ethers.formatEther(decodeBigint(vecrvIface, 'totalSupply', ethereumResults[0]) || 0n));
      const ethereumUserVecrv = selectedGauge.chain === 'ethereum'
        ? nextUserVecrv
        : Number(ethers.formatEther(decodeBigint(vecrvIface, 'balanceOf', ethereumResults[1]) || 0n));
      const depositUsd = selectedGauge.lpTokenPrice > 0 ? gaugeBalance * selectedGauge.lpTokenPrice : 0;
      const gaugeTvl = selectedGauge.lpTokenPrice > 0 && gaugeSupply > 0
        ? gaugeSupply * selectedGauge.lpTokenPrice
        : selectedGauge.stakedTvl;

      setGauges((currentGauges) => currentGauges.map((gauge) => (
        gauge.id === selectedGauge.id
          ? { ...gauge, gaugeSupply, stakedTvl: gaugeTvl }
          : gauge
      )));
      setMode('vecrv');
      setPositionMode('current');
      if (ethereumTotalVecrv) setEthereumVotingSupply(ethereumTotalVecrv);
      setValues((current) => ({
        ...current,
        userVecrv: String(nextUserVecrv),
        totalVecrv: nextTotalVecrv ? String(nextTotalVecrv) : '',
        depositLpTokens: String(gaugeBalance),
        depositValue: selectedGauge.lpTokenPrice > 0 ? String(depositUsd.toFixed(2)) : current.depositValue,
        poolValue: String(Math.round(gaugeTvl || 0)),
      }));
      setAddressData({
        address: userAddress,
        vecrv: nextUserVecrv,
        ethereumVecrv: ethereumUserVecrv,
        ethereumTotalVecrv,
        votingEscrow: selectedGauge.chain === 'ethereum' ? VECRV_ADDRESS : oracleAddress,
        oracleUnavailable,
        gaugeBalance,
        gaugeSupply,
        depositUsd,
        gaugeTvl,
      });
      setAddressStatus('ready');
    } catch (error) {
      setAddressStatus('error');
      setAddressError(`Could not load this address from the public ${selectedGauge.chainLabel} RPC. You can still enter values manually.`);
    }
  }

  return (
    <section className={styles.calculator} aria-label="Boost calculator">
      {notice ? <p className={styles.notice}>{notice}</p> : null}

      <div className={styles.guidedLayout}>
        <div className={styles.steps}>
          <section className={styles.step}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <h4>Select a pool gauge</h4>
                <p>Pick the gauge where your LP tokens are or will be staked.</p>
              </div>
              <span className={styles.badge}>{status === 'loading' ? 'Loading gauges' : `${gauges.length || 'Manual'} gauges`}</span>
            </div>

            <div className={styles.fieldWide}>
              <span className={styles.label}>Selected pool gauge</span>
              <button
                ref={selectorButtonRef}
                type="button"
                className={styles.selectorButton}
                onClick={() => setIsGaugePickerOpen((isOpen) => !isOpen)}
                aria-expanded={isGaugePickerOpen}
                aria-controls="boost-gauge-picker"
                disabled={!gauges.length}
              >
                <span className={styles.selectorMain}>
                  <strong>{selectedGauge?.name || 'Select a gauge'}</strong>
                  <small>{selectedGauge?.symbol || 'Search active gauges across supported networks'}</small>
                  {selectedGauge ? <small>Network {selectedGauge.chainLabel}</small> : null}
                  {selectedGauge?.poolAddress ? (
                    <>
                      <small>Pool {shortAddress(selectedGauge.poolAddress)}</small>
                      <small>Gauge {shortAddress(selectedGauge.address)}</small>
                    </>
                  ) : null}
                </span>
                <span className={styles.selectorMetrics}>
                  <span>
                    <small>Staked</small>
                    <strong>{formatUsd(selectedGauge?.stakedTvl || 0)}</strong>
                  </span>
                  <span>
                    <small>CRV APR</small>
                    <strong>{formatPercent(selectedGauge?.crvAprBase || 0, 2)} to {formatPercent(selectedGauge?.crvAprBoosted || 0, 2)}</strong>
                  </span>
                  <span>
                    <small>Future LP share</small>
                    <strong>{formatPercent(futureGaugeShare, 5)}</strong>
                  </span>
                </span>
                <span>{isGaugePickerOpen ? 'Close' : 'Select'}</span>
              </button>

              {selectedGauge?.chain && selectedGauge.chain !== 'ethereum' ? (
                <p className={styles.notice}>L2 boost estimates use the selected chain’s veCRV oracle. New CRV locks may need the cross-chain oracle update before they affect L2 boost.</p>
              ) : null}

              {isGaugePickerOpen ? (
                <>
                  <div className={styles.pickerBackdrop} onClick={() => closeGaugePicker()} />
                  <div
                    ref={pickerRef}
                    className={styles.gaugePicker}
                    id="boost-gauge-picker"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="boost-gauge-picker-title"
                    onKeyDown={handleGaugePickerKeyDown}
                  >
                    <div className={styles.pickerHeader}>
                      <div>
                        <h5 id="boost-gauge-picker-title">Select a pool gauge</h5>
                        <p>Search by token, pool name, pool address, or gauge address.</p>
                      </div>
                      <button
                        type="button"
                        className={styles.closeButton}
                        onClick={() => closeGaugePicker()}
                      >
                        Close
                      </button>
                    </div>

                    <input
                      ref={searchInputRef}
                      id="boost-pool-search"
                      className={styles.input}
                      type="search"
                      aria-label="Search active gauges"
                      value={poolSearch}
                      onChange={(event) => setPoolSearch(event.target.value)}
                      placeholder="Search by pool, token, pool address, or gauge address"
                      autoComplete="off"
                      spellCheck="false"
                      data-lpignore="true"
                      data-1p-ignore
                      disabled={!gauges.length}
                    />
                    <p className={styles.fieldHint}>
                      {filteredGauges.length
                        ? `${filteredGauges.length} matching gauges, sorted by ${SORT_OPTIONS[gaugeSort].toLowerCase()}.`
                        : 'No gauges match this search.'}
                    </p>

                    <div className={styles.pickerControls}>
                      <label>
                        <span className={styles.label}>Network filter</span>
                        <select className={styles.input} value={selectedNetwork} onChange={(event) => setSelectedNetwork(event.target.value)}>
                          <option value="">All supported networks</option>
                          {Object.entries(CHAIN_CONFIG).map(([chain, config]) => (
                            <option key={chain} value={chain}>{config.label}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span className={styles.label}>Token filter</span>
                        <select
                          className={styles.input}
                          value={selectedToken}
                          onChange={(event) => setSelectedToken(event.target.value)}
                          disabled={!tokenOptions.length}
                        >
                          <option value="">All tokens</option>
                          {tokenOptions.map((token) => (
                            <option key={token} value={token}>{token}</option>
                          ))}
                        </select>
                      </label>
                      <label className={styles.mobileSortControl}>
                        <span className={styles.label}>Sort by</span>
                        <select
                          className={styles.input}
                          value={gaugeSort}
                          onChange={(event) => setGaugeSort(event.target.value)}
                        >
                          {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className={styles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={showEmptyGauges}
                        onChange={(event) => setShowEmptyGauges(event.target.checked)}
                      />
                      <span>Show gauges with no staked TVL</span>
                    </label>

                    <div className={styles.gaugeTableHeader}>
                      <button type="button" aria-pressed={gaugeSort === 'name'} onClick={() => setGaugeSort('name')}>Pool</button>
                      <button type="button" aria-pressed={gaugeSort === 'network'} onClick={() => setGaugeSort('network')}>Network</button>
                      <button type="button" aria-pressed={gaugeSort === 'poolTvl'} onClick={() => setGaugeSort('poolTvl')}>Pool TVL</button>
                      <button type="button" aria-pressed={gaugeSort === 'poolAddress'} onClick={() => setGaugeSort('poolAddress')}>Pool address</button>
                      <button type="button" aria-pressed={gaugeSort === 'gaugeAddress'} onClick={() => setGaugeSort('gaugeAddress')}>Gauge address</button>
                    </div>

                    <div className={styles.gaugeList} role="listbox" aria-label="Pool gauges" tabIndex="0">
                      {filteredGauges.map((gauge) => (
                        <button
                          key={gauge.id}
                          type="button"
                          role="option"
                          className={gauge.id === selectedGaugeId ? styles.gaugeOptionActive : styles.gaugeOption}
                          onClick={() => handleGaugeChange(gauge.id)}
                          aria-selected={gauge.id === selectedGaugeId}
                        >
                          <span className={styles.gaugeMain}>
                            <strong>{gauge.name}</strong>
                          {gauge.symbol ? <small>Tokens {gauge.symbol}</small> : null}
                        </span>
                        <span className={styles.gaugeMeta}>
                          <span>
                            <small>Network</small>
                            <strong>{gauge.chainLabel}</strong>
                          </span>
                          <span>
                            <small>Pool TVL</small>
                            <strong>{formatUsd(gauge.poolTvl || gauge.stakedTvl)}</strong>
                          </span>
                            <span>
                              <small>Pool address</small>
                              <strong>{gauge.poolAddress ? shortAddress(gauge.poolAddress) : 'Unavailable'}</strong>
                            </span>
                            <span>
                              <small>Gauge address</small>
                              <strong>{shortAddress(gauge.address)}</strong>
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <details className={styles.advancedDetails}>
              <summary>Gauge contract details</summary>
              <div className={styles.detailsStrip}>
                <div className={styles.detailItem}>
                  <span>Network</span>
                  <strong>{selectedGauge?.chainLabel || 'No gauge selected'}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Gauge address</span>
                  <strong>{selectedGauge?.address || 'No gauge selected'}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Staked in gauge</span>
                  <strong>{formatUsd(selectedGauge?.stakedTvl || 0)}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>Gauge supply</span>
                  <strong>{formatAmount(selectedGauge?.gaugeSupply || 0)}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>VotingEscrow source</span>
                  <strong>{addressData?.votingEscrow || (selectedGauge?.chain === 'ethereum' ? VECRV_ADDRESS : 'Load an address to read oracle')}</strong>
                </div>
                <div className={styles.detailItem}>
                  <span>LP token price</span>
                  <strong>{formatUsd(selectedGauge?.lpTokenPrice || 0, 4)}</strong>
                </div>
              </div>
            </details>
          </section>

          <section className={styles.step}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <h4>Enter or load your position</h4>
                <p>Paste an address to auto-fill a current position, or enter your LP token amount manually.</p>
              </div>
            </div>

            <form className={styles.fieldWide} onSubmit={loadAddressPosition}>
              <label className={styles.label} htmlFor="boost-address">Address lookup</label>
              <div className={styles.addressRow}>
                <input
                  id="boost-address"
                  className={styles.input}
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="0x..."
                  autoComplete="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore
                />
                <button
                  className={styles.secondaryButton}
                  type="submit"
                  disabled={addressStatus === 'loading' || !selectedGauge}
                >
                  {addressStatus === 'loading' ? 'Loading...' : 'Load address'}
                </button>
              </div>
              <p className={addressError ? styles.errorText : styles.fieldHint}>
                {addressError || (addressData
                  ? (addressData.oracleUnavailable
                    ? `Loaded ${shortAddress(addressData.address)} and the gauge position, but this L2 voting oracle is unavailable or has zero supply. Enter voting values manually to estimate boost.`
                    : `Loaded ${shortAddress(addressData.address)}: ${formatAmount(addressData.vecrv)} voting balance and ${formatUsd(addressData.depositUsd)} in this gauge.`)
                  : 'Optional. Loads your staked LP balance, gauge supply, and the voting supply used by this gauge.')}
              </p>
            </form>

            {selectedGauge?.lpTokenPrice > 0 ? (
              <div className={styles.fieldWide}>
                <label className={styles.label} htmlFor="boost-deposit-lp">Your LP token amount</label>
                <input
                  id="boost-deposit-lp"
                  className={styles.input}
                  type="number"
                  min="0"
                  step="any"
                  value={values.depositLpTokens}
                  onChange={(event) => {
                    const nextLpTokens = event.target.value;
                    updateValue('depositLpTokens', nextLpTokens);
                    updateValue('depositValue', String(toNumber(nextLpTokens) * selectedGauge.lpTokenPrice));
                  }}
                />
                <p className={styles.fieldHint}>
                  Estimated at {formatUsd(depositValue, 2)} using an LP token price of {formatUsd(selectedGauge.lpTokenPrice, 4)}.
                </p>
              </div>
            ) : (
              <div className={styles.fieldWide}>
                <label className={styles.label} htmlFor="boost-deposit">Estimated deposit value</label>
                <input
                  id="boost-deposit"
                  className={styles.input}
                  type="number"
                  min="0"
                  step="any"
                  value={values.depositValue}
                  onChange={(event) => updateValue('depositValue', event.target.value)}
                />
                <p className={styles.fieldHint}>
                  LP token price is unavailable for this gauge, so the calculator needs a USD estimate.
                </p>
              </div>
            )}

            <details className={styles.advancedDetails}>
              <summary>Advanced boost inputs</summary>
              <div className={styles.detailsContent}>
                <div className={styles.twoColumn}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="boost-pool-value">Current staked gauge TVL</label>
                    <input
                      id="boost-pool-value"
                      className={styles.input}
                      type="number"
                      min="0"
                      step="any"
                      value={values.poolValue}
                      onChange={(event) => updateValue('poolValue', event.target.value)}
                    />
                    <p className={styles.fieldHint}>Current USD value staked in this gauge, not total pool liquidity.</p>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="boost-total-vecrv">Voting supply used by this gauge</label>
                    <input
                      id="boost-total-vecrv"
                      className={styles.input}
                      type="number"
                      min="0"
                      step="any"
                      value={values.totalVecrv}
                      onChange={(event) => updateValue('totalVecrv', event.target.value)}
                    />
                    <p className={styles.fieldHint}>{selectedGauge?.chain === 'ethereum' ? 'Ethereum VotingEscrow supply denominator.' : 'Selected chain L2 VotingEscrow Oracle supply denominator.'}</p>
                  </div>
                </div>
                <div className={styles.fieldWide}>
                  <span className={styles.label}>Position type</span>
                  <div className={styles.segmentedControl} role="group" aria-label="Choose position estimate type">
                    <button
                      type="button"
                      className={positionMode === 'new' ? styles.segmentActive : styles.segment}
                      onClick={() => setPositionMode('new')}
                    >
                      New/additional
                    </button>
                    <button
                      type="button"
                      className={positionMode === 'current' ? styles.segmentActive : styles.segment}
                      onClick={() => setPositionMode('current')}
                    >
                      Already staked
                    </button>
                  </div>
                  <p className={styles.fieldHint}>
                    Future gauge share uses {positionMode === 'new' ? 'current staked TVL plus your deposit.' : 'current staked TVL as already including your deposit.'}
                  </p>
                </div>
              </div>
            </details>
          </section>

          <section className={styles.step}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <h4>Enter veCRV or CRV lock details</h4>
                <p>Use current veCRV if you already locked CRV, or estimate veCRV from a planned CRV lock.</p>
              </div>
            </div>

            <div className={styles.fieldWide}>
              <span className={styles.label}>Input mode</span>
              <div className={styles.segmentedControl} role="group" aria-label="Choose veCRV input mode">
                <button
                  type="button"
                  className={mode === 'vecrv' ? styles.segmentActive : styles.segment}
                  onClick={() => setMode('vecrv')}
                >
                  Current veCRV
                </button>
                <button
                  type="button"
                  className={mode === 'crv' ? styles.segmentActive : styles.segment}
                  onClick={() => setMode('crv')}
                >
                  CRV + lock
                </button>
              </div>
            </div>

            {mode === 'vecrv' ? (
              <div className={styles.fieldWide}>
                <label className={styles.label} htmlFor="boost-user-vecrv">Your veCRV</label>
                <input
                  id="boost-user-vecrv"
                  className={styles.input}
                  type="number"
                  min="0"
                  step="any"
                  value={values.userVecrv}
                  onChange={(event) => updateValue('userVecrv', event.target.value)}
                />
                <p className={styles.fieldHint}>Paste your current veCRV balance, or load it from an address above.</p>
              </div>
            ) : (
              <div className={styles.twoColumn}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="boost-crv-amount">CRV to lock</label>
                  <input
                    id="boost-crv-amount"
                    className={styles.input}
                    type="number"
                    min="0"
                    step="any"
                    value={values.crvAmount}
                    onChange={(event) => updateValue('crvAmount', event.target.value)}
                  />
                  <p className={styles.fieldHint}>{crvPrice ? `${formatUsd(crvInputCost, 2)} at the live CRV price.` : 'CRV price unavailable.'}</p>
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="boost-lock-years">Lock duration</label>
                  <input
                    id="boost-lock-years"
                    className={styles.input}
                    type="number"
                    min="0.01"
                    max="4"
                    step="0.01"
                    value={values.lockYears}
                    onChange={(event) => updateValue('lockYears', event.target.value)}
                  />
                  <p className={styles.fieldHint}>Years, capped at 4 for max veCRV.</p>
                </div>
              </div>
            )}

            <div className={styles.inlineMetrics}>
              <div>
                <span>Future veCRV</span>
                <strong>{formatAmount(userVecrv)}</strong>
                <small>
                  {mode === 'crv'
                    ? `${formatAmount(toNumber(values.crvAmount))} CRV locked for ${lockYears.toFixed(2)} years`
                    : 'Current veCRV used for this estimate'}
                </small>
              </div>
              <div>
                <span>Future veCRV share</span>
                <strong>{formatPercent(vecrvShare, 5)}</strong>
                <small>{formatAmount(userVecrv)} / {formatAmount(futureTotalVecrv)} veCRV</small>
              </div>
              <div>
                <span>Holder leaderboard</span>
                <strong>
                  {leaderboardStatus === 'loading'
                    ? 'Loading'
                    : displayedLeaderboardRank
                      ? `${isOutsideFetchedLeaderboard ? '>' : '#'}${formatAmount(displayedLeaderboardRank, 0)}`
                      : 'Unavailable'}
                </strong>
                <small>
                  {leaderboardStatus === 'ready'
                    ? (leaderboardMatch
                      ? 'Matched loaded address'
                      : isOutsideFetchedLeaderboard
                        ? `Outside top ${formatAmount(leaderboard.length, 0)} fetched holders`
                        : 'Estimated by veCRV balance')
                    : 'Leaderboard source unavailable'}
                </small>
              </div>
            </div>
          </section>
        </div>

        <aside className={styles.resultPanel} aria-live="polite">
          <div className={styles.stepHeader}>
            <span className={styles.stepNumber}>4</span>
            <div>
              <h4>Review your boost</h4>
              <p>Boost compares your share of this gauge’s voting supply with your future share of its staked LP tokens. Revenue share always uses Ethereum veCRV.</p>
            </div>
          </div>

          <div className={styles.heroMetric}>
            <span className={styles.heroLabel}>{automaticBoostUnavailable ? 'Manual boost estimate' : 'Estimated boost'}</span>
            <strong className={styles.heroValue}>{hasBoostInputs ? `${boost.toFixed(2)}x` : '—'}</strong>
            <span className={styles.heroMeta}>
              {hasBoostInputs
                ? `${formatUsd(effectiveDeposit)} effective deposit from ${formatUsd(depositValue)}.`
                : 'Enter an LP token amount or deposit value to calculate your boost.'}
            </span>
          </div>

          <div className={styles.nextStep}>
            <strong>Estimated crvUSD revenue share</strong>
            <span>
              {hasRevenueData
                ? `${formatUsd(weeklyRevenueEstimate, 2)} over 7 days and ${formatUsd(monthlyRevenueEstimate, 2)} over 30 days, based on recent holders revenue and your Ethereum veCRV share.`
                : `Revenue data is unavailable right now. Your estimated Ethereum veCRV share is ${formatPercent(revenueVecrvShare, 5)}.`}
            </span>
          </div>

          <div className={styles.nextStep}>
            <strong>
              {!hasBoostInputs
                ? 'Enter a deposit amount to calculate max boost'
                : maxBoostIsUnreachable
                  ? '2.5x boost cannot be reached for this position'
                  : remainingVecrv > 0
                    ? `${formatAmount(remainingVecrv)} more veCRV for 2.5x boost`
                    : 'Enough veCRV for 2.5x boost'}
            </strong>
            <span>
              {!hasBoostInputs
                ? 'The required veCRV depends on the share of the gauge that your deposit represents.'
                : maxBoostIsUnreachable
                  ? 'This deposit would be the entire staked gauge. Because other veCRV exists, its voting share cannot reach 100%; reduce the position or use the estimated boost below.'
                  : remainingVecrv > 0 && crvPrice
                    ? `About ${formatUsd(remainingCrvForMaxBoost * crvPrice, 2)} of CRV at a ${lockYears.toFixed(2)} year lock.`
                    : `The 2.5x target requires ${formatAmount(minVecrv)} veCRV.`}
            </span>
          </div>

          <div className={styles.resultStats}>
            <div>
              <span>Gauge voting share</span>
              <strong>{hasBoostInputs ? formatPercent(vecrvShare, 5) : '—'}</strong>
            </div>
            <div>
              <span>CRV for 2.5x boost</span>
              <strong>{hasBoostInputs && !maxBoostIsUnreachable ? formatAmount(crvForMaxBoost) : '—'}</strong>
            </div>
          </div>

          <a className={`button button--primary ${styles.ctaButton}`} href="https://curve.fi/dao/ethereum/vecrv/create/" target="_blank" rel="noreferrer">
            Lock CRV
          </a>
          <div className={styles.linkRow}>
            <a href="/user/vecrv/how-to-lock">How locking works</a>
          </div>

          <details className={styles.advancedDetails}>
            <summary>Boost breakdown</summary>
            <div className={styles.supportGrid}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Gauge voting share</span>
                <strong className={styles.metricValue}>{formatPercent(vecrvShare, 5)}</strong>
                <span className={styles.metricSubtext}>{formatAmount(userVecrv)} / {formatAmount(futureTotalVecrv)} veCRV</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Future gauge LP share</span>
                <strong className={styles.metricValue}>{formatPercent(futureGaugeShare, 5)}</strong>
                <span className={styles.metricSubtext}>{formatUsd(depositValue)} / {formatUsd(futureStakedGaugeTvl)} future staked TVL</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>veCRV for 2.5x boost</span>
                <strong className={styles.metricValue}>{hasBoostInputs && !maxBoostIsUnreachable ? formatAmount(minVecrv) : 'Unavailable'}</strong>
                <span className={styles.metricSubtext}>
                  {hasBoostInputs && !maxBoostIsUnreachable ? `${formatAmount(remainingVecrv)} more veCRV needed` : 'Enter a supported deposit amount'}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>CRV for 2.5x boost</span>
                <strong className={styles.metricValue}>{hasBoostInputs && !maxBoostIsUnreachable ? formatAmount(crvForMaxBoost) : 'Unavailable'}</strong>
                <span className={styles.metricSubtext}>
                  {hasBoostInputs && !maxBoostIsUnreachable
                    ? (crvPrice ? `${formatUsd(crvForMaxBoostCost, 2)} at ${lockYears.toFixed(2)} years` : `At ${lockYears.toFixed(2)} years`)
                    : 'Not available for this position'}
                </span>
              </div>
            </div>
          </details>

          <details className={styles.advancedDetails}>
            <summary>How boost is calculated</summary>
            <div className={styles.detailsContent}>
              <p>
                Curve boosts compare your share of all veCRV against your future share of the selected gauge's staked LP tokens.
              </p>
              <p className={styles.formulaText}>
                boost = min(2.5, 1 + 1.5 * (veCRV share / future gauge LP share))
              </p>
              <p>
                Estimates use the standard Curve working-balance boost formula. Boost updates on-chain after a deposit, withdrawal, or claim.
              </p>
            </div>
          </details>
        </aside>
      </div>
    </section>
  );
}
