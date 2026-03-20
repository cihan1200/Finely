import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './ConfirmModal.module.css';
import Button from '../button/Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
}) {
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setIsRendered(true);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setIsRendered(false);
  };

  if (!isRendered) return null;

  const overlayClass = isOpen ? styles.overlay : `${styles.overlay} ${styles.overlayClosing}`;
  const modalClass = isOpen ? styles.modal : `${styles.modal} ${styles.modalClosing}`;

  return (
    <div className={overlayClass} onClick={onClose} onAnimationEnd={handleAnimationEnd}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <h2 className={styles.title}>{title}</h2>
        </div>

        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} fullWidth>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} fullWidth>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}