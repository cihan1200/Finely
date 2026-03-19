import { useState } from 'react';
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
} from '@fortawesome/free-solid-svg-icons';

const ALL_TRANSACTIONS = [
  { id: 1, label: 'Salary deposit', category: 'Income', amount: 4200.00, sign: 'income', date: 'Jul 31, 2025' },
  { id: 2, label: 'Netflix', category: 'Entertainment', amount: -15.99, sign: 'expense', date: 'Jul 29, 2025' },
  { id: 3, label: 'Grocery Store', category: 'Food', amount: -63.40, sign: 'expense', date: 'Jul 28, 2025' },
  { id: 4, label: 'Spotify', category: 'Entertainment', amount: -9.99, sign: 'expense', date: 'Jul 27, 2025' },
  { id: 5, label: 'Electricity bill', category: 'Utilities', amount: -94.50, sign: 'expense', date: 'Jul 25, 2025' },
  { id: 6, label: 'Freelance work', category: 'Income', amount: 850.00, sign: 'income', date: 'Jul 23, 2025' },
  { id: 7, label: 'Uber', category: 'Transport', amount: -18.70, sign: 'expense', date: 'Jul 22, 2025' },
  { id: 8, label: 'Gym membership', category: 'Health', amount: -40.00, sign: 'expense', date: 'Jul 20, 2025' },
  { id: 9, label: 'Supermarket', category: 'Food', amount: -87.30, sign: 'expense', date: 'Jul 19, 2025' },
  { id: 10, label: 'Dividends', category: 'Income', amount: 120.00, sign: 'income', date: 'Jul 15, 2025' },
];

const CATEGORY_COLORS = {
  Income: 'success',
  Entertainment: 'primary',
  Food: 'warning',
  Utilities: 'info',
  Transport: 'info',
  Health: 'success',
  Clothing: 'danger',
};

const getCategoryColor = (category) => CATEGORY_COLORS[category] ?? 'neutral';

const FILTERS = ['All', 'Income', 'Expense'];
const PAGE_SIZE = 6;

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(0);

  const filtered = ALL_TRANSACTIONS.filter((tx) => {
    const matchSearch = tx.label.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' ||
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
                    <span className={styles.date}>{tx.date}</span>
                  </td>
                  <td className={`${styles.td} ${styles.tdRight}`}>
                    <span className={styles.amount} data-sign={tx.sign}>
                      {tx.sign === 'income' ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
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