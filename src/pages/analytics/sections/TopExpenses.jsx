import { useState, useEffect } from 'react';
import api from "../../../utils/api";
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
  faGraduationCap,
  faBoxOpen,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

const CATEGORY_META = {
  'Food': { icon: faUtensils, color: 'warning' },
  'Entertainment': { icon: faFilm, color: 'primary' },
  'Utilities': { icon: faBolt, color: 'info' },
  'Transport': { icon: faCar, color: 'info' },
  'Health': { icon: faHeartPulse, color: 'success' },
  'Clothing': { icon: faShirt, color: 'danger' },
  'Education': { icon: faGraduationCap, color: 'primary' },
  'Other': { icon: faBoxOpen, color: 'danger' },
};

const getCatMeta = (cat) => CATEGORY_META[cat] || { icon: faBoxOpen, color: 'info' };

export default function TopExpenses({ period }) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopExpenses = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/analytic/expenses-by-category?period=${period}`);
        const formattedData = response.data.map(item => ({
          label: item.category,
          amount: item.amount,
          ...getCatMeta(item.category)
        }));
        setExpenses(formattedData.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch top expenses', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopExpenses();
  }, [period]);

  const MAX = expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 1;

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

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : expenses.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
          No expenses recorded yet.
        </div>
      ) : (
        <div className={styles.list}>
          {expenses.map((exp, i) => (
            <div
              key={`${exp.label}-${i}`}
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
                    style={{ '--w': MAX > 0 ? `${(exp.amount / MAX) * 100}%` : '0%' }}
                  />
                </div>
                <span className={styles.itemAmt}>${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}