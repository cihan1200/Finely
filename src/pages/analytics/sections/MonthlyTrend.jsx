import { useState, useEffect } from 'react';
import api from "../../../utils/api";
import styles from './MonthlyTrend.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const LINES = [
  { key: 'income', label: 'Income', color: 'var(--color-success)', strokeW: 2 },
  { key: 'expenses', label: 'Expenses', color: 'var(--color-danger)', strokeW: 2 },
  { key: 'savings', label: 'Savings', color: 'var(--color-primary)', strokeW: 2.5 },
];

export default function MonthlyTrend({ period }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLines, setActiveLines] = useState({ income: true, expenses: true, savings: true });

  useEffect(() => {
    const fetchTrendData = async () => {
      setIsLoading(true); // Trigger spinner when period changes
      try {
        const response = await api.get(`/analytic/monthly-trend?period=${period}`);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch monthly trend', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendData();
  }, [period]); // Refetch when period changes

  const toggleLine = (key) =>
    setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }));

  // Custom Tooltip component to match your original styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <span className={styles.tooltipMonth}>{label}</span>
          {payload.map((entry, index) => (
            <div key={index} className={styles.tooltipRow}>
              <span className={styles.tooltipDot} style={{ background: entry.color }} />
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

  const formatYAxis = (tickItem) => {
    if (tickItem >= 1000) return `$${(tickItem / 1000).toFixed(0)}k`;
    return `$${tickItem}`;
  };

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
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-secondary)' }}>
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {LINES.map((line) => (
                  <linearGradient key={`color-${line.key}`} id={`color-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={line.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
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
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1, strokeDasharray: '4 4' }} />

              {activeLines.income && (
                <Area type="monotone" name="Income" dataKey="income" stroke="var(--color-success)" strokeWidth={2} fillOpacity={1} fill="url(#color-income)" />
              )}
              {activeLines.expenses && (
                <Area type="monotone" name="Expenses" dataKey="expenses" stroke="var(--color-danger)" strokeWidth={2} fillOpacity={1} fill="url(#color-expenses)" />
              )}
              {activeLines.savings && (
                <Area type="monotone" name="Savings" dataKey="savings" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#color-savings)" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}