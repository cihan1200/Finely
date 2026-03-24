import styles from './Hero.module.css';
import Button from "../../../components/button/Button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faPlay, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBg} />

      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Launching Phase 1 — Core tracking is live
          </div>

          <h1 className={styles.headline}>
            Your money,<br />
            <span className={styles.headlineAccent}>finally</span> clear.
          </h1>

          <p className={styles.subheadline}>
            Track income, expenses and budgets in one beautifully
            simple dashboard. No spreadsheets. No confusion.
          </p>

          <div className={styles.actions}>
            <a href="/signup">
              <Button
                variant="primary"
                size="medium"
                icon={<FontAwesomeIcon icon={faArrowRight} />}
                iconPosition="right"
              >
                Get started — it's free
              </Button>
            </a>
            <a href="#demo">
              <Button
                variant="ghost"
                size="medium"
                icon={<FontAwesomeIcon icon={faPlay} />}
                iconPosition="left"
              >
                See how it works
              </Button>
            </a>
          </div>

          <div className={styles.socialProof}>
            <div className={styles.proofItem}>
              <span className={styles.proofValue}>12k+</span>
              <span className={styles.proofLabel}>Active users</span>
            </div>
            <div className={styles.proofDivider} />
            <div className={styles.proofItem}>
              <span className={styles.proofValue}>4.9</span>
              <span className={styles.proofLabel}>Average rating</span>
            </div>
            <div className={styles.proofDivider} />
            <div className={styles.proofItem}>
              <span className={styles.proofValue}>Free</span>
              <span className={styles.proofLabel}>Forever plan</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.cardFloat}>
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  const transactions = [
    { label: 'Spotify', category: 'Entertainment', amount: '-$9.99', sign: 'expense', time: '2h ago' },
    { label: 'Salary', category: 'Income', amount: '+$4,200', sign: 'income', time: '1d ago' },
    { label: 'Netflix', category: 'Entertainment', amount: '-$15.99', sign: 'expense', time: '2d ago' },
    { label: 'Grocery Store', category: 'Food', amount: '-$63.40', sign: 'warning', time: '3d ago' },
  ];

  return (
    <div className={styles.mockup}>
      <div className={styles.mockupHeader}>
        <div className={styles.mockupDots}>
          <span /><span /><span />
        </div>
        <span className={styles.mockupTitle}>Dashboard</span>
        <span className={styles.mockupBadge}>July 2025</span>
      </div>

      <div className={styles.mockupBody}>
        <div className={styles.balanceCard}>
          <span className={styles.balanceLabel}>Total Balance</span>
          <span className={styles.balanceAmount}>$12,485.30</span>
          <div className={styles.balanceRow}>
            <div className={`${styles.balancePill} ${styles.income}`}>
              <span className={styles.pillIcon}>↑</span>
              $6,200 income
            </div>
            <div className={`${styles.balancePill} ${styles.expense}`}>
              <span className={styles.pillIcon}>↓</span>
              $1,840 spent
            </div>
          </div>
          <div className={styles.sparkline}>
            <svg viewBox="0 0 220 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.sparklineSvg}>
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 38 C20 35 35 28 55 22 C75 16 85 30 105 18 C125 6 140 24 160 14 C180 4 200 10 220 8"
                stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M0 38 C20 35 35 28 55 22 C75 16 85 30 105 18 C125 6 140 24 160 14 C180 4 200 10 220 8 L220 48 L0 48 Z"
                fill="url(#sparkGrad)" />
            </svg>
          </div>
        </div>

        <div className={styles.txSection}>
          <span className={styles.txTitle}>Recent transactions</span>
          <div className={styles.txList}>
            {transactions.map((tx, i) => (
              <div
                className={styles.txRow}
                key={i}
                style={{ animationDelay: `${0.5 + i * 0.08}s` }}
              >
                <div className={styles.txIcon} data-sign={tx.sign}>
                  <FontAwesomeIcon icon={tx.sign === 'income' ? faArrowUp : faArrowDown} />
                </div>
                <div className={styles.txMeta}>
                  <span className={styles.txLabel}>{tx.label}</span>
                  <span className={styles.txCategory}>{tx.category} · {tx.time}</span>
                </div>
                <span className={styles.txAmount} data-sign={tx.sign}>
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}