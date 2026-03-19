import styles from './AnalyticsHeader.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';

const PERIODS = ['3 months', '6 months', '1 year'];

import { useState } from 'react';

export default function AnalyticsHeader() {
  const [period, setPeriod] = useState('6 months');

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
            key={p}
            className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}