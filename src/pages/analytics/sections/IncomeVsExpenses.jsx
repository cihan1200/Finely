import styles from './IncomeVsExpenses.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScaleBalanced } from '@fortawesome/free-solid-svg-icons';

const DATA = [
  { month: 'Feb', income: 4800, expenses: 2100 },
  { month: 'Mar', income: 5200, expenses: 1950 },
  { month: 'Apr', income: 4900, expenses: 2400 },
  { month: 'May', income: 5800, expenses: 1800 },
  { month: 'Jun', income: 5100, expenses: 2250 },
  { month: 'Jul', income: 6200, expenses: 1840 },
];

const MAX = Math.max(...DATA.flatMap((d) => [d.income, d.expenses]));
const fmt = (v) => `$${(v / 1000).toFixed(1)}k`;

export default function IncomeVsExpenses() {
  const totalIncome = DATA.reduce((s, d) => s + d.income, 0);
  const totalExpenses = DATA.reduce((s, d) => s + d.expenses, 0);
  const ratio = ((totalExpenses / totalIncome) * 100).toFixed(1);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <span className={styles.cardIcon}>
            <FontAwesomeIcon icon={faScaleBalanced} />
          </span>
          <h3 className={styles.cardTitle}>Income vs expenses</h3>
        </div>
        <div className={styles.summaryPills}>
          <span className={styles.pill} data-type="income">
            Income ${(totalIncome / 1000).toFixed(1)}k
          </span>
          <span className={styles.pill} data-type="expenses">
            Expenses ${(totalExpenses / 1000).toFixed(1)}k
          </span>
          <span className={styles.pill} data-type="ratio">
            {ratio}% expense ratio
          </span>
        </div>
      </div>

      <div className={styles.chartArea}>
        <div className={styles.yAxis}>
          {[MAX, MAX * 0.75, MAX * 0.5, MAX * 0.25, 0].map((v, i) => (
            <span key={i} className={styles.yLabel}>
              {v === 0 ? '$0' : fmt(v)}
            </span>
          ))}
        </div>

        <div className={styles.bars}>
          {DATA.map((d, i) => (
            <div key={d.month} className={styles.barGroup} style={{ '--i': i }}>
              <div className={styles.barPair}>
                <div className={styles.barWrapper} title={`Income: $${d.income.toLocaleString()}`}>
                  <div
                    className={`${styles.bar} ${styles.barIncome}`}
                    style={{ '--h': `${(d.income / MAX) * 100}%` }}
                  />
                </div>
                <div className={styles.barWrapper} title={`Expenses: $${d.expenses.toLocaleString()}`}>
                  <div
                    className={`${styles.bar} ${styles.barExpenses}`}
                    style={{ '--h': `${(d.expenses / MAX) * 100}%` }}
                  />
                </div>
              </div>
              <span className={styles.xLabel}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem} data-type="income">
          <span className={styles.legendDot} />
          Income
        </span>
        <span className={styles.legendItem} data-type="expenses">
          <span className={styles.legendDot} />
          Expenses
        </span>
      </div>
    </div>
  );
}