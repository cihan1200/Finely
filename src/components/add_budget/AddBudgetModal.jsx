import { useState } from 'react';
import styles from './AddBudgetModal.module.css';
import Button from '../button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils, faFilm, faCar, faBolt, faHeartPulse,
  faShirt, faBook, faRotate, faTag, faXmark,
} from '@fortawesome/free-solid-svg-icons';

const CATEGORY_OPTIONS = [
  { label: 'Food & dining', value: 'Food & dining', icon: 'utensils', color: 'warning' },
  { label: 'Entertainment', value: 'Entertainment', icon: 'film', color: 'primary' },
  { label: 'Transport', value: 'Transport', icon: 'car', color: 'info' },
  { label: 'Utilities', value: 'Utilities', icon: 'bolt', color: 'info' },
  { label: 'Health', value: 'Health', icon: 'heart-pulse', color: 'success' },
  { label: 'Clothing', value: 'Clothing', icon: 'shirt', color: 'danger' },
  { label: 'Education', value: 'Education', icon: 'book', color: 'primary' },
  { label: 'Subscriptions', value: 'Subscriptions', icon: 'rotate', color: 'warning' },
  { label: 'Other', value: 'Other', icon: 'tag', color: 'primary' },
];

const ICON_MAP = {
  utensils: faUtensils, film: faFilm, car: faCar, bolt: faBolt,
  'heart-pulse': faHeartPulse, shirt: faShirt, book: faBook, rotate: faRotate, tag: faTag,
};

const EMPTY_FORM = { label: '', icon: 'tag', color: 'primary', limit: '' };

export default function AddBudgetModal({ onClose, onAdd }) {
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

  const selectCategory = (cat) => {
    setForm((prev) => ({ ...prev, label: cat.label, icon: cat.icon, color: cat.color }));
    setErrors((prev) => ({ ...prev, label: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.label) e.label = 'Select a category';
    if (!form.limit || isNaN(Number(form.limit)) || Number(form.limit) <= 0)
      e.limit = 'Enter a valid limit';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    setTimeout(() => {
      onAdd({ label: form.label, icon: form.icon, color: form.color, limit: Number(Number(form.limit).toFixed(2)) });
      setSaving(false);
      close();
    }, 500);
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
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  className={`${styles.catBtn} ${form.label === cat.label ? styles.catBtnActive : ''}`}
                  onClick={() => selectCategory(cat)}
                  data-color={cat.color}
                >
                  <FontAwesomeIcon icon={ICON_MAP[cat.icon]} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
            {errors.label && <span className={styles.error}>{errors.label}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Monthly limit ($)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              className={`${styles.input} ${errors.limit ? styles.inputError : ''}`}
              placeholder="e.g. 300"
              value={form.limit}
              onChange={(e) => set('limit', e.target.value)}
            />
            {errors.limit && <span className={styles.error}>{errors.limit}</span>}
          </div>
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