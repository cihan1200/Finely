import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import styles from './IncomeVsExpenses.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScaleBalanced, faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// period is optional — when rendered from the Dashboard it will be undefined (defaults to 6)
export default function IncomeVsExpenses({ period = 6 }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/analytic/monthly-trend?period=${period}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch income vs expenses data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpenses = data.reduce((s, d) => s + d.expenses, 0);
  const ratio = totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : 0;

  const formatPill = (v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toLocaleString()}`);
  const formatYAxis = (tick) => (tick >= 1000 ? `$${(tick / 1000).toFixed(0)}k` : `$${tick}`);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <span className={styles.tooltipMonth}>{label}</span>
          {payload.map((entry, i) => (
            <div key={i} className={styles.tooltipRow}>
              <span className={styles.tooltipDot} style={{ background: entry.fill }} />
              <span className={styles.tooltipLabel}>{entry.name}</span>
              <span className={styles.tooltipVal}>
                ${entry.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <span className={styles.cardIcon}>
            <FontAwesomeIcon icon={faScaleBalanced} />
          </span>
          <h3 className={styles.cardTitle}>Income vs expenses</h3>
        </div>

        {!isLoading && (
          <div className={styles.summaryPills}>
            <span className={styles.pill} data-type="income">Income {formatPill(totalIncome)}</span>
            <span className={styles.pill} data-type="expenses">Expenses {formatPill(totalExpenses)}</span>
            <span className={styles.pill} data-type="ratio">{ratio}% expense ratio</span>
          </div>
        )}
      </div>

      <div className={styles.chartWrap}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px', color: 'var(--text-secondary)' }}>
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12, dy: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.5 }} />
              <Bar dataKey="income" name="Income" fill="var(--color-success)" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="expenses" name="Expenses" fill="var(--color-danger)" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem} data-type="income">
          <span className={styles.legendDot} />Income
        </span>
        <span className={styles.legendItem} data-type="expenses">
          <span className={styles.legendDot} />Expenses
        </span>
      </div>
    </div>
  );
}
