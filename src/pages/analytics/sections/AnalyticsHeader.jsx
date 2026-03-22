import styles from './AnalyticsHeader.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';

const PERIODS = [
  { label: '3 months', value: 3 },
  { label: '6 months', value: 6 },
  { label: '1 year', value: 12 }
];

export default function AnalyticsHeader({ period, setPeriod }) {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>Analytics</h1>
        <p className={styles.subtitle}>A deeper look at your financial patterns.</p>
      </div>
      <div className={styles.periodGroup}>
        <FontAwesomeIcon icon={faCalendarDays} className={styles.calIcon} />
        {PERIODS.map((p) => (
          <button
            key={p.value}
            className={`${styles.periodBtn} ${period === p.value ? styles.periodBtnActive : ''}`}
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}