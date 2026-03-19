import styles from './SpendingChart.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';

const MONTHS = [
  { label: 'Feb', income: 4800, expenses: 2100 },
  { label: 'Mar', income: 5200, expenses: 1950 },
  { label: 'Apr', income: 4900, expenses: 2400 },
  { label: 'May', income: 5800, expenses: 1800 },
  { label: 'Jun', income: 5100, expenses: 2250 },
  { label: 'Jul', income: 6200, expenses: 1840 },
];

const MAX = 7000;

export default function SpendingChart() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <span className={styles.cardIcon}>
            <FontAwesomeIcon icon={faChartBar} />
          </span>
          <h3 className={styles.cardTitle}>Income vs Expenses</h3>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem} data-type="income">Income</span>
          <span className={styles.legendItem} data-type="expenses">Expenses</span>
        </div>
      </div>

      <div className={styles.chartArea}>
        <div className={styles.yAxis}>
          {[7000, 5250, 3500, 1750, 0].map((v) => (
            <span key={v} className={styles.yLabel}>
              {v === 0 ? '0' : `$${(v / 1000).toFixed(1)}k`}
            </span>
          ))}
        </div>

        <div className={styles.bars}>
          {MONTHS.map((month, i) => (
            <div key={month.label} className={styles.barGroup} style={{ '--i': i }}>
              <div className={styles.barPair}>
                <div className={styles.barWrapper}>
                  <div
                    className={`${styles.bar} ${styles.barIncome}`}
                    style={{ '--h': `${(month.income / MAX) * 100}%` }}
                    title={`Income: $${month.income.toLocaleString()}`}
                  />
                </div>
                <div className={styles.barWrapper}>
                  <div
                    className={`${styles.bar} ${styles.barExpenses}`}
                    style={{ '--h': `${(month.expenses / MAX) * 100}%` }}
                    title={`Expenses: $${month.expenses.toLocaleString()}`}
                  />
                </div>
              </div>
              <span className={styles.xLabel}>{month.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}