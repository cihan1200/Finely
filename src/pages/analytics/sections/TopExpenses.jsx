import styles from './TopExpenses.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDownWideShort,
  faUtensils,
  faFilm,
  faBolt,
  faCar,
  faHeartPulse,
  faShirt,
} from '@fortawesome/free-solid-svg-icons';

const EXPENSES = [
  { label: 'Food & dining', amount: 1024, icon: faUtensils, color: 'warning' },
  { label: 'Utilities', amount: 722, icon: faBolt, color: 'info' },
  { label: 'Entertainment', amount: 456, icon: faFilm, color: 'primary' },
  { label: 'Transport', amount: 312, icon: faCar, color: 'info' },
  { label: 'Health', amount: 210, icon: faHeartPulse, color: 'success' },
  { label: 'Clothing', amount: 186, icon: faShirt, color: 'danger' },
];

const MAX = Math.max(...EXPENSES.map((e) => e.amount));

export default function TopExpenses() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <span className={styles.cardIcon}>
            <FontAwesomeIcon icon={faArrowDownWideShort} />
          </span>
          <h3 className={styles.cardTitle}>Top expense categories</h3>
        </div>
      </div>

      <div className={styles.list}>
        {EXPENSES.map((exp, i) => (
          <div
            key={exp.label}
            className={styles.item}
            style={{ animationDelay: `${0.1 + i * 0.07}s` }}
          >
            <div className={styles.itemLeft}>
              <span className={styles.itemIcon} data-color={exp.color}>
                <FontAwesomeIcon icon={exp.icon} />
              </span>
              <span className={styles.itemLabel}>{exp.label}</span>
            </div>
            <div className={styles.barArea}>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  data-color={exp.color}
                  style={{ '--w': `${(exp.amount / MAX) * 100}%` }}
                />
              </div>
              <span className={styles.itemAmt}>${exp.amount.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}