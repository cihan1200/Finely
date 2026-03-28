import { useState, useEffect } from 'react';
import styles from './AddCardModal.module.css';
import Button from '../button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faCreditCard,
  faShieldHalved,
  faSpinner,
  faCheckCircle,
  faBank,
} from '@fortawesome/free-solid-svg-icons';

const CARD_COLORS = [
  { id: 'slate',   label: 'Slate',   from: '#334155', to: '#1e293b' },
  { id: 'indigo',  label: 'Indigo',  from: '#4f46e5', to: '#3730a3' },
  { id: 'emerald', label: 'Emerald', from: '#059669', to: '#065f46' },
  { id: 'rose',    label: 'Rose',    from: '#e11d48', to: '#9f1239' },
  { id: 'amber',   label: 'Amber',   from: '#d97706', to: '#92400e' },
  { id: 'violet',  label: 'Violet',  from: '#7c3aed', to: '#4c1d95' },
];

export default function AddCardModal({
  isOpen,
  onClose,
  onConnect,
  onUpdate,
  editCard = null,
  saving = false,
  openPlaidLink,
  plaidReady,
  tokenLoading,
  tokenError,
  pendingPlaidResult,
}) {
  const isEdit = !!editCard;

  const [selectedColor, setSelectedColor] = useState(
    CARD_COLORS.find((c) => c.id === (editCard?.color ?? 'slate'))
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedColor(
        CARD_COLORS.find((c) => c.id === (editCard?.color ?? 'slate'))
      );
    }
  }, [isOpen, editCard]);

  const step = (isEdit || pendingPlaidResult) ? 'customize' : 'connect';

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (saving) return;
    if (isEdit) {
      onUpdate({
        cardId:    editCard.id,
        color:     selectedColor.id,
        colorFrom: selectedColor.from,
        colorTo:   selectedColor.to,
      });
    } else {
      onConnect({
        publicToken: pendingPlaidResult.publicToken,
        metadata:    pendingPlaidResult.metadata,
        color:       selectedColor.id,
        colorFrom:   selectedColor.from,
        colorTo:     selectedColor.to,
      });
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !saving) onClose();
  };

  const previewBank  = isEdit ? editCard.bank  : (pendingPlaidResult?.metadata?.institution?.name ?? '—');
  const previewLast4 = isEdit ? editCard.lastFour : (pendingPlaidResult?.metadata?.accounts?.[0]?.mask ?? '—');
  const previewName  = isEdit ? editCard.cardholderName : (pendingPlaidResult?.metadata?.institution?.name ?? '—');
  const previewType  = isEdit ? editCard.cardType : (pendingPlaidResult?.metadata?.accounts?.[0]?.subtype ?? '—');

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEdit ? 'Customize card' : step === 'connect' ? 'Connect a card' : 'Customize your card'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={saving} aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {step === 'connect' && (
          <div className={styles.connectStep}>
            <div className={styles.plaidHero}>
              <div className={styles.plaidIconRing}>
                <FontAwesomeIcon icon={faBank} className={styles.plaidIcon} />
              </div>
              <h3 className={styles.plaidHeroTitle}>Securely link your bank</h3>
              <p className={styles.plaidHeroSub}>
                We use <strong>Plaid</strong> to connect to your bank. Your credentials
                are never stored by us — Plaid handles all authentication directly
                with your financial institution.
              </p>
            </div>

            <div className={styles.trustPoints}>
              <div className={styles.trustPoint}>
                <FontAwesomeIcon icon={faShieldHalved} className={styles.trustIcon} />
                <span>Bank-level 256-bit encryption</span>
              </div>
              <div className={styles.trustPoint}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.trustIcon} />
                <span>Read-only access — we can never move money</span>
              </div>
              <div className={styles.trustPoint}>
                <FontAwesomeIcon icon={faCreditCard} className={styles.trustIcon} />
                <span>Disconnect any time from this page</span>
              </div>
            </div>

            {tokenError && <p className={styles.errorBanner}>{tokenError}</p>}

            <Button
              variant="primary"
              size="medium"
              onClick={() => openPlaidLink()}
              disabled={!plaidReady || tokenLoading || !!tokenError}
              icon={tokenLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : null}
              iconPosition="left"
            >
              {tokenLoading ? 'Initializing…' : 'Continue with Plaid'}
            </Button>

            <p className={styles.plaidNote}>
              Powered by Plaid — trusted by millions of people to connect their finances.
            </p>
          </div>
        )}

        {step === 'customize' && (
          <>
            <div
              className={styles.cardPreview}
              style={{ background: `linear-gradient(135deg, ${selectedColor.from}, ${selectedColor.to})` }}
            >
              <div className={styles.cardPreviewTop}>
                <span className={styles.cardBank}>{previewBank}</span>
                <FontAwesomeIcon icon={faCreditCard} className={styles.cardChipIcon} />
              </div>
              <div className={styles.cardNumber}>
                <span>••••</span><span>••••</span><span>••••</span>
                <span>{previewLast4}</span>
              </div>
              <div className={styles.cardPreviewBottom}>
                <div className={styles.cardHolder}>
                  <span className={styles.cardHolderLabel}>Account</span>
                  <span className={styles.cardHolderName}>{previewName}</span>
                </div>
                <span className={styles.cardType}>{previewType}</span>
              </div>
              <div className={styles.cardShine} />
            </div>

            <div className={styles.colorSection}>
              <span className={styles.colorLabel}>Card color</span>
              <div className={styles.colorOptions}>
                {CARD_COLORS.map((c) => (
                  <button
                    key={c.id}
                    className={`${styles.colorDot} ${selectedColor.id === c.id ? styles.colorDotActive : ''}`}
                    style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                    onClick={() => setSelectedColor(c)}
                    title={c.label}
                    aria-label={c.label}
                    disabled={saving}
                  />
                ))}
              </div>
            </div>

            {!isEdit && (
              <p className={styles.syncNote}>
                Your recent transactions will be imported automatically after connecting.
              </p>
            )}

            <div className={styles.modalFooter}>
              <Button variant="secondary" size="medium" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="medium" saving={saving} onClick={handleSubmit} disabled={saving}>
                {saving
                  ? isEdit ? 'Saving…' : 'Connecting…'
                  : isEdit ? 'Save changes' : 'Connect card'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}