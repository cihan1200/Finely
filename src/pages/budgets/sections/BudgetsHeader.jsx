import styles from './BudgetsHeader.module.css';
import Button from '../../../components/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export default function BudgetsHeader({ onAdd, disableAdd }) {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>Budgets</h1>
        <p className={styles.subtitle}>Set monthly limits and track your spending.</p>
      </div>
      <Button
        variant="primary"
        size="medium"
        icon={<FontAwesomeIcon icon={faPlus} />}
        iconPosition="left"
        onClick={onAdd}
        disabled={disableAdd}
      >
        New budget
      </Button>
    </div>
  );
}