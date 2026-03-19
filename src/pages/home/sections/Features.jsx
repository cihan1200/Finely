import { useEffect, useRef } from 'react';
import styles from './Features.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faListCheck,
  faChartPie,
  faBell,
  faTag,
  faFileExport,
  faArrowUp,
  faArrowDown,
  faExclamation
} from '@fortawesome/free-solid-svg-icons';

export default function Features() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('[data-animate]');
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="features" ref={sectionRef}>
      <div className={styles.sectionBg} />

      <div className={styles.inner}>
        <div className={styles.header} data-animate>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Everything you need
          </div>
          <h2 className={styles.headline}>
            Built for people who want<br />
            <span className={styles.headlineAccent}>clarity, not complexity.</span>
          </h2>
          <p className={styles.subheadline}>
            Every feature is designed to stay out of your way and let the numbers speak.
          </p>
        </div>

        <div className={styles.bento}>
          <div className={`${styles.card} ${styles.cardLarge}`} data-animate style={{ '--delay': '0s' }}>
            <div className={styles.cardBody}>
              <div className={styles.cardIcon}>
                <FontAwesomeIcon icon={faListCheck} />
              </div>
              <h3 className={styles.cardLabel}>Transaction tracking</h3>
              <p className={styles.cardDescription}>Log every income and expense in seconds. Filter, search and edit with ease.</p>
            </div>
            <div className={styles.cardVisual}>
              <TransactionVisual />
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardMedium}`} data-animate style={{ '--delay': '0.07s' }}>
            <div className={styles.cardBody}>
              <div className={styles.cardIcon}>
                <FontAwesomeIcon icon={faChartPie} />
              </div>
              <h3 className={styles.cardLabel}>Spending breakdown</h3>
              <p className={styles.cardDescription}>See exactly where your money goes with live category charts.</p>
            </div>
            <div className={styles.cardVisual}>
              <ChartVisual />
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardMedium}`} data-animate style={{ '--delay': '0.14s' }}>
            <div className={styles.cardBody}>
              <div className={styles.cardIcon} data-warning>
                <FontAwesomeIcon icon={faBell} />
              </div>
              <h3 className={styles.cardLabel}>Budget alerts</h3>
              <p className={styles.cardDescription}>Set monthly limits per category and get warned before you overspend.</p>
            </div>
            <div className={styles.cardVisual}>
              <BudgetVisual />
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardSmall}`} data-animate style={{ '--delay': '0.21s' }}>
            <div className={styles.cardBody}>
              <div className={styles.cardIcon}>
                <FontAwesomeIcon icon={faTag} />
              </div>
              <h3 className={styles.cardLabel}>Smart categories</h3>
              <p className={styles.cardDescription}>Organise spending with colour-coded tags.</p>
            </div>
            <div className={styles.cardVisual}>
              <CategoriesVisual />
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardSmall}`} data-animate style={{ '--delay': '0.28s' }}>
            <div className={styles.cardBody}>
              <div className={styles.cardIcon}>
                <FontAwesomeIcon icon={faFileExport} />
              </div>
              <h3 className={styles.cardLabel}>CSV export</h3>
              <p className={styles.cardDescription}>Download all your data anytime, one click.</p>
            </div>
            <div className={styles.cardVisual}>
              <ExportVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TransactionVisual() {
  const rows = [
    { label: 'Salary deposit', cat: 'Income', amount: '+$4,200', sign: 'income' },
    { label: 'Netflix', cat: 'Entertainment', amount: '-$15.99', sign: 'expense' },
    { label: 'Grocery Store', cat: 'Food', amount: '-$63.40', sign: 'warning' },
    { label: 'Spotify', cat: 'Entertainment', amount: '-$9.99', sign: 'expense' },
  ];
  return (
    <div className={styles.txVisual}>
      {rows.map((r, i) => (
        <div className={styles.txRow} key={i} style={{ '--i': i }}>
          <div className={styles.txIcon} data-sign={r.sign}>
            <FontAwesomeIcon icon={r.sign === 'income' ? faArrowUp : r.sign === 'expense' ? faArrowDown : faExclamation} />
          </div>
          <span className={styles.txLabel}>{r.label}</span>
          <span className={styles.txCat}>{r.cat}</span>
          <span className={styles.txAmount} data-sign={r.sign}>{r.amount}</span>
        </div>
      ))}
    </div>
  );
}

function ChartVisual() {
  const segments = [
    { pct: 38, color: 'var(--color-warning)', label: 'Food' },
    { pct: 24, color: 'var(--color-danger)', label: 'Bills' },
    { pct: 20, color: 'var(--color-primary)', label: 'Fun' },
    { pct: 18, color: 'var(--color-info)', label: 'Other' },
  ];
  const r = 52, cx = 64, cy = 64;
  const circumference = 2 * Math.PI * r;
  let cumPct = 0;

  return (
    <div className={styles.chartVisual}>
      <svg viewBox="0 0 128 128" className={styles.donut}>
        {segments.map((seg, i) => {
          const dashArray = `${(seg.pct / 100) * circumference} ${circumference}`;
          const dashOffset = -(cumPct / 100) * circumference;
          cumPct += seg.pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={seg.color} strokeWidth="16"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              style={{ transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }}
            />
          );
        })}
        <text x={cx} y={cy - 5} textAnchor="middle" className={styles.donutCenter}>$2.4k</text>
        <text x={cx} y={cy + 11} textAnchor="middle" className={styles.donutSub}>spent</text>
      </svg>
      <div className={styles.legend}>
        {segments.map((s, i) => (
          <div className={styles.legendRow} key={i}>
            <span className={styles.legendDot} style={{ background: s.color }} />
            <span className={styles.legendLabel}>{s.label}</span>
            <span className={styles.legendPct}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetVisual() {
  const budgets = [
    { cat: 'Food', spent: 72, limit: 80, over: false },
    { cat: 'Entertainment', spent: 48, limit: 40, over: true },
    { cat: 'Transport', spent: 22, limit: 60, over: false },
  ];
  return (
    <div className={styles.budgetVisual}>
      {budgets.map((b, i) => {
        const pct = Math.min((b.spent / b.limit) * 100, 100);
        return (
          <div className={styles.budgetRow} key={i}>
            <div className={styles.budgetMeta}>
              <span className={styles.budgetCat}>{b.cat}</span>
              <span className={styles.budgetAmt} data-over={b.over}>
                ${b.spent} / ${b.limit}
              </span>
            </div>
            <div className={styles.budgetTrack}>
              <div
                className={styles.budgetFill}
                data-over={b.over}
                style={{ width: `${pct}%` }}
              />
            </div>
            {b.over && (
              <span className={styles.budgetAlert}>Over budget</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CategoriesVisual() {
  const cats = [
    { label: 'Food', bg: 'var(--color-warning-light)', text: 'var(--color-warning-text)', border: 'var(--color-warning-border)' },
    { label: 'Income', bg: 'var(--color-success-light)', text: 'var(--color-success-text)', border: 'var(--color-success-border)' },
    { label: 'Bills', bg: 'var(--color-danger-light)', text: 'var(--color-danger-text)', border: 'var(--color-danger-border)' },
    { label: 'Transport', bg: 'var(--color-info-light)', text: 'var(--color-info-text)', border: 'var(--color-info-border)' },
    { label: 'Entertainment', bg: 'var(--color-primary-light)', text: 'var(--color-primary-text)', border: 'var(--color-primary-border)' },
    { label: 'Health', bg: 'var(--color-warning-light)', text: 'var(--color-warning-text)', border: 'var(--color-warning-border)' },
  ];
  return (
    <div className={styles.catsVisual}>
      {cats.map((c, i) => (
        <span key={i} className={styles.catPill}
          style={{ background: c.bg, color: c.text, borderColor: c.border }}>
          {c.label}
        </span>
      ))}
    </div>
  );
}

function ExportVisual() {
  return (
    <div className={styles.exportVisual}>
      <div className={styles.exportFile}>
        <div className={styles.exportIcon}>
          <FontAwesomeIcon icon={faFileExport} />
        </div>
        <div className={styles.exportMeta}>
          <span className={styles.exportName}>transactions_july.csv</span>
          <span className={styles.exportSize}>4.2 KB · Ready</span>
        </div>
      </div>
      <div className={styles.exportTrack}>
        <div className={styles.exportFill} />
      </div>
    </div>
  );
}