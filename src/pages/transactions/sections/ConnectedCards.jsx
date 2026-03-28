import styles from './ConnectedCards.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faPlus,
  faPencil,
  faTrash,
  faLink,
  faCircleCheck,
  faSpinner,
  faRotate,
} from '@fortawesome/free-solid-svg-icons';

const MAX_CARDS = 3;

export default function ConnectedCards({
  cards,
  onAdd,
  onEdit,
  onRemove,
  onSync,
  removingId,
  syncingId,
}) {
  const slots = Array.from({ length: MAX_CARDS });

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionLeft}>
          <span className={styles.sectionIcon}>
            <FontAwesomeIcon icon={faLink} />
          </span>
          <div>
            <h2 className={styles.sectionTitle}>Connected Cards</h2>
            <p className={styles.sectionSub}>
              Transactions sync automatically when you use a connected card.
            </p>
          </div>
        </div>
        <span className={styles.cardCount}>
          {cards.length} / {MAX_CARDS} connected
        </span>
      </div>

      <div className={styles.grid}>
        {slots.map((_, i) => {
          const card = cards[i];
          const isRemoving = card && removingId === card.id;
          const isSyncing  = card && syncingId  === card.id;

          if (card) {
            return (
              <div
                key={card.id}
                className={`${styles.card} ${isRemoving ? styles.cardRemoving : ''}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className={styles.miniCard}
                  style={{
                    background: `linear-gradient(135deg, ${card.colorFrom}, ${card.colorTo})`,
                  }}
                >
                  <div className={styles.miniCardTop}>
                    <span className={styles.miniBank}>{card.bank}</span>
                    <FontAwesomeIcon icon={faCreditCard} className={styles.miniCardIcon} />
                  </div>
                  <div className={styles.miniCardNumber}>
                    <span>••••</span>
                    <span>••••</span>
                    <span>••••</span>
                    <span>{card.lastFour}</span>
                  </div>
                  <div className={styles.miniCardBottom}>
                    <span className={styles.miniHolder}>
                      {card.cardholderName?.toUpperCase() || card.bank.toUpperCase()}
                    </span>
                    <span className={styles.miniType}>{card.cardType}</span>
                  </div>
                  <div className={styles.cardShine} />
                </div>

                <div className={styles.cardInfo}>
                  <div className={styles.cardInfoRow}>
                    <span className={styles.cardName}>{card.bank}</span>
                    <span className={styles.connectedBadge}>
                      <FontAwesomeIcon icon={faCircleCheck} />
                      Active
                    </span>
                  </div>
                  <span className={styles.cardMeta}>
                    •••• {card.lastFour} · Connected{' '}
                    {new Date(card.connectedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnSync}`}
                    onClick={() => onSync(card.id)}
                    disabled={isRemoving || isSyncing}
                    aria-label="Sync transactions"
                    title={isSyncing ? 'Syncing…' : 'Sync transactions'}
                  >
                    <FontAwesomeIcon
                      icon={isSyncing ? faSpinner : faRotate}
                      spin={isSyncing}
                    />
                  </button>

                  <button
                    className={styles.actionBtn}
                    onClick={() => onEdit(card)}
                    disabled={isRemoving || isSyncing}
                    aria-label="Edit card"
                    title="Edit color"
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </button>

                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={() => onRemove(card.id)}
                    disabled={isRemoving || isSyncing}
                    aria-label="Disconnect card"
                    title="Disconnect"
                  >
                    {isRemoving
                      ? <FontAwesomeIcon icon={faSpinner} spin />
                      : <FontAwesomeIcon icon={faTrash} />
                    }
                  </button>
                </div>
              </div>
            );
          }

          return (
            <button
              key={`empty-${i}`}
              className={`${styles.emptySlot} ${
                cards.length === 0 && i > 0 ? styles.emptySlotDim : ''
              }`}
              onClick={cards.length < MAX_CARDS ? onAdd : undefined}
              disabled={cards.length >= MAX_CARDS}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={styles.emptyIcon}>
                <FontAwesomeIcon icon={faPlus} />
              </div>
              <span className={styles.emptyLabel}>
                {i === 0 && cards.length === 0
                  ? 'Connect your first card'
                  : 'Add another card'}
              </span>
              <span className={styles.emptySub}>Click to connect via Plaid</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}