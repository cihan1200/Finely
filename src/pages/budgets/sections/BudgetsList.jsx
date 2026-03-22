import { useState } from 'react';
import styles from './BudgetsList.module.css';
import ConfirmModal from "../../../components/confirm_modal/ConfirmModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils, faFilm, faCar, faBolt, faHeartPulse,
  faShirt, faBook, faRotate, faTag,
  faTrash, faPencil, faCheck, faXmark,
  faTriangleExclamation, faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';

const ICON_MAP = {
  utensils: faUtensils,
  film: faFilm,
  car: faCar,
  bolt: faBolt,
  'heart-pulse': faHeartPulse,
  shirt: faShirt,
  book: faBook,
  rotate: faRotate,
  tag: faTag,
};

const getIcon = (name) => ICON_MAP[name] ?? faTag;

function BudgetCard({ budget, onDeleteRequest, onUpdateLimit, deleting }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(budget.limit.toString());

  const pct = Math.min((budget.spent / budget.limit) * 100, 100);
  const over = budget.spent > budget.limit;
  const remaining = budget.limit - budget.spent;
  const safeRate = Math.round((budget.spent / budget.limit) * 100);

  const saveEdit = () => {
    const val = Number(draft);
    if (!isNaN(val) && val > 0) {
      onUpdateLimit(budget.id, val);
    } else {
      setDraft(budget.limit.toString());
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(budget.limit.toString());
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  return (
    <div className={`${styles.card} ${deleting ? styles.cardDeleting : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardLeft}>
          <span className={styles.catIcon} data-color={over ? 'danger' : budget.color}>
            <FontAwesomeIcon icon={getIcon(budget.icon)} />
          </span>
          <div className={styles.cardMeta}>
            <span className={styles.cardLabel}>{budget.label}</span>
            <span className={styles.cardStatus} data-over={over}>
              <FontAwesomeIcon icon={over ? faTriangleExclamation : faCircleCheck} />
              {over ? `$${(budget.spent - budget.limit).toFixed(0)} over` : 'On track'}
            </span>
          </div>
        </div>
        <div className={styles.cardActions}>
          <button className={styles.actionBtn} onClick={() => setEditing(true)} aria-label="Edit limit">
            <FontAwesomeIcon icon={faPencil} />
          </button>
          <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={() => onDeleteRequest(budget)} aria-label="Delete budget">
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      <div className={styles.amounts}>
        <div className={styles.amountSpent}>
          <span className={styles.amountLabel}>Spent</span>
          <span className={styles.amountValue} data-over={over}>
            ${budget.spent.toFixed(0)}
          </span>
        </div>

        <div className={styles.amountLimit}>
          <span className={styles.amountLabel}>Limit</span>
          {editing ? (
            <div className={styles.editRow}>
              <span className={styles.editPrefix}>$</span>
              <input
                autoFocus
                type="number"
                min="1"
                className={styles.editInput}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className={styles.editBtn} onClick={saveEdit}>
                <FontAwesomeIcon icon={faCheck} />
              </button>
              <button className={styles.editBtnCancel} onClick={cancelEdit}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          ) : (
            <span className={styles.amountValue}>${budget.limit.toFixed(0)}</span>
          )}
        </div>

        <div className={styles.amountRemaining}>
          <span className={styles.amountLabel}>{over ? 'Over by' : 'Remaining'}</span>
          <span className={styles.amountValue} data-over={over}>
            ${Math.abs(remaining).toFixed(0)}
          </span>
        </div>
      </div>

      <div className={styles.progressArea}>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            data-color={over ? 'danger' : budget.color}
            style={{ width: `${pct}%` }}
          />
          {!over && (
            <div
              className={styles.progressGhost}
              style={{ left: `${pct}%`, width: `${100 - pct}%` }}
            />
          )}
        </div>
        <span className={styles.progressPct} data-over={over}>{safeRate}%</span>
      </div>
    </div>
  );
}

export default function BudgetsList({ budgets, onDelete, onUpdateLimit }) {
  const [pendingDelete, setPendingDelete] = useState(null);

  const overBudgets = budgets.filter((b) => b.spent > b.limit);
  const okBudgets = budgets.filter((b) => b.spent <= b.limit);

  const handleDeleteRequest = (budget) => setPendingDelete(budget);

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    onDelete(pendingDelete.id);
    setPendingDelete(null);
  };

  const handleCancelDelete = () => setPendingDelete(null);

  return (
    <>
      <div className={styles.wrapper}>
        {overBudgets.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel} data-type="over">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                Over budget ({overBudgets.length})
              </span>
            </div>
            <div className={styles.grid}>
              {overBudgets.map((b, i) => (
                <div key={b.id} style={{ animationDelay: `${i * 0.07}s` }}>
                  <BudgetCard
                    budget={b}
                    onDeleteRequest={handleDeleteRequest}
                    onUpdateLimit={onUpdateLimit}
                    deleting={pendingDelete?.id === b.id}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel} data-type="ok">
              <FontAwesomeIcon icon={faCircleCheck} />
              On track ({okBudgets.length})
            </span>
          </div>
          <div className={styles.grid}>
            {okBudgets.map((b, i) => (
              <div key={b.id} style={{ animationDelay: `${i * 0.07}s` }}>
                <BudgetCard
                  budget={b}
                  onDeleteRequest={handleDeleteRequest}
                  onUpdateLimit={onUpdateLimit}
                  deleting={pendingDelete?.id === b.id}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!pendingDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete budget"
        message={`Are you sure you want to delete the "${pendingDelete?.label}" budget? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}