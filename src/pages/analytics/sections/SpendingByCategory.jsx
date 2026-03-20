import { useState, useEffect } from 'react';
import api from "../../../utils/api";
import styles from './SpendingByCategory.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Map colors to your specific backend categories
const CATEGORY_STYLES = {
  'Food': { color: 'var(--color-warning)', bg: 'var(--color-warning-light)', text: 'var(--color-warning-text)' },
  'Entertainment': { color: 'var(--color-primary)', bg: 'var(--color-primary-light)', text: 'var(--color-primary-text)' },
  'Utilities': { color: 'var(--color-info)', bg: 'var(--color-info-light)', text: 'var(--color-info-text)' },
  'Transport': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', text: '#6d28d9' },
  'Health': { color: 'var(--color-success)', bg: 'var(--color-success-light)', text: 'var(--color-success-text)' },
  'Clothing': { color: 'var(--color-danger)', bg: 'var(--color-danger-light)', text: 'var(--color-danger-text)' },
  'Education': { color: 'var(--color-primary)', bg: 'var(--color-primary-light)', text: 'var(--color-primary-text)' },
  'Other': { color: 'var(--color-danger)', bg: 'var(--color-danger-light)', text: 'var(--color-danger-text)' },
};

// Fallback style if a new category is ever added
const getCatStyle = (cat) => CATEGORY_STYLES[cat] || { color: 'var(--color-info)', bg: 'var(--color-info-light)', text: 'var(--color-info-text)' };

const r = 56;
const cx = 72;
const cy = 72;
const circumference = 2 * Math.PI * r;
const GAP = 3;

export default function SpendingByCategory({ period }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/analytic/expenses-by-category?period=${period}`);
        // Map backend data to frontend structure
        const formattedData = response.data.map(item => ({
          label: item.category,
          amount: item.amount,
          ...getCatStyle(item.category)
        }));
        setCategories(formattedData);
      } catch (error) {
        console.error('Failed to fetch expenses by category', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryData();
  }, [period]);

  const total = categories.reduce((s, c) => s + c.amount, 0);

  // Dynamically build SVG segments based on fetched data
  const buildSegments = () => {
    let offset = 0;
    return categories.map((cat) => {
      const pct = total > 0 ? cat.amount / total : 0;
      const dash = Math.max(pct * circumference - GAP, 0);
      const seg = { ...cat, dash: Math.max(dash, 0), dashOffset: -offset * circumference / total, pct };
      offset += cat.amount;
      return seg;
    });
  };

  const SEGMENTS = buildSegments();
  const active = hovered !== null ? categories[hovered] : null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <span className={styles.cardIcon}>
            <FontAwesomeIcon icon={faChartPie} />
          </span>
          <h3 className={styles.cardTitle}>Spending by category</h3>
        </div>
        {!isLoading && <span className={styles.totalLabel}>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total</span>}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '144px', color: 'var(--text-secondary)' }}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
          No expenses recorded yet.
        </div>
      ) : (
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
              {active ? `$${active.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `$${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            </text>
            <text x={cx} y={cy + 11} textAnchor="middle" className={styles.donutSub}>
              {active ? active.label : 'total spent'}
            </text>
          </svg>

          <div className={styles.legend}>
            {categories.map((cat, i) => (
              <div
                key={cat.label}
                className={`${styles.legendItem} ${hovered === i ? styles.legendItemActive : ''}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className={styles.legendDot} style={{ background: cat.color }} />
                <span className={styles.legendLabel}>{cat.label}</span>
                <span className={styles.legendPct}>
                  {total > 0 ? ((cat.amount / total) * 100).toFixed(1) : 0}%
                </span>
                <span className={styles.legendAmt}>${cat.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}