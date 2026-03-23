import { useState } from 'react';
import styles from './AddBudgetModal.module.css';
import Button from '../button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils, faFilm, faCar, faBolt, faHeartPulse,
  faShirt, faBook, faRotate, faTag, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import api from '../../utils/api';

const MAX_LIMIT = 999_999;

const CATEGORY_OPTIONS = [
  { label: 'Food & dining', category: 'Food', icon: 'utensils', color: 'warning' },
  { label: 'Entertainment', category: 'Entertainment', icon: 'film', color: 'primary' },
  { label: 'Transport', category: 'Transport', icon: 'car', color: 'info' },
  { label: 'Utilities', category: 'Utilities', icon: 'bolt', color: 'info' },
  { label: 'Health', category: 'Health', icon: 'heart-pulse', color: 'success' },
  { label: 'Clothing', category: 'Clothing', icon: 'shirt', color: 'danger' },
  { label: 'Education', category: 'Education', icon: 'book', color: 'primary' },
  { label: 'Subscriptions', category: 'Subscriptions', icon: 'rotate', color: 'warning' },
  { label: 'Other', category: 'Other', icon: 'tag', color: 'primary' },
];

const ICON_MAP = {
  utensils: faUtensils, film: faFilm, car: faCar, bolt: faBolt,
  'heart-pulse': faHeartPulse, shirt: faShirt, book: faBook, rotate: faRotate, tag: faTag,
};

const EMPTY_FORM = { label: '', category: '', icon: 'tag', color: 'primary', limit: '' };

export default function AddBudgetModal({ onClose, onAdd, existingCategories = [] }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [serverError, setServerError] = useState('');

  const close = () => {
    setIsClosing(true);
    setTimeout(onClose, 220);
  };

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError('');
  };

  const selectCategory = (cat) => {
    setForm((prev) => ({ ...prev, label: cat.label, category: cat.category, icon: cat.icon, color: cat.color }));
    setErrors((prev) => ({ ...prev, label: undefined }));
    setServerError('');
  };

  const validate = () => {
    const e = {};
    if (!form.label) e.label = 'Select a category';
    if (!form.limit || isNaN(Number(form.limit)) || Number(form.limit) <= 0)
      e.limit = 'Enter a valid limit';
    else if (Number(form.limit) > MAX_LIMIT)
      e.limit = `Limit cannot exceed $${MAX_LIMIT.toLocaleString()}`;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    try {
      const res = await api.post('/budget', {
        label: form.label,
        category: form.category,
        icon: form.icon,
        color: form.color,
        limit: Number(Number(form.limit).toFixed(2)),
      });
      onAdd(res.data);
      close();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create budget';
      setServerError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <div className={`${styles.overlay} ${isClosing ? styles.overlayOut : ''}`} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${isClosing ? styles.modalOut : ''}`}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>New budget</h2>
          <button className={styles.closeBtn} onClick={close} aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <div className={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map((cat) => {
                const alreadyExists = existingCategories.includes(cat.category);
                return (
                  <button
                    key={cat.category}
                    className={`${styles.catBtn} ${form.category === cat.category ? styles.catBtnActive : ''} ${alreadyExists ? styles.catBtnDisabled : ''}`}
                    onClick={() => !alreadyExists && selectCategory(cat)}
                    data-color={cat.color}
                    disabled={alreadyExists}
                    title={alreadyExists ? 'Budget already exists for this category' : ''}
                  >
                    <FontAwesomeIcon icon={ICON_MAP[cat.icon]} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.label && <span className={styles.error}>{errors.label}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Monthly limit (max $999,999)</label>
            <input
              type="number"
              min="1"
              max={MAX_LIMIT}
              step="0.01"
              className={`${styles.input} ${errors.limit ? styles.inputError : ''}`}
              placeholder="e.g. 300"
              value={form.limit}
              onChange={(e) => set('limit', e.target.value)}
            />
            {errors.limit && <span className={styles.error}>{errors.limit}</span>}
          </div>

          {serverError && <span className={styles.error}>{serverError}</span>}
        </div>

        <div className={styles.modalFooter}>
          <Button variant="secondary" size="medium" onClick={close}>Cancel</Button>
          <Button variant="primary" size="medium" saving={saving} onClick={handleSubmit}>
            {saving ? 'Saving...' : 'Create budget'}
          </Button>
        </div>
      </div>
    </div>
  );
}