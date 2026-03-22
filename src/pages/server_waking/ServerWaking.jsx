import styles from './ServerWaking.module.css';

export default function ServerWaking() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>Your service is spinning up...</p>
      <p className={styles.subtext}>
        This usually takes a few seconds on the free tier.
      </p>
    </div>
  );
};