import styles from './BudgetProgress.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faUtensils,
  faBolt,
  faFilm,
  faCar,
  faHeartPulse,
  faShirt,
} from '@fortawesome/free-solid-svg-icons';

const BUDGETS = [
  { label: 'Food & dining', icon: faUtensils, spent: 420, limit: 500, color: 'warning' },
  { label: 'Utilities', icon: faBolt, spent: 180, limit: 200, color: 'info' },
  { label: 'Entertainment', icon: faFilm, spent: 95, limit: 80, color: 'danger' },
  { label: 'Transport', icon: faCar, spent: 140, limit: 250, color: 'primary' },
  { label: 'Health', icon: faHeartPulse, spent: 60, limit: 150, color: 'success' },
  { label: 'Clothing', icon: faShirt, spent: 210, limit: 200, color: 'danger' },
];

export default function BudgetProgress() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <span className={styles.cardIcon}>
            <FontAwesomeIcon icon={faBullseye} />
          </span>
          <h3 className={styles.cardTitle}>Budget progress</h3>
        </div>
        <span className={styles.period}>July</span>
      </div>

      <div className={styles.list}>
        {BUDGETS.map((b, i) => {
          const pct = Math.min((b.spent / b.limit) * 100, 100);
          const over = b.spent > b.limit;
          return (
            <div key={b.label} className={styles.item} style={{ animationDelay: `${0.1 + i * 0.06}s` }}>
              <div className={styles.itemTop}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon} data-color={over ? 'danger' : b.color}>
                    <FontAwesomeIcon icon={b.icon} />
                  </span>
                  <span className={styles.itemLabel}>{b.label}</span>
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.itemSpent} data-over={over}>
                    ${b.spent}
                  </span>
                  <span className={styles.itemLimit}>/ ${b.limit}</span>
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
                  ${b.spent - b.limit} over budget
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}