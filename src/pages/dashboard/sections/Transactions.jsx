import { useState, useEffect } from 'react';
import styles from './Transactions.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightArrowLeft,
  faArrowUp,
  faArrowDown,
  faMagnifyingGlass,
  faSliders,
  faChevronLeft,
  faChevronRight,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import api from '../../../utils/api';

const CATEGORY_COLORS = {
  Income: 'success',
  Entertainment: 'primary',
  Food: 'warning',
  Utilities: 'info',
  Transport: 'info',
  Health: 'success',
  Clothing: 'danger',
  Education: 'primary',
  Subscriptions: 'warning',
  Other: 'neutral',
};
const getCategoryColor = (category) => CATEGORY_COLORS[category] ?? 'neutral';

const FILTERS = ['All', 'Income', 'Expense'];
const PAGE_SIZE = 6;

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/transaction');
        setTransactions(res.data);
      } catch (err) {
        console.error('Failed to fetch transactions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      tx.label.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All' ||
      (filter === 'Income' && tx.sign === 'income') ||
      (filter === 'Expense' && tx.sign === 'expense');
    return matchSearch && matchFilter;
  });

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleFilter = (f) => { setFilter(f); setPage(0); };
  const handleSearch = (e) => { setSearch(e.target.value); setPage(0); };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <span className={styles.cardIcon}>
            <FontAwesomeIcon icon={faArrowRightArrowLeft} />
          </span>
          <h3 className={styles.cardTitle}>Recent transactions</h3>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <FontAwesomeIcon icon={faSliders} className={styles.filterIcon} />
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
                onClick={() => handleFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Transaction</th>
                <th className={styles.th}>Category</th>
                <th className={styles.th}>Date</th>
                <th className={`${styles.th} ${styles.thRight}`}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.empty}>No transactions found</td>
                </tr>
              ) : (
                visible.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className={styles.row}
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <td className={styles.td}>
                      <div className={styles.txCell}>
                        <span className={styles.txIcon} data-sign={tx.sign}>
                          <FontAwesomeIcon icon={tx.sign === 'income' ? faArrowUp : faArrowDown} />
                        </span>
                        <span className={styles.txLabel}>{tx.label}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.category} data-color={getCategoryColor(tx.category)}>
                        {tx.category}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.date}>{formatDate(tx.date)}</span>
                    </td>
                    <td className={`${styles.td} ${styles.tdRight}`}>
                      <span className={styles.amount} data-sign={tx.sign}>
                        {tx.sign === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && pages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className={styles.pageButtons}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={page === pages - 1}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}