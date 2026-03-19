import { useState } from 'react';
import styles from './SpendingByCategory.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie } from '@fortawesome/free-solid-svg-icons';

const CATEGORIES = [
  { label: 'Food', amount: 1024, color: 'var(--color-warning)', bg: 'var(--color-warning-light)', text: 'var(--color-warning-text)' },
  { label: 'Entertainment', amount: 456, color: 'var(--color-primary)', bg: 'var(--color-primary-light)', text: 'var(--color-primary-text)' },
  { label: 'Utilities', amount: 722, color: 'var(--color-info)', bg: 'var(--color-info-light)', text: 'var(--color-info-text)' },
  { label: 'Transport', amount: 312, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', text: '#6d28d9' },
  { label: 'Health', amount: 210, color: 'var(--color-success)', bg: 'var(--color-success-light)', text: 'var(--color-success-text)' },
  { label: 'Other', amount: 186, color: 'var(--color-danger)', bg: 'var(--color-danger-light)', text: 'var(--color-danger-text)' },
];

const total = CATEGORIES.reduce((s, c) => s + c.amount, 0);

const r = 56;
const cx = 72;
const cy = 72;
const circumference = 2 * Math.PI * r;
const GAP = 3;

function buildSegments() {
  let offset = 0;
  return CATEGORIES.map((cat) => {
    const pct = cat.amount / total;
    const dash = pct * circumference - GAP;
    const seg = { ...cat, dash, dashOffset: -offset * circumference / total, pct };
    offset += cat.amount;
    return seg;
  });
}

const SEGMENTS = buildSegments();

export default function SpendingByCategory() {
  const [hovered, setHovered] = useState(null);

  const active = hovered !== null ? CATEGORIES[hovered] : null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <span className={styles.cardIcon}>
            <FontAwesomeIcon icon={faChartPie} />
          </span>
          <h3 className={styles.cardTitle}>Spending by category</h3>
        </div>
        <span className={styles.totalLabel}>${total.toLocaleString()} total</span>
      </div>

      <div className={styles.chartArea}>
        <svg viewBox="0 0 144 144" className={styles.donut}>
          {SEGMENTS.map((seg, i) => (
            <circle
              key={seg.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={hovered === i ? 20 : 14}
              strokeDasharray={`${seg.dash} ${circumference}`}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                transform: 'rotate(-90deg)',
                transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                opacity: hovered !== null && hovered !== i ? 0.35 : 1,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          <text x={cx} y={cy - 7} textAnchor="middle" className={styles.donutCenter}>
            {active ? `$${active.amount.toLocaleString()}` : `$${total.toLocaleString()}`}
          </text>
          <text x={cx} y={cy + 11} textAnchor="middle" className={styles.donutSub}>
            {active ? active.label : 'total spent'}
          </text>
        </svg>

        <div className={styles.legend}>
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.label}
              className={`${styles.legendItem} ${hovered === i ? styles.legendItemActive : ''}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className={styles.legendDot} style={{ background: cat.color }} />
              <span className={styles.legendLabel}>{cat.label}</span>
              <span className={styles.legendPct}>
                {((cat.amount / total) * 100).toFixed(1)}%
              </span>
              <span className={styles.legendAmt}>${cat.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}