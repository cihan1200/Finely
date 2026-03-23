import { useState, useEffect, useMemo } from 'react';
import styles from './ExportHistory.module.css';
import api from '../../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileCsv,
  faFilePdf,
  faFileCode,
  faClockRotateLeft,
  faArrowsDownToLine,
  faSpinner,
  faChevronLeft,
  faChevronRight,
  faArrowUpLong,
  faArrowDownLong,
  faFilter,
  faXmark,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from "../../../components/confirm_modal/ConfirmModal";

const FORMAT_ICONS = { csv: faFileCsv, pdf: faFilePdf, json: faFileCode };
const FORMAT_COLORS = { csv: 'success', pdf: 'danger', json: 'info' };

const PAGE_SIZE = 7;

const FORMAT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'csv', label: 'CSV' },
  { id: 'json', label: 'JSON' },
  { id: 'pdf', label: 'PDF' },
];

const RANGE_FILTERS = [
  { id: 'all', label: 'All time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'quarter', label: 'Last 3 months' },
];

function startOf(id) {
  const now = new Date();
  switch (id) {
    case 'today': return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week': {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case 'month': return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'quarter': return new Date(now.getFullYear(), now.getMonth() - 2, 1);
    default: return null;
  }
}

function formatRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const hasActiveFilters = (fmt, range, sort) =>
  fmt !== 'all' || range !== 'all' || sort !== 'desc';

export default function ExportHistory({ newEntry }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [formatFilter, setFormatFilter] = useState('all');
  const [rangeFilter, setRangeFilter] = useState('all');
  const [sort, setSort] = useState('desc');

  const [modal, setModal] = useState({ open: false, mode: null, targetId: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get('/export/history')
      .then((res) => setHistory(res.data))
      .catch((err) => console.error('Failed to load export history', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!newEntry) return;
    setHistory((prev) => [newEntry, ...prev].slice(0, 50));
    setPage(1);
  }, [newEntry]);

  useEffect(() => { setPage(1); }, [formatFilter, rangeFilter, sort]);

  const filtered = useMemo(() => {
    let result = [...history];
    if (formatFilter !== 'all')
      result = result.filter((e) => e.format === formatFilter);
    const since = startOf(rangeFilter);
    if (since)
      result = result.filter((e) => new Date(e.date) >= since);
    result.sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date);
      return sort === 'asc' ? diff : -diff;
    });
    return result;
  }, [history, formatFilter, rangeFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageEntries = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const clearFilters = () => {
    setFormatFilter('all');
    setRangeFilter('all');
    setSort('desc');
  };

  const active = hasActiveFilters(formatFilter, rangeFilter, sort);

  const openDeleteOne = (id) =>
    setModal({ open: true, mode: 'one', targetId: id });

  const openDeleteAll = () =>
    setModal({ open: true, mode: 'all', targetId: null });

  const closeModal = () =>
    setModal({ open: false, mode: null, targetId: null });

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      if (modal.mode === 'one') {
        await api.delete(`/export/history/${modal.targetId}`);
        setHistory((prev) => prev.filter((e) => e.id !== modal.targetId));
      } else {
        await api.delete('/export/history');
        setHistory([]);
        setPage(1);
      }
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setDeleting(false);
      closeModal();
    }
  };

  const modalConfig = modal.mode === 'all'
    ? {
      title: 'Clear all history',
      message: 'This will permanently delete all export records. This action cannot be undone.',
      confirmText: 'Clear all',
    }
    : {
      title: 'Delete export record',
      message: 'This export record will be permanently deleted.',
      confirmText: 'Delete',
    };

  return (
    <>
      <div className={styles.card}>

        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>
            <FontAwesomeIcon icon={faClockRotateLeft} />
            Recent exports
          </span>
          <div className={styles.headerActions}>
            <span className={styles.cardCount}>{filtered.length}</span>
            {history.length > 0 && (
              <button
                className={styles.deleteAllBtn}
                onClick={openDeleteAll}
                aria-label="Clear all history"
              >
                <FontAwesomeIcon icon={faTrash} />
                Clear all
              </button>
            )}
            <button
              className={`${styles.filterToggle} ${showFilters ? styles.filterToggleActive : ''}`}
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Toggle filters"
            >
              <FontAwesomeIcon icon={faFilter} />
              Filters
              {active && <span className={styles.filterDot} />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Format</span>
              <div className={styles.filterChips}>
                {FORMAT_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    className={`${styles.chip} ${formatFilter === f.id ? styles.chipActive : ''}`}
                    onClick={() => setFormatFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Period</span>
              <div className={styles.filterChips}>
                {RANGE_FILTERS.map((r) => (
                  <button
                    key={r.id}
                    className={`${styles.chip} ${rangeFilter === r.id ? styles.chipActive : ''}`}
                    onClick={() => setRangeFilter(r.id)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Sort</span>
              <div className={styles.filterChips}>
                <button
                  className={`${styles.chip} ${sort === 'desc' ? styles.chipActive : ''}`}
                  onClick={() => setSort('desc')}
                >
                  <FontAwesomeIcon icon={faArrowDownLong} />
                  Newest first
                </button>
                <button
                  className={`${styles.chip} ${sort === 'asc' ? styles.chipActive : ''}`}
                  onClick={() => setSort('asc')}
                >
                  <FontAwesomeIcon icon={faArrowUpLong} />
                  Oldest first
                </button>
              </div>
            </div>

            {active && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                <FontAwesomeIcon icon={faXmark} />
                Clear filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className={styles.empty}>
            <FontAwesomeIcon icon={faSpinner} spin className={styles.emptyIcon} />
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <FontAwesomeIcon icon={faArrowsDownToLine} className={styles.emptyIcon} />
            <p>
              {history.length === 0
                ? 'No exports yet. Configure and download your first export.'
                : 'No exports match the current filters.'}
            </p>
            {history.length > 0 && active && (
              <button className={styles.clearBtn} onClick={clearFilters}>
                <FontAwesomeIcon icon={faXmark} />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <ul className={styles.list}>
              {pageEntries.map((entry, i) => (
                <li
                  key={entry.id ?? i}
                  className={styles.item}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <span className={styles.itemIcon} data-color={FORMAT_COLORS[entry.format]}>
                    <FontAwesomeIcon icon={FORMAT_ICONS[entry.format] ?? faFileCode} />
                  </span>
                  <span className={styles.itemBody}>
                    <span className={styles.itemName}>
                      {entry.dataType}
                      <span className={styles.itemBadge}>{entry.format.toUpperCase()}</span>
                    </span>
                    <span className={styles.itemMeta}>{entry.range}</span>
                  </span>
                  <span className={styles.itemTime}>{formatRelativeTime(entry.date)}</span>
                  <button
                    className={styles.itemDeleteBtn}
                    onClick={() => openDeleteOne(entry.id)}
                    aria-label="Delete this record"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  aria-label="Previous page"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <span className={styles.pageInfo}>
                  <span className={styles.pageCurrent}>{safePage}</span>
                  <span className={styles.pageTotal}>/ {totalPages}</span>
                </span>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  aria-label="Next page"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={modal.open}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={deleting ? 'Deleting…' : modalConfig.confirmText}
        cancelText="Cancel"
      />
    </>
  );
}