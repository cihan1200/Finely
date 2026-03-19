import styles from './AnalyticsPage.module.css';
import Sidebar from '../dashboard/sections/Sidebar';
import AnalyticsHeader from './sections/AnalyticsHeader';
import AnalyticsSummary from './sections/AnalyticsSummary';
import SpendingByCategory from './sections/SpendingByCategory';
import MonthlyTrend from './sections/MonthlyTrend';
import TopExpenses from './sections/TopExpenses';
import IncomeVsExpenses from './sections/IncomeVsExpenses';

export default function AnalyticsPage() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <AnalyticsHeader />
        <div className={styles.content}>
          <AnalyticsSummary />
          <div className={styles.rowGrid}>
            <SpendingByCategory />
            <TopExpenses />
          </div>
          <MonthlyTrend />
          <IncomeVsExpenses />
        </div>
      </div>
    </div>
  );
}