import styles from './BudgetsSummary.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faCircleCheck,
  faTriangleExclamation,
  faChartPie,
} from '@fortawesome/free-solid-svg-icons';

function formatMoney(n) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(1)}T`;
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function BudgetsSummary({ budgets }) {
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overCount = budgets.filter((b) => b.spent > b.limit).length;
  const onTrack = budgets.filter((b) => b.spent <= b.limit).length;
  const overallPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const remaining = totalLimit - totalSpent;

  const CARDS = [
    {
      label: 'Total budget',
      value: formatMoney(totalLimit),
      sub: 'across all categories',
      icon: faBullseye,
      color: 'primary',
    },
    {
      label: 'Total spent',
      value: formatMoney(totalSpent),
      sub: `${overallPct}% of total budget`,
      icon: faChartPie,
      color: overallPct >= 90 ? 'danger' : overallPct >= 70 ? 'warning' : 'success',
    },
    {
      label: 'On track',
      value: `${onTrack} of ${budgets.length}`,
      sub: 'categories within limit',
      icon: faCircleCheck,
      color: 'success',
    },
    {
      label: overCount > 0 ? 'Over budget' : 'Remaining',
      value: overCount > 0 ? `${overCount} categor${overCount === 1 ? 'y' : 'ies'}` : formatMoney(remaining),
      sub: overCount > 0 ? 'exceeded their limit' : 'left to spend',
      icon: faTriangleExclamation,
      color: overCount > 0 ? 'danger' : 'info',
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
          <span className={styles.value}>{card.value}</span>
          <span className={styles.sub}>{card.sub}</span>
        </div>
      ))}
    </div>
  );
}