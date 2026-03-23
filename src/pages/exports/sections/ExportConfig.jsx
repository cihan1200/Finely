import { useState } from 'react';
import styles from './ExportConfig.module.css';
import api from '../../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileCsv,
  faFilePdf,
  faFileCode,
  faArrowRightArrowLeft,
  faBullseye,
  faChartPie,
  faLayerGroup,
  faDownload,
  faSpinner,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';

const FORMAT_OPTIONS = [
  {
    id: 'csv',
    label: 'CSV',
    description: 'Excel & Google Sheets compatible',
    icon: faFileCsv,
    color: 'success',
  },
  {
    id: 'json',
    label: 'JSON',
    description: 'For developers & integrations',
    icon: faFileCode,
    color: 'info',
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Printable summary report',
    icon: faFilePdf,
    color: 'danger',
  },
];

const DATA_OPTIONS = [
  { id: 'transactions', label: 'Transactions', icon: faArrowRightArrowLeft },
  { id: 'budgets', label: 'Budgets', icon: faBullseye },
  { id: 'analytics', label: 'Analytics', icon: faChartPie },
  { id: 'all', label: 'Everything', icon: faLayerGroup },
];

const RANGE_OPTIONS = [
  { id: 'this_month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'last_3', label: 'Last 3 months' },
  { id: 'last_6', label: 'Last 6 months' },
  { id: 'this_year', label: 'This year' },
  { id: 'custom', label: 'Custom range' },
];

function getRangeLabel(rangeId) {
  return RANGE_OPTIONS.find((r) => r.id === rangeId)?.label ?? rangeId;
}

export default function ExportConfig({ onExported }) {
  const [format, setFormat] = useState('csv');
  const [dataType, setDataType] = useState('transactions');
  const [range, setRange] = useState('this_month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    if (range === 'custom' && (!customFrom || !customTo)) {
      setError('Please select both a start and end date.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const params = { format, dataType, range };
      if (range === 'custom') {
        params.from = customFrom;
        params.to = customTo;
      }

      const res = await api.get('/export', {
        params,
        responseType: format === 'pdf' ? 'blob' : 'blob',
      });

      const mimeTypes = {
        csv: 'text/csv',
        json: 'application/json',
        pdf: 'application/pdf',
      };

      const blob = new Blob([res.data], { type: mimeTypes[format] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateLabel = range === 'custom'
        ? `${customFrom}_${customTo}`
        : range;

      a.href = url;
      a.download = `finely_${dataType}_${dateLabel}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      onExported?.({ format, dataType, range: getRangeLabel(range), date: new Date().toISOString() });
    } catch (err) {
      setError(err.response?.data?.message || 'Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What to export</h2>
        <div className={styles.dataGrid}>
          {DATA_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`${styles.dataBtn} ${dataType === opt.id ? styles.dataBtnActive : ''}`}
              onClick={() => setDataType(opt.id)}
            >
              <span className={styles.dataBtnIcon}>
                <FontAwesomeIcon icon={opt.icon} />
              </span>
              <span className={styles.dataBtnLabel}>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>File format</h2>
        <div className={styles.formatGrid}>
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`${styles.formatBtn} ${format === opt.id ? styles.formatBtnActive : ''}`}
              onClick={() => setFormat(opt.id)}
            >
              <span className={styles.formatIcon} data-color={opt.color}>
                <FontAwesomeIcon icon={opt.icon} />
              </span>
              <span className={styles.formatLabel}>{opt.label}</span>
              <span className={styles.formatDesc}>{opt.description}</span>
              <span className={`${styles.formatRadio} ${format === opt.id ? styles.formatRadioActive : ''}`} />
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Date range</h2>
        <div className={styles.rangeGrid}>
          {RANGE_OPTIONS.filter((r) => r.id !== 'custom').map((opt) => (
            <button
              key={opt.id}
              className={`${styles.rangeBtn} ${range === opt.id ? styles.rangeBtnActive : ''}`}
              onClick={() => setRange(opt.id)}
            >
              {opt.label}
            </button>
          ))}
          <button
            className={`${styles.rangeBtn} ${range === 'custom' ? styles.rangeBtnActive : ''}`}
            onClick={() => setRange('custom')}
          >
            <FontAwesomeIcon icon={faCalendar} />
            Custom
          </button>
        </div>

        {range === 'custom' && (
          <div className={styles.customRange}>
            <div className={styles.dateGroup}>
              <label className={styles.dateLabel}>From</label>
              <input
                type="date"
                className={styles.dateInput}
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div className={styles.dateSep}>→</div>
            <div className={styles.dateGroup}>
              <label className={styles.dateLabel}>To</label>
              <input
                type="date"
                className={styles.dateInput}
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      <div className={styles.footer}>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Exporting</span>
            <span className={styles.summaryVal}>
              {DATA_OPTIONS.find((d) => d.id === dataType)?.label}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Format</span>
            <span className={styles.summaryVal}>{format.toUpperCase()}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Period</span>
            <span className={styles.summaryVal}>
              {range === 'custom' && customFrom && customTo
                ? `${customFrom} → ${customTo}`
                : getRangeLabel(range)}
            </span>
          </div>
        </div>

        <button
          className={styles.exportBtn}
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              Exporting…
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faDownload} />
              Download {format.toUpperCase()}
            </>
          )}
        </button>
      </div>
    </div>
  );
}