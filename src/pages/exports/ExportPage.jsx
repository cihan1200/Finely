import { useState } from 'react';
import styles from './ExportPage.module.css';
import Sidebar from '../dashboard/sections/Sidebar';
import ExportHeader from './sections/ExportHeader';
import ExportConfig from './sections/ExportConfig';
import ExportHistory from './sections/ExportHistory';

export default function ExportPage() {
  const [latestEntry, setLatestEntry] = useState(null);

  const handleExported = (entry) => {
    setLatestEntry({ ...entry, id: Date.now() });
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <ExportHeader />
        <div className={styles.content}>
          <div className={styles.grid}>
            <ExportConfig onExported={handleExported} />
            <ExportHistory newEntry={latestEntry} />
          </div>
        </div>
      </div>
    </div>
  );
}