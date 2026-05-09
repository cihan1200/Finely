import { useEffect, useRef } from "react";
import styles from "./Features.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListCheck,
  faChartPie,
  faBell,
  faTag,
  faFileExport,
  faArrowUp,
  faArrowDown,
  faExclamation,
} from "@fortawesome/free-solid-svg-icons";

const FEATURES = [
  {
    step: "Feature 01",
    icon: faListCheck,
    title: "Transaction tracking",
    description:
      "Log every income and expense in seconds. Filter, search and edit with ease across all your accounts.",
    tag: "Income · Expenses · Search · Edit",
    Visual: TransactionVisual,
  },
  {
    step: "Feature 02",
    icon: faChartPie,
    title: "Spending breakdown",
    description:
      "See exactly where your money goes with live category charts updated in real time.",
    tag: "Live charts · Categories · Real-time",
    Visual: ChartVisual,
    flip: true,
  },
  {
    step: "Feature 03",
    icon: faBell,
    title: "Budget alerts",
    description:
      "Set monthly limits per category and get warned before you overspend — never be surprised again.",
    tag: "Monthly limits · Warnings · Per category",
    Visual: BudgetVisual,
    warning: true,
  },
  {
    step: "Feature 04",
    icon: faTag,
    title: "Smart categories",
    description:
      "Organise spending with colour-coded tags that make every transaction instantly readable.",
    tag: "Colour-coded · Tags · Custom",
    Visual: CategoriesVisual,
    flip: true,
  },
  {
    step: "Feature 05",
    icon: faFileExport,
    title: "CSV export",
    description:
      "Download all your data anytime. One click, every transaction, ready for your spreadsheet.",
    tag: "One click · CSV format · All data",
    Visual: ExportVisual,
  },
];

export default function Features() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll("[data-animate]");
    if (!els) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="features" ref={sectionRef}>
      <div className={styles.sectionBg} />

      <div className={styles.inner}>
        <div className={styles.header} data-animate>
          <div className={styles.eyebrow}>Features</div>
          <h2 className={styles.headline}>
            Built for people who want{" "}
            <span className={styles.headlineAccent}>clarity.</span>
          </h2>
          <p className={styles.subheadline}>
            Every feature is designed to stay out of your way and let the
            numbers speak.
          </p>
        </div>

        <div className={styles.rows}>
          {FEATURES.map(
            (
              { step, icon, title, description, tag, Visual, flip, warning },
              i,
            ) => (
              <div
                key={i}
                className={`${styles.row} ${flip ? styles.rowFlip : ""}`}
                data-animate
                style={{ "--delay": `${i * 0.07}s` }}
              >
                <div className={styles.text}>
                  <div className={styles.step}>{step}</div>
                  <div
                    className={`${styles.iconWrap} ${warning ? styles.iconWrapWarning : ""}`}
                  >
                    <FontAwesomeIcon icon={icon} />
                  </div>
                  <h3 className={styles.featureTitle}>{title}</h3>
                  <p className={styles.featureDesc}>{description}</p>
                  <span className={styles.pill}>{tag}</span>
                </div>

                <div className={styles.visual}>
                  <Visual />
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function TransactionVisual() {
  const rows = [
    {
      label: "Salary deposit",
      cat: "Income",
      amount: "+$4,200",
      sign: "income",
    },
    {
      label: "Netflix",
      cat: "Entertainment",
      amount: "-$15.99",
      sign: "expense",
    },
    { label: "Grocery Store", cat: "Food", amount: "-$63.40", sign: "warning" },
    {
      label: "Spotify",
      cat: "Entertainment",
      amount: "-$9.99",
      sign: "expense",
    },
  ];
  return (
    <div className={styles.txVisual}>
      {rows.map((r, i) => (
        <div className={styles.txRow} key={i} style={{ "--i": i }}>
          <div className={styles.txIcon} data-sign={r.sign}>
            <FontAwesomeIcon
              icon={
                r.sign === "income"
                  ? faArrowUp
                  : r.sign === "expense"
                    ? faArrowDown
                    : faExclamation
              }
            />
          </div>
          <span className={styles.txLabel}>{r.label}</span>
          <span className={styles.txCat}>{r.cat}</span>
          <span className={styles.txAmount} data-sign={r.sign}>
            {r.amount}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartVisual() {
  const segments = [
    { pct: 38, color: "var(--color-warning)", label: "Food" },
    { pct: 24, color: "var(--color-danger)", label: "Bills" },
    { pct: 20, color: "var(--color-primary)", label: "Fun" },
    { pct: 18, color: "var(--color-info)", label: "Other" },
  ];
  const r = 52,
    cx = 64,
    cy = 64;
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
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              className={styles.donutSegment}
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                transform: "rotate(-90deg)",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          );
        })}
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          className={styles.donutCenter}
        >
          $2.4k
        </text>
        <text
          x={cx}
          y={cy + 11}
          textAnchor="middle"
          className={styles.donutSub}
        >
          spent
        </text>
      </svg>
      <div className={styles.legend}>
        {segments.map((s, i) => (
          <div className={styles.legendRow} key={i} style={{ "--i": i }}>
            <span
              className={styles.legendDot}
              style={{ background: s.color }}
            />
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
    { cat: "Food", spent: 72, limit: 80, over: false },
    { cat: "Entertainment", spent: 48, limit: 40, over: true },
    { cat: "Transport", spent: 22, limit: 60, over: false },
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
                style={{ width: `${pct}%`, "--bar-delay": `${i * 0.2}s` }}
              />
            </div>
            {b.over && <span className={styles.budgetAlert}>Over budget</span>}
          </div>
        );
      })}
    </div>
  );
}

function CategoriesVisual() {
  const cats = [
    {
      label: "Food",
      bg: "var(--color-warning-light)",
      text: "var(--color-warning-text)",
      border: "var(--color-warning-border)",
    },
    {
      label: "Income",
      bg: "var(--color-success-light)",
      text: "var(--color-success-text)",
      border: "var(--color-success-border)",
    },
    {
      label: "Bills",
      bg: "var(--color-danger-light)",
      text: "var(--color-danger-text)",
      border: "var(--color-danger-border)",
    },
    {
      label: "Transport",
      bg: "var(--color-info-light)",
      text: "var(--color-info-text)",
      border: "var(--color-info-border)",
    },
    {
      label: "Entertainment",
      bg: "var(--color-primary-light)",
      text: "var(--color-primary-text)",
      border: "var(--color-primary-border)",
    },
    {
      label: "Health",
      bg: "var(--color-warning-light)",
      text: "var(--color-warning-text)",
      border: "var(--color-warning-border)",
    },
  ];
  return (
    <div className={styles.catsVisual}>
      {cats.map((c, i) => (
        <span
          key={i}
          className={styles.catPill}
          style={{
            background: c.bg,
            color: c.text,
            borderColor: c.border,
            "--pill-i": i,
          }}
        >
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
