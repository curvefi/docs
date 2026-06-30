import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ethers } from 'ethers';
import styles from './styles.module.css';

const GAUGES_URL = 'https://prices.curve.finance/v1/dao/gauges/overview';
const CRV_PRICE_URL = 'https://prices.curve.finance/v1/usd_price/ethereum/0xD533a949740bb3306d119CC777fa900bA034cd52';
const VECRV_LOCKERS_URL = 'https://prices.curve.finance/v1/dao/lockers/1000';
const DEFILLAMA_HOLDERS_REVENUE_URL = 'https://api.llama.fi/summary/fees/crv-usd?dataType=dailyHoldersRevenue';
const RPC_URL = 'https://ethereum-rpc.publicnode.com/';
const VECRV_ADDRESS = '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2';
const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

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
];

const DEFAULTS = {
  depositLpTokens: '',
  depositValue: '10000',
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
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

function isEthereumGauge(gauge) {
  const chain = gauge?.pool?.chain || gauge?.market?.chain || gauge?.side_chain;
  if (!chain) return true;
  return String(chain).toLowerCase() === 'ethereum';
}

function normalizeGauge(gauge) {
  const gaugeAddress = gauge?.effective_address || gauge?.address || '';
  const tokenSymbols = Array.isArray(gauge?.tokens)
    ? gauge.tokens.map((token) => token?.symbol).filter(Boolean).join(' / ')
    : '';
  const name = gauge?.pool?.name || gauge?.market?.name || gauge?.name || 'Curve gauge';
  const lpTokenPrice = toNumber(gauge?.lp_token_price, 0);
  const poolAddress = gauge?.pool?.address || gauge?.pool_address || gauge?.lp_token || '';
  const poolTvl = toNumber(gauge?.pool?.usd_total || gauge?.pool?.tvl_usd || gauge?.pool?.tvl || gauge?.market?.usd_total, 0);
  const createdAt = toTimestamp(gauge?.pool?.created_at || gauge?.pool?.creation_date || gauge?.created_at || gauge?.creation_date);

  return {
    id: gaugeAddress || gauge?.lp_token || name,
    address: gaugeAddress,
    originalAddress: gauge?.address || '',
    poolAddress,
    name,
    symbol: tokenSymbols,
    poolTvl,
    stakedTvl: 0,
    gaugeSupply: 0,
    lpTokenPrice,
    createdAt,
    crvAprBase: toNumber(gauge?.crv_apr_base, 0),
    crvAprBoosted: toNumber(gauge?.crv_apr_boosted, 0),
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
  const provider = new ethers.JsonRpcProvider(RPC_URL, 1, { staticNetwork: true });
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
  const provider = new ethers.JsonRpcProvider(RPC_URL, 1, { staticNetwork: true });
  const multicall = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
  const gaugeIface = new ethers.Interface(GAUGE_ABI);
  const chunkSize = 120;
  const enrichedGauges = [];

  for (let index = 0; index < gauges.length; index += chunkSize) {
    const chunk = gauges.slice(index, index + chunkSize);
    const results = await multicall.aggregate3(chunk.map((gauge) => ({
      target: gauge.address,
      allowFailure: true,
      callData: gaugeIface.encodeFunctionData('totalSupply'),
    })));

    enrichedGauges.push(...chunk.map((gauge, chunkIndex) => {
      const gaugeSupply = Number(ethers.formatEther(decodeBigint(gaugeIface, 'totalSupply', results[chunkIndex]) || 0n));
      const stakedTvl = gauge.lpTokenPrice > 0 && gaugeSupply > 0 ? gaugeSupply * gauge.lpTokenPrice : 0;

      return {
        ...gauge,
        gaugeSupply,
        stakedTvl,
      };
    }));
  }

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
  const [positionMode, setPositionMode] = useState('new');
  const [showEmptyGauges, setShowEmptyGauges] = useState(false);
  const [isGaugePickerOpen, setIsGaugePickerOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState('');
  const [gaugeSort, setGaugeSort] = useState('stakedTvl');
  const [values, setValues] = useState(DEFAULTS);

  useEffect(() => {
    let ignore = false;

    async function loadCalculatorData() {
      try {
        const [gaugesResponse, priceResponse, totalVecrvResponse] = await Promise.all([
          fetchJson(GAUGES_URL),
          fetchJson(CRV_PRICE_URL).catch(() => null),
          fetchTotalVecrv().catch(() => null),
        ]);

        if (ignore) return;

        const rawGauges = gaugesResponse?.data?.gauges || gaugesResponse?.gauges || [];
        const activeGauges = rawGauges
          .filter((gauge) => !gauge?.is_killed && isEthereumGauge(gauge) && (gauge?.effective_address || gauge?.address))
          .map(normalizeGauge);

        if (!activeGauges.length) throw new Error('No active Ethereum gauges found.');

        const gaugesWithStakedTvl = await fetchGaugeStakedTvls(activeGauges);
        if (ignore) return;

        setGauges(gaugesWithStakedTvl);
        setSelectedGaugeId(gaugesWithStakedTvl[0].id);
        setValues((current) => ({
          ...current,
          ...getGaugeValueUpdates(gaugesWithStakedTvl[0], current),
          totalVecrv: totalVecrvResponse ? String(totalVecrvResponse) : current.totalVecrv,
        }));
        setCrvPrice(toNumber(priceResponse?.data?.usd_price, 0));
        setStatus('ready');
      } catch (error) {
        if (ignore) return;
        setStatus('fallback');
        setNotice('Live staked gauge TVL is unavailable. You can still enter the value staked in the gauge and total veCRV manually.');
      }
    }

    loadCalculatorData();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadRevenueData() {
      try {
        const nextRevenueData = await fetchVecrvRevenue();
        if (ignore) return;
        setRevenueData(nextRevenueData);
        setRevenueStatus(nextRevenueData.total7d || nextRevenueData.total30d ? 'ready' : 'unavailable');
      } catch (error) {
        if (ignore) return;
        setRevenueStatus('unavailable');
      }
    }

    loadRevenueData();
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
    const matchedGauges = availableGauges.filter((gauge) => {
      const matchesToken = token
        ? getGaugeTokens(gauge).some((gaugeToken) => gaugeToken.toLowerCase() === token)
        : true;
      if (!matchesToken) return false;
      if (!query) return true;

      const searchable = [
        gauge.name,
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
      if (gaugeSort === 'poolTvl') return (b.poolTvl || b.stakedTvl) - (a.poolTvl || a.stakedTvl);
      if (gaugeSort === 'poolAddress') return (a.poolAddress || '').localeCompare(b.poolAddress || '');
      if (gaugeSort === 'gaugeAddress') return (a.address || '').localeCompare(b.address || '');
      if (gaugeSort === 'created') return (b.createdAt || 0) - (a.createdAt || 0) || b.stakedTvl - a.stakedTvl;
      return b.stakedTvl - a.stakedTvl;
    });
  }, [gauges, gaugeSort, poolSearch, selectedToken, showEmptyGauges]);

  useEffect(() => {
    if (!filteredGauges.length || filteredGauges.some((gauge) => gauge.id === selectedGaugeId)) return;

    const nextGauge = filteredGauges[0];
    setSelectedGaugeId(nextGauge.id);
    setAddressData(null);
    setAddressError('');
    setValues((current) => ({
      ...current,
      ...getGaugeValueUpdates(nextGauge, current),
    }));
  }, [filteredGauges, selectedGaugeId]);

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

  const boost = futureGaugeShare > 0 && totalVecrv > 0
    ? Math.min(2.5, Math.max(1, 1 + 1.5 * (vecrvShare / futureGaugeShare)))
    : 1;
  const minVecrv = futureGaugeShare > 0 && totalVecrv > 0
    ? totalVecrv * futureGaugeShare
    : 0;
  const effectiveDeposit = depositValue * boost;
  const remainingVecrv = Math.max(minVecrv - userVecrv, 0);
  const crvForMaxBoost = lockYears > 0 ? minVecrv / (lockYears / 4) : 0;
  const remainingCrvForMaxBoost = lockYears > 0 ? remainingVecrv / (lockYears / 4) : 0;
  const crvInputCost = mode === 'crv' && crvPrice > 0 ? toNumber(values.crvAmount) * crvPrice : 0;
  const crvForMaxBoostCost = crvPrice > 0 ? crvForMaxBoost * crvPrice : 0;
  const weeklyRevenueEstimate = revenueData?.total7d ? vecrvShare * revenueData.total7d : 0;
  const monthlyRevenueEstimate = revenueData?.total30d ? vecrvShare * revenueData.total30d : 0;
  const hasRevenueData = revenueStatus === 'ready';

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
    }));
  }

  async function loadAddressPosition(event) {
    event.preventDefault();

    if (!selectedGauge?.address) {
      setAddressError('Select a gauge before loading an address.');
      return;
    }

    if (!ethers.isAddress(address.trim())) {
      setAddressError('Enter a valid Ethereum address.');
      return;
    }

    setAddressStatus('loading');
    setAddressError('');

    try {
      const userAddress = ethers.getAddress(address.trim());
      const provider = new ethers.JsonRpcProvider(RPC_URL, 1, { staticNetwork: true });
      const multicall = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
      const vecrvIface = new ethers.Interface(VECRV_ABI);
      const gaugeIface = new ethers.Interface(GAUGE_ABI);

      const results = await multicall.aggregate3([
        {
          target: VECRV_ADDRESS,
          allowFailure: false,
          callData: vecrvIface.encodeFunctionData('totalSupply'),
        },
        {
          target: VECRV_ADDRESS,
          allowFailure: false,
          callData: vecrvIface.encodeFunctionData('balanceOf', [userAddress]),
        },
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
      ]);

      const nextTotalVecrv = Number(ethers.formatEther(decodeBigint(vecrvIface, 'totalSupply', results[0]) || 0n));
      const nextUserVecrv = Number(ethers.formatEther(decodeBigint(vecrvIface, 'balanceOf', results[1]) || 0n));
      const gaugeBalance = Number(ethers.formatEther(decodeBigint(gaugeIface, 'balanceOf', results[2]) || 0n));
      const gaugeSupply = Number(ethers.formatEther(decodeBigint(gaugeIface, 'totalSupply', results[3]) || 0n));
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
      setValues((current) => ({
        ...current,
        userVecrv: String(nextUserVecrv),
        totalVecrv: nextTotalVecrv ? String(nextTotalVecrv) : current.totalVecrv,
        depositLpTokens: String(gaugeBalance),
        depositValue: selectedGauge.lpTokenPrice > 0 ? String(depositUsd.toFixed(2)) : current.depositValue,
        poolValue: String(Math.round(gaugeTvl || 0)),
      }));
      setAddressData({
        address: userAddress,
        vecrv: nextUserVecrv,
        gaugeBalance,
        gaugeSupply,
        depositUsd,
        gaugeTvl,
      });
      setAddressStatus('ready');
    } catch (error) {
      setAddressStatus('error');
      setAddressError('Could not load this address from the public Ethereum RPC. You can still enter values manually.');
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
                  <small>{selectedGauge?.symbol || 'Search active Ethereum gauges'}</small>
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
                            <small>Pool TVL</small>
                            <strong>{formatUsd(gauge.poolTvl || gauge.stakedTvl)}</strong>
                          </span>
                            <span>
                              <small>Pool address</small>
                              <strong>{gauge.poolAddress || 'Unavailable'}</strong>
                            </span>
                            <span>
                              <small>Gauge address</small>
                              <strong>{gauge.address}</strong>
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
                  ? `Loaded ${shortAddress(addressData.address)}: ${formatAmount(addressData.vecrv)} veCRV and ${formatUsd(addressData.depositUsd)} in this gauge.`
                  : 'Optional. Uses one multicall to load veCRV, staked LP balance, gauge supply, and total veCRV.')}
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
                    <label className={styles.label} htmlFor="boost-total-vecrv">Total veCRV</label>
                    <input
                      id="boost-total-vecrv"
                      className={styles.input}
                      type="number"
                      min="0"
                      step="any"
                      value={values.totalVecrv}
                      onChange={(event) => updateValue('totalVecrv', event.target.value)}
                    />
                    <p className={styles.fieldHint}>System-wide veCRV denominator.</p>
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
              <h4>Review locking benefits</h4>
              <p>Boost uses your veCRV share and future gauge LP share. Revenue share uses your share of all veCRV.</p>
            </div>
          </div>

          <div className={styles.heroMetric}>
            <span className={styles.heroLabel}>Estimated boost</span>
            <strong className={styles.heroValue}>{boost.toFixed(2)}x</strong>
            <span className={styles.heroMeta}>
              {formatUsd(effectiveDeposit)} effective deposit from {formatUsd(depositValue)}.
            </span>
          </div>

          <div className={styles.nextStep}>
            <strong>Estimated crvUSD revenue share</strong>
            <span>
              {hasRevenueData
                ? `${formatUsd(weeklyRevenueEstimate, 2)} over 7 days and ${formatUsd(monthlyRevenueEstimate, 2)} over 30 days, based on recent DefiLlama holders revenue.`
                : `Revenue data is unavailable right now. Your estimated veCRV share is ${formatPercent(vecrvShare, 5)}.`}
            </span>
          </div>

          <div className={styles.nextStep}>
            <strong>{remainingVecrv > 0 ? `${formatAmount(remainingVecrv)} more veCRV for max boost` : 'Enough veCRV for max boost'}</strong>
            <span>
              {remainingVecrv > 0 && crvPrice
                ? `About ${formatUsd(remainingCrvForMaxBoost * crvPrice, 2)} of CRV at a ${lockYears.toFixed(2)} year lock.`
                : `Max boost target is ${formatAmount(minVecrv)} veCRV.`}
            </span>
          </div>

          <div className={styles.resultStats}>
            <div>
              <span>veCRV share</span>
              <strong>{formatPercent(vecrvShare, 5)}</strong>
            </div>
            <div>
              <span>CRV for max boost</span>
              <strong>{formatAmount(crvForMaxBoost)}</strong>
            </div>
          </div>

          <a className={`button button--primary ${styles.ctaButton}`} href="https://curve.fi/dao/ethereum/vecrv/create/" target="_blank" rel="noreferrer">
            Lock CRV
          </a>
          <div className={styles.linkRow}>
            <a href="/user/vecrv/revenue">Learn about revenue share</a>
            <a href="/user/vecrv/how-to-lock">How locking works</a>
          </div>

          <details className={styles.advancedDetails}>
            <summary>Boost and revenue breakdown</summary>
            <div className={styles.supportGrid}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>veCRV share</span>
                <strong className={styles.metricValue}>{formatPercent(vecrvShare, 5)}</strong>
                <span className={styles.metricSubtext}>{formatAmount(userVecrv)} / {formatAmount(futureTotalVecrv)} veCRV</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Future gauge LP share</span>
                <strong className={styles.metricValue}>{formatPercent(futureGaugeShare, 5)}</strong>
                <span className={styles.metricSubtext}>{formatUsd(depositValue)} / {formatUsd(futureStakedGaugeTvl)} future staked TVL</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Estimated weekly revenue</span>
                <strong className={styles.metricValue}>{hasRevenueData ? formatUsd(weeklyRevenueEstimate, 2) : 'Unavailable'}</strong>
                <span className={styles.metricSubtext}>
                  {revenueData?.total7d ? `${formatUsd(revenueData.total7d, 0)} recent 7 day holders revenue` : 'Uses veCRV share when revenue data loads'}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Estimated monthly revenue</span>
                <strong className={styles.metricValue}>{hasRevenueData ? formatUsd(monthlyRevenueEstimate, 2) : 'Unavailable'}</strong>
                <span className={styles.metricSubtext}>
                  {revenueData?.total30d ? `${formatUsd(revenueData.total30d, 0)} recent 30 day holders revenue` : 'Not a guaranteed yield'}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>veCRV for max boost</span>
                <strong className={styles.metricValue}>{formatAmount(minVecrv)}</strong>
                <span className={styles.metricSubtext}>{formatAmount(remainingVecrv)} more veCRV needed</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>CRV for max boost</span>
                <strong className={styles.metricValue}>{formatAmount(crvForMaxBoost)}</strong>
                <span className={styles.metricSubtext}>
                  {crvPrice ? `${formatUsd(crvForMaxBoostCost, 2)} at ${lockYears.toFixed(2)} years` : `At ${lockYears.toFixed(2)} years`}
                </span>
              </div>
            </div>
          </details>

          <details className={styles.advancedDetails}>
            <summary>Revenue estimate source</summary>
            <div className={styles.detailsContent}>
              <p>
                Revenue estimate uses DefiLlama crvUSD holders revenue. It applies your future veCRV share to recent 7 day and 30 day holders revenue totals, so it is an estimate and not guaranteed yield.
              </p>
              <p className={styles.formulaText}>
                estimated revenue = future veCRV share * recent crvUSD holders revenue
              </p>
              <p>
                DefiLlama adapter source: <a href="https://github.com/DefiLlama/dimension-adapters/blob/master/fees/crv-usd.ts" target="_blank" rel="noreferrer">crvUSD Fees To veCRV Holders</a>.
              </p>
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
