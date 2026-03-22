import { useState, useEffect } from 'react';
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
} from '@fortawesome/free-solid-svg-icons';

const FORMAT_ICONS = {
  csv: faFileCsv,
  pdf: faFilePdf,
  json: faFileCode,
};

const FORMAT_COLORS = {
  csv: 'success',
  pdf: 'danger',
  json: 'info',
};

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

export default function ExportHistory({ newEntry }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/export/history')
      .then((res) => setHistory(res.data))
      .catch((err) => console.error('Failed to load export history', err))
      .finally(() => setLoading(false));
  }, []);

  // Prepend the latest export immediately when the parent signals a new one,
  // without waiting for a refetch.
  useEffect(() => {
    if (!newEntry) return;
    setHistory((prev) => [newEntry, ...prev].slice(0, 50));
  }, [newEntry]);

  const entries = history;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>
          <FontAwesomeIcon icon={faClockRotateLeft} />
          Recent exports
        </span>
        <span className={styles.cardCount}>{entries.length}</span>
      </div>

      {loading ? (
        <div className={styles.empty}>
          <FontAwesomeIcon icon={faSpinner} spin className={styles.emptyIcon} />
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.empty}>
          <FontAwesomeIcon icon={faArrowsDownToLine} className={styles.emptyIcon} />
          <p>No exports yet. Configure and download your first export.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {entries.map((entry, i) => (
            <li
              key={entry.id ?? i}
              className={styles.item}
              style={{ animationDelay: `${i * 0.05}s` }}
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}