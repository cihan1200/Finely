import styles from './AnalyticsSummary.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faPercent,
  faPiggyBank,
} from '@fortawesome/free-solid-svg-icons';

const CARDS = [
  {
    label: 'Avg. monthly income',
    value: '$5,341',
    delta: '+11.4%',
    positive: true,
    icon: faArrowTrendUp,
    color: 'success',
    sub: 'vs previous period',
  },
  {
    label: 'Avg. monthly expenses',
    value: '$2,064',
    delta: '-6.2%',
    positive: true,
    icon: faArrowTrendDown,
    color: 'danger',
    sub: 'vs previous period',
  },
  {
    label: 'Avg. savings rate',
    value: '61.3%',
    delta: '+5.1%',
    positive: true,
    icon: faPercent,
    color: 'primary',
    sub: 'of income saved',
  },
  {
    label: 'Total saved',
    value: '$19,662',
    delta: '+$2,140',
    positive: true,
    icon: faPiggyBank,
    color: 'info',
    sub: 'over 6 months',
  },
];

export default function AnalyticsSummary() {
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
          <div className={styles.cardBottom}>
            <span className={styles.delta} data-positive={card.positive}>
              {card.delta}
            </span>
            <span className={styles.sub}>{card.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}