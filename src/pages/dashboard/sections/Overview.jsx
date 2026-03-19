import styles from './Overview.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faArrowTrendUp,
  faArrowTrendDown,
  faCircleHalfStroke,
} from '@fortawesome/free-solid-svg-icons';

const CARDS = [
  {
    label: 'Total balance',
    value: '$12,485.30',
    change: '+8.2%',
    changeLabel: 'vs last month',
    positive: true,
    icon: faWallet,
    color: 'primary',
  },
  {
    label: 'Total income',
    value: '$6,200.00',
    change: '+12.5%',
    changeLabel: 'vs last month',
    positive: true,
    icon: faArrowTrendUp,
    color: 'success',
  },
  {
    label: 'Total expenses',
    value: '$1,840.20',
    change: '-3.1%',
    changeLabel: 'vs last month',
    positive: false,
    icon: faArrowTrendDown,
    color: 'danger',
  },
  {
    label: 'Savings rate',
    value: '70.3%',
    change: '+4.8%',
    changeLabel: 'vs last month',
    positive: true,
    icon: faCircleHalfStroke,
    color: 'info',
  },
];

export default function Overview() {
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
            <span
              className={styles.change}
              data-positive={card.positive}
            >
              {card.change}
            </span>
            <span className={styles.changeLabel}>{card.changeLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}