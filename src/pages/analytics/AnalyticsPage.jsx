import styles from './AnalyticsPage.module.css';
import Sidebar from '../dashboard/sections/Sidebar';
import AnalyticsHeader from './sections/AnalyticsHeader';
import AnalyticsSummary from './sections/AnalyticsSummary';
import SpendingByCategory from './sections/SpendingByCategory';
import MonthlyTrend from './sections/MonthlyTrend';
import TopExpenses from './sections/TopExpenses';
import IncomeVsExpenses from './sections/IncomeVsExpenses';
import { useState } from 'react';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(6);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <AnalyticsHeader period={period} setPeriod={setPeriod} />
        <div className={styles.content}>
          <AnalyticsSummary period={period} />
          <div className={styles.rowGrid}>
            <SpendingByCategory period={period} />
            <TopExpenses period={period} />
          </div>
          <MonthlyTrend period={period} />
          <IncomeVsExpenses period={period} />
        </div>
      </div>
    </div>
  );
}
