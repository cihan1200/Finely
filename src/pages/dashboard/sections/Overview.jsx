import { useState, useEffect } from 'react';
import styles from './Overview.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faArrowTrendUp,
  faArrowTrendDown,
  faCircleHalfStroke,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import api from '../../../utils/api';

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/analytic/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard overview', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  const fmt = (val) =>
    `$${Math.abs(val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtPct = (val) => {
    const n = val ?? 0;
    return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
  };
  const isPos = (val) => (val ?? 0) >= 0;

  const CARDS = data
    ? [
      {
        label: 'Total balance',
        value: fmt(data.totalBalance),
        change: fmtPct(data.balanceDelta),
        changeLabel: 'vs last month',
        positive: isPos(data.balanceDelta),
        icon: faWallet,
        color: 'primary',
      },
      {
        label: 'Total income',
        value: fmt(data.currentMonthIncome),
        change: fmtPct(data.incomeDelta),
        changeLabel: 'vs last month',
        positive: isPos(data.incomeDelta),
        icon: faArrowTrendUp,
        color: 'success',
      },
      {
        label: 'Total expenses',
        value: fmt(data.currentMonthExpenses),
        change: fmtPct(data.expensesDelta),
        changeLabel: 'vs last month',
        positive: !isPos(data.expensesDelta),
        icon: faArrowTrendDown,
        color: 'danger',
      },
      {
        label: 'Savings rate',
        value: `${(data.currentMonthSavingsRate ?? 0).toFixed(1)}%`,
        change: fmtPct(data.savingsRateDelta),
        changeLabel: 'vs last month',
        positive: isPos(data.savingsRateDelta),
        icon: faCircleHalfStroke,
        color: 'info',
      },
    ]
    : [];

  return (
    <div className={styles.grid}>
      {CARDS.map((card, i) => (
        <div
          key={card.label}
          className={styles.card}
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          <div className={styles.cardTop}>
            <span className={styles.label}>{card.label}</span>
            <span className={styles.icon} data-color={card.color}>
              <FontAwesomeIcon icon={card.icon} />
            </span>
          </div>
          <span className={styles.value}>{card.value}</span>
          <div className={styles.cardBottom}>
            <span className={styles.change} data-positive={card.positive}>
              {card.change}
            </span>
            <span className={styles.changeLabel}>{card.changeLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
