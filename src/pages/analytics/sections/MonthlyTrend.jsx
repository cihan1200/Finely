import styles from './MonthlyTrend.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const DATA = [
  { month: 'Feb', income: 4800, expenses: 2100, savings: 2700 },
  { month: 'Mar', income: 5200, expenses: 1950, savings: 3250 },
  { month: 'Apr', income: 4900, expenses: 2400, savings: 2500 },
  { month: 'May', income: 5800, expenses: 1800, savings: 4000 },
  { month: 'Jun', income: 5100, expenses: 2250, savings: 2850 },
  { month: 'Jul', income: 6200, expenses: 1840, savings: 4360 },
];

const W = 560;
const H = 160;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };
const chartW = W - PAD.left - PAD.right;
const chartH = H - PAD.top - PAD.bottom;

const maxVal = Math.max(...DATA.flatMap((d) => [d.income, d.expenses, d.savings]));
const yScale = (v) => chartH - (v / maxVal) * chartH;
const xScale = (i) => (i / (DATA.length - 1)) * chartW;

function makePath(key) {
  return DATA.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d[key]).toFixed(1)}`).join(' ');
}

function makeArea(key) {
  const line = DATA.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d[key]).toFixed(1)}`).join(' ');
  return `${line} L${xScale(DATA.length - 1).toFixed(1)},${chartH} L0,${chartH} Z`;
}

const LINES = [
  { key: 'income', label: 'Income', color: 'var(--color-success)', strokeW: 2 },
  { key: 'expenses', label: 'Expenses', color: 'var(--color-danger)', strokeW: 2 },
  { key: 'savings', label: 'Savings', color: 'var(--color-primary)', strokeW: 2.5 },
];

const yLabels = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal].reverse();

export default function MonthlyTrend() {
  const [tooltip, setTooltip] = useState(null);
  const [activeLines, setActiveLines] = useState({ income: true, expenses: true, savings: true });

  const toggleLine = (key) =>
    setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <span className={styles.cardIcon}>
            <FontAwesomeIcon icon={faArrowTrendUp} />
          </span>
          <h3 className={styles.cardTitle}>Monthly trend</h3>
        </div>
        <div className={styles.legend}>
          {LINES.map((line) => (
            <button
              key={line.key}
              className={`${styles.legendBtn} ${!activeLines[line.key] ? styles.legendBtnOff : ''}`}
              onClick={() => toggleLine(line.key)}
            >
              <span className={styles.legendDot} style={{ background: line.color }} />
              {line.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartWrap}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={styles.svg}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            {LINES.map((line) => (
              <linearGradient key={line.key} id={`grad-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={line.color} stopOpacity="0.18" />
                <stop offset="100%" stopColor={line.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          <g transform={`translate(${PAD.left},${PAD.top})`}>
            {yLabels.map((v, i) => {
              const y = yScale(v);
              return (
                <g key={i}>
                  <line x1={0} y1={y} x2={chartW} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
                  <text x={-8} y={y + 4} textAnchor="end" className={styles.axisLabel}>
                    ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                  </text>
                </g>
              );
            })}

            {LINES.map((line) =>
              activeLines[line.key] ? (
                <path key={`area-${line.key}`} d={makeArea(line.key)} fill={`url(#grad-${line.key})`} />
              ) : null
            )}

            {LINES.map((line) =>
              activeLines[line.key] ? (
                <path
                  key={`line-${line.key}`}
                  d={makePath(line.key)}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={line.strokeW}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.linePath}
                />
              ) : null
            )}

            {DATA.map((d, i) => (
              <g key={i}>
                <rect
                  x={xScale(i) - 20}
                  y={0}
                  width={40}
                  height={chartH}
                  fill="transparent"
                  onMouseEnter={() => setTooltip({ i, d, x: xScale(i) })}
                />
                {tooltip?.i === i && (
                  <line x1={xScale(i)} y1={0} x2={xScale(i)} y2={chartH} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 2" />
                )}
                {LINES.map((line) =>
                  activeLines[line.key] && tooltip?.i === i ? (
                    <circle key={line.key} cx={xScale(i)} cy={yScale(d[line.key])} r={4} fill={line.color} stroke="var(--bg-elevated)" strokeWidth={2} />
                  ) : null
                )}
                <text x={xScale(i)} y={chartH + 18} textAnchor="middle" className={styles.axisLabel}>
                  {d.month}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {tooltip && (
          <div
            className={styles.tooltip}
            style={{
              left: `calc(${PAD.left}px + ${xScale(tooltip.i) / W * 100}% + 8px)`,
            }}
          >
            <span className={styles.tooltipMonth}>{tooltip.d.month}</span>
            {LINES.filter((l) => activeLines[l.key]).map((line) => (
              <div key={line.key} className={styles.tooltipRow}>
                <span className={styles.tooltipDot} style={{ background: line.color }} />
                <span className={styles.tooltipLabel}>{line.label}</span>
                <span className={styles.tooltipVal}>${tooltip.d[line.key].toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}