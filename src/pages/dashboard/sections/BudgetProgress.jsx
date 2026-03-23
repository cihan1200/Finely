import { useState, useEffect } from 'react';
import styles from './BudgetProgress.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faUtensils, faBolt, faFilm, faCar, faHeartPulse,
  faShirt, faBook, faRotate, faTag, faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import api from '../../../utils/api';

const ICON_MAP = {
  utensils: faUtensils,
  bolt: faBolt,
  film: faFilm,
  car: faCar,
  'heart-pulse': faHeartPulse,
  shirt: faShirt,
  book: faBook,
  rotate: faRotate,
  tag: faTag,
};
const getIcon = (name) => ICON_MAP[name] ?? faTag;

function formatMoney(n) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(1)}T`;
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

const now = new Date();
const MONTH_NAME = now.toLocaleString('en-US', { month: 'long' });

export default function BudgetProgress() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await api.get('/budget');
        setBudgets(res.data);
      } catch (err) {
        console.error('Failed to fetch budgets for dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  const sorted = [...budgets].sort((a, b) => {
    const aOver = a.spent > a.limit;
    const bOver = b.spent > b.limit;
    if (aOver && !bOver) return -1;
    if (!aOver && bOver) return 1;
    return b.spent / b.limit - a.spent / a.limit;
  });

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <span className={styles.cardIcon}>
            <FontAwesomeIcon icon={faBullseye} />
          </span>
          <h3 className={styles.cardTitle}>Budget progress</h3>
        </div>
        <span className={styles.period}>{MONTH_NAME}</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', fontSize: '0.875rem' }}>
          No budgets set up yet.
        </div>
      ) : (
        <div className={styles.list}>
          {sorted.map((b, i) => {
            const pct = Math.min((b.spent / b.limit) * 100, 100);
            const over = b.spent > b.limit;
            return (
              <div key={b.id} className={styles.item} style={{ animationDelay: `${0.1 + i * 0.06}s` }}>
                <div className={styles.itemTop}>
                  <div className={styles.itemLeft}>
                    <span className={styles.itemIcon} data-color={over ? 'danger' : b.color}>
                      <FontAwesomeIcon icon={getIcon(b.icon)} />
                    </span>
                    <span className={styles.itemLabel}>{b.label}</span>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemSpent} data-over={over}>
                      {formatMoney(b.spent)}
                    </span>
                    <span className={styles.itemLimit}>/ {formatMoney(b.limit)}</span>
                  </div>
                </div>
                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    data-color={over ? 'danger' : b.color}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {over && (
                  <span className={styles.overLabel}>
                    {formatMoney(b.spent - b.limit)} over budget
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}