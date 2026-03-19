import { useState, useMemo } from 'react';
import styles from './TransactionsTable.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faSliders,
  faArrowUp,
  faArrowDown,
  faChevronLeft,
  faChevronRight,
  faTrash,
  faChevronUp,
  faChevronDown,
  faSort,
} from '@fortawesome/free-solid-svg-icons';

const CATEGORY_COLORS = {
  Income: 'success',
  Entertainment: 'primary',
  Food: 'warning',
  Utilities: 'info',
  Transport: 'info',
  Health: 'success',
  Clothing: 'danger',
  Education: 'primary',
};

const getCategoryColor = (cat) => CATEGORY_COLORS[cat] ?? 'neutral';

const FILTERS = ['All', 'Income', 'Expense'];
const PAGE_SIZE = 8;

const SORT_FIELDS = {
  date: (a, b) => new Date(b.date) - new Date(a.date),
  label: (a, b) => a.label.localeCompare(b.label),
  amount: (a, b) => b.amount - a.amount,
  category: (a, b) => a.category.localeCompare(b.category),
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function TransactionsTable({ transactions, onDelete }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const handleSearch = (e) => { setSearch(e.target.value); setPage(0); };
  const handleFilter = (f) => { setFilter(f); setPage(0); };

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      onDelete(id);
      setDeletingId(null);
    }, 300);
  };

  const filtered = useMemo(() => {
    let list = transactions.filter((tx) => {
      const q = search.toLowerCase();
      const matchSearch = tx.label.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q);
      const matchFilter = filter === 'All' ||
        (filter === 'Income' && tx.sign === 'income') ||
        (filter === 'Expense' && tx.sign === 'expense');
      return matchSearch && matchFilter;
    });

    const comparator = SORT_FIELDS[sortKey];
    list = [...list].sort((a, b) =>
      sortDir === 'asc' ? comparator(a, b) : comparator(b, a)
    );

    return list;
  }, [transactions, search, filter, sortKey, sortDir]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const SortIcon = ({ field }) => {
    if (sortKey !== field) return <FontAwesomeIcon icon={faSort} className={styles.sortIconNeutral} />;
    return <FontAwesomeIcon icon={sortDir === 'asc' ? faChevronUp : faChevronDown} className={styles.sortIconActive} />;
  };

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.toolbarRight}>
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

          <span className={styles.resultCount}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>
                <button className={styles.sortBtn} onClick={() => handleSort('label')}>
                  Transaction <SortIcon field="label" />
                </button>
              </th>
              <th className={styles.th}>
                <button className={styles.sortBtn} onClick={() => handleSort('category')}>
                  Category <SortIcon field="category" />
                </button>
              </th>
              <th className={styles.th}>
                <button className={styles.sortBtn} onClick={() => handleSort('date')}>
                  Date <SortIcon field="date" />
                </button>
              </th>
              <th className={`${styles.th} ${styles.thRight}`}>
                <button className={`${styles.sortBtn} ${styles.sortBtnRight}`} onClick={() => handleSort('amount')}>
                  Amount <SortIcon field="amount" />
                </button>
              </th>
              <th className={styles.th} />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.emptyIcon} />
                  No transactions found
                </td>
              </tr>
            ) : (
              visible.map((tx, i) => (
                <tr
                  key={tx.id}
                  className={`${styles.row} ${deletingId === tx.id ? styles.rowDeleting : ''}`}
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
                      {tx.sign === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(tx.id)}
                      aria-label={`Delete ${tx.label}`}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 0 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Showing {filtered.length === 0 ? 0 : page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className={styles.pageControls}>
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                className={`${styles.pageNum} ${page === i ? styles.pageNumActive : ''}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <div className={styles.pageArrows}>
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
        </div>
      )}
    </div>
  );
}