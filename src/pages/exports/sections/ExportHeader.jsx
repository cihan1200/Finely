import styles from './ExportHeader.module.css';

export default function ExportHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>Export</h1>
        <p className={styles.subtitle}>Download your financial data in your preferred format.</p>
      </div>
    </div>
  );
}