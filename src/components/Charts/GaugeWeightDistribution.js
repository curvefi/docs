import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { getChartColors } from '../../utils/chartTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const GAUGES_API = 'https://prices.curve.finance/v1/dao/gauges/overview';
const GAUGES_URL = 'https://www.curve.finance/dao/ethereum/gauges';
// Matches the curve.finance DAO gauges chart, which hides gauges under 0.5%
const MIN_WEIGHT = 0.005;

const shortName = (name) => name.replace(/^Curve\.fi /, '').replace(/ Gauge Deposit$/, '');

const ChartContent = () => {
  useColorMode();
  const { txtColor, gridColor } = getChartColors();
  const css = getComputedStyle(document.documentElement);
  // Same order as curve-frontend's createChartSeriesColorScale: bar i uses chart index (i % 8) + 1
  const seriesColors = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => css.getPropertyValue(`--chart-index-${i}`).trim());
  const [gauges, setGauges] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(GAUGES_API)
      .then((res) => res.json())
      .then((json) =>
        setGauges(
          (json.gauges || [])
            .filter((g) => !g.is_killed && g.gauge_relative_weight >= MIN_WEIGHT)
            .sort((a, b) => b.gauge_relative_weight - a.gauge_relative_weight)
            .map((g) => ({
              name: shortName(g.pool?.name || g.name),
              chain: g.pool?.chain || 'ethereum',
              weight: g.gauge_relative_weight * 100,
            })),
        ),
      )
      .catch(() => setFailed(true));
  }, []);

  const link = <a href={GAUGES_URL}>curve.finance</a>;
  if (failed) return <p>Gauge data didn't load. See the live weights on {link}.</p>;
  if (!gauges) return <p>Loading gauge weights…</p>;

  const data = {
    labels: gauges.map((g) => g.name),
    datasets: [{ data: gauges.map((g) => g.weight), backgroundColor: gauges.map((_, i) => seriesColors[i % 8]) }],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        backgroundColor: '#1f2937',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: (items) => gauges[items[0].dataIndex].name,
          label: (ctx) => [`Chain: ${gauges[ctx.dataIndex].chain}`, `Weight: ${ctx.parsed.y.toFixed(2)}%`],
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: txtColor, autoSkip: false, maxRotation: 70, font: { size: 10 } } },
      y: { grid: { color: gridColor }, ticks: { color: txtColor, callback: (v) => `${v}%` } },
    },
  };

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <strong>Relative Weight Distribution</strong>
      <div style={{ position: 'relative', height: '360px', width: '100%' }}>
        <Bar data={data} options={options} />
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)' }}>
        Current week's gauge weights from curve.finance. Gauges under 0.5% are hidden; see the full list on {link}.
      </p>
    </div>
  );
};

export default function GaugeWeightDistribution() {
  return <BrowserOnly fallback={<p>Loading gauge weights…</p>}>{() => <ChartContent />}</BrowserOnly>;
}
