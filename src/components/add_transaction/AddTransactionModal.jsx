import { useState } from 'react';
import styles from './AddTransactionModal.module.css';
import Button from '../button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faArrowUp, faArrowDown, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const MAX_LIMIT = 999_999;

const CATEGORIES = [
  'Food', 'Entertainment', 'Transport', 'Utilities',
  'Health', 'Education', 'Clothing', 'Income', 'Other',
];

const EMPTY_FORM = {
  label: '',
  amount: '',
  sign: 'expense',
  category: 'Food',
  date: new Date().toISOString().split('T')[0],
};

export default function AddTransactionModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const close = () => {
    setIsClosing(true);
    setTimeout(onClose, 220);
  };

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.label.trim()) e.label = 'Name is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = 'Enter a valid amount';
    else if (Number(form.amount) > MAX_LIMIT)
      e.amount = `Amount cannot exceed $${MAX_LIMIT.toLocaleString()}`;
    if (!form.date) e.date = 'Date is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    setTimeout(() => {
      onAdd({
        label: form.label.trim(),
        amount: Number(Number(form.amount).toFixed(2)),
        sign: form.sign,
        category: form.sign === 'income' ? 'Income' : form.category,
        date: form.date,
      });
      setSaving(false);
      close();
    }, 500);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayOut : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`${styles.modal} ${isClosing ? styles.modalOut : ''}`}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add transaction</h2>
          <button className={styles.closeBtn} onClick={close} aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.typeToggle}>
          <button
            className={`${styles.typeBtn} ${form.sign === 'expense' ? styles.typeBtnExpense : ''}`}
            onClick={() => set('sign', 'expense')}
          >
            <FontAwesomeIcon icon={faArrowDown} />
            Expense
          </button>
          <button
            className={`${styles.typeBtn} ${form.sign === 'income' ? styles.typeBtnIncome : ''}`}
            onClick={() => set('sign', 'income')}
          >
            <FontAwesomeIcon icon={faArrowUp} />
            Income
          </button>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>Transaction name</label>
            <input
              type="text"
              className={`${styles.input} ${errors.label ? styles.inputError : ''}`}
              placeholder="e.g. Grocery Store"
              value={form.label}
              onChange={(e) => set('label', e.target.value)}
            />
            {errors.label && <span className={styles.error}>{errors.label}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Amount (max $999,999)</label>
              <input
                type="number"
                min="0"
                max={MAX_LIMIT}
                step="0.01"
                className={`${styles.input} ${errors.amount ? styles.inputError : ''}`}
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
              />
              {errors.amount && <span className={styles.error}>{errors.amount}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Date</label>
              <input
                type="date"
                className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
              {errors.date && <span className={styles.error}>{errors.date}</span>}
            </div>
          </div>

          {form.sign === 'expense' && (
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <div className={styles.selectWrapper}>
                <select
                  className={`${styles.input} ${styles.select}`}
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                >
                  {CATEGORIES.filter((c) => c !== 'Income').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className={styles.selectIcon}>
                  <FontAwesomeIcon icon={faChevronDown} />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <Button variant="secondary" size="medium" onClick={close}>
            Cancel
          </Button>
          <Button
            variant={form.sign === 'income' ? 'primary' : 'danger'}
            size="medium"
            saving={saving}
            onClick={handleSubmit}
          >
            {saving ? 'Saving...' : `Add ${form.sign}`}
          </Button>
        </div>
      </div>
    </div>
  );
}