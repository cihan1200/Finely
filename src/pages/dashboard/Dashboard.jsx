import styles from './Dashboard.module.css';
import Sidebar from './sections/Sidebar';
import Overview from './sections/Overview';
import SpendingChart from './sections/SpendingChart';
import Transactions from './sections/Transactions';
import BudgetProgress from './sections/BudgetProgress';

function getFirstName() {
  try {
    const raw = localStorage.getItem('finely-user');
    if (raw) {
      const { name } = JSON.parse(raw);
      return name?.trim().split(/\s+/)[0] || null;
    }
  } catch {
  }
  return null;
}

export default function Dashboard() {
  const firstName = getFirstName();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>
              Welcome back{firstName ? `, ${firstName}` : ''} — here's your overview.
            </p>
          </div>
          <div className={styles.topBarMeta}>
            <span className={styles.period}>July 2025</span>
          </div>
        </div>
        <div className={styles.content}>
          <Overview />
          <div className={styles.middleGrid}>
            <SpendingChart />
            <BudgetProgress />
          </div>
          <Transactions />
        </div>
      </div>
    </div>
  );
}