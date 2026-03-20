import { useState, useEffect } from 'react';
import api from "../../../utils/api";
import styles from './AnalyticsSummary.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faPercent,
  faPiggyBank,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

export default function AnalyticsSummary({ period }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/analytic/summary?period=${period}`);
        if (isMounted) setData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, [period]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (val) => `$${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const formatPercent = (val) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
  const formatCurrencyDelta = (val) => `${val >= 0 ? '+' : '-'}${formatCurrency(val)}`;

  const periodLabel = period === 12 ? '1 year' : `${period} months`;

  const CARDS = [
    {
      label: 'Avg. monthly income',
      value: formatCurrency(data.avgIncome),
      delta: formatPercent(data.avgIncomeDelta),
      positive: data.avgIncomeDelta >= 0,
      icon: faArrowTrendUp,
      color: 'success',
      sub: `vs previous ${periodLabel}`,
    },
    {
      label: 'Avg. monthly expenses',
      value: formatCurrency(data.avgExpenses),
      delta: formatPercent(data.avgExpensesDelta),
      positive: data.avgExpensesDelta <= 0,
      icon: faArrowTrendDown,
      color: 'danger',
      sub: `vs previous ${periodLabel}`,
    },
    {
      label: 'Avg. savings rate',
      value: `${data.savingsRate.toFixed(1)}%`,
      delta: formatPercent(data.savingsRateDelta),
      positive: data.savingsRateDelta >= 0,
      icon: faPercent,
      color: 'primary',
      sub: 'of income saved',
    },
    {
      label: 'Total saved',
      value: formatCurrency(data.totalSaved),
      delta: formatCurrencyDelta(data.totalSavedDelta),
      positive: data.totalSavedDelta >= 0,
      icon: faPiggyBank,
      color: 'info',
      sub: `last ${periodLabel}`,
    },
  ];

  return (
    <div className={styles.grid}>
      {CARDS.map((card, i) => (
        <div key={card.label} className={styles.card} style={{ animationDelay: `${i * 0.07}s` }}>
          <div className={styles.cardTop}>
            <span className={styles.label}>{card.label}</span>
            <span className={styles.icon} data-color={card.color}>
              <FontAwesomeIcon icon={card.icon} />
            </span>
          </div>
          <span className={styles.value}>{card.value}</span>
          <div className={styles.cardBottom}>
            <span className={styles.delta} data-positive={card.positive}>
              {card.delta}
            </span>
            <span className={styles.sub}>{card.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}