import styles from './TransactionsSummary.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faArrowRightArrowLeft,
  faScaleBalanced,
} from '@fortawesome/free-solid-svg-icons';

export default function TransactionsSummary({ transactions }) {
  const income = transactions
    .filter((tx) => tx.sign === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenses = transactions
    .filter((tx) => tx.sign === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const net = income - expenses;
  const count = transactions.length;

  const fmt = (n) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function formatMoney(n) {
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(1)}T`;
    if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (abs >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const CARDS = [
    {
      label: 'Total income',
      value: formatMoney(income),
      icon: faArrowTrendUp,
      color: 'success',
    },
    {
      label: 'Total expenses',
      value: formatMoney(expenses),
      icon: faArrowTrendDown,
      color: 'danger',
    },
    {
      label: 'Net balance',
      value: `${net >= 0 ? '+' : '-'}${formatMoney(Math.abs(net))}`,
      icon: faScaleBalanced,
      color: net >= 0 ? 'success' : 'danger',
    },
    {
      label: 'Transactions',
      value: count.toString(),
      icon: faArrowRightArrowLeft,
      color: 'primary',
    },
  ];

  return (
    <div className={styles.grid}>
      {CARDS.map((card, i) => (
        <div
          key={card.label}
          className={styles.card}
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          <div className={styles.cardTop}>
            <span className={styles.label}>{card.label}</span>
            <span className={styles.icon} data-color={card.color}>
              <FontAwesomeIcon icon={card.icon} />
            </span>
          </div>
          <span className={styles.value} data-color={card.color === 'success' || card.color === 'danger' ? card.color : undefined}>
            {card.value}
          </span>
        </div>
      ))}
    </div>
  );
}