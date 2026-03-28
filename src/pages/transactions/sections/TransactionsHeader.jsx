import styles from './TransactionsHeader.module.css';
import Button from '../../../components/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faLink } from '@fortawesome/free-solid-svg-icons';

export default function TransactionsHeader({ onAdd, onConnectCard, connectedCardCount }) {
  const MAX_CARDS = 3;
  const canConnectMore = connectedCardCount < MAX_CARDS;

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle}>Manage and track all your income and expenses.</p>
      </div>
      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="medium"
          icon={<FontAwesomeIcon icon={faLink} />}
          iconPosition="left"
          onClick={onConnectCard}
          disabled={!canConnectMore}
          title={!canConnectMore ? `Maximum ${MAX_CARDS} cards allowed` : 'Connect a credit card'}
        >
          Connect card
          {connectedCardCount > 0 && (
            <span className={styles.cardBadge}>{connectedCardCount}/{MAX_CARDS}</span>
          )}
        </Button>
        <Button
          variant="primary"
          size="medium"
          icon={<FontAwesomeIcon icon={faPlus} />}
          iconPosition="left"
          onClick={onAdd}
        >
          Add transaction
        </Button>
      </div>
    </div>
  );
}