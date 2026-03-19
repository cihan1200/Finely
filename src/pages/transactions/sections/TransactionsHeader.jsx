import styles from './TransactionsHeader.module.css';
import Button from '../../../components/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileExport } from '@fortawesome/free-solid-svg-icons';

export default function TransactionsHeader({ onAdd }) {
  const handleExport = () => {
    alert('CSV export coming soon!');
  };

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
          icon={<FontAwesomeIcon icon={faFileExport} />}
          iconPosition="left"
          onClick={handleExport}
        >
          Export CSV
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