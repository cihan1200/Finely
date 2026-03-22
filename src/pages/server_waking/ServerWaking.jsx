import { useEffect, useState } from 'react';
import styles from './ServerWaking.module.css';
import { useTheme } from '../../contexts/ThemeContext';
import logoLight from "../../assests/logo-light.svg";
import logoDark from "../../assests/logo-dark.svg";

const STAGES = [
  { id: 'init', label: 'Initializing', detail: 'Starting up the runtime environment' },
  { id: 'connect', label: 'Connecting', detail: 'Reaching the server on Render' },
  { id: 'handshake', label: 'Handshaking', detail: 'Verifying server response' },
  { id: 'ready', label: 'Ready', detail: 'All systems operational' },
];

export default function ServerWaking({ onAwake }) {
  const { theme } = useTheme();
  const [currentStage, setCurrentStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (elapsed === 1) setCurrentStage(1);
    if (elapsed === 4) setCurrentStage(2);
  }, [elapsed]);

  const progress = Math.min((currentStage / (STAGES.length - 1)) * 100, 75);

  return (
    <div className={styles.root}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.orb} aria-hidden="true" />

      <div className={styles.card}>
        <div className={styles.header}>
          <img
            src={theme === 'dark' ? logoDark : logoLight}
            alt="Finely"
            className={styles.logo}
          />
        </div>

        <h1 className={styles.title}>Server is waking up{dots}</h1>
        <p className={styles.subtitle}>
          Render spins down free-tier services after inactivity.
          This usually takes 30–60 seconds.
        </p>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className={styles.stages}>
          {STAGES.map((stage, i) => {
            const isDone = i < currentStage;
            const isActive = i === currentStage;
            const isPending = i > currentStage;

            return (
              <li
                key={stage.id}
                className={[
                  styles.stage,
                  isDone ? styles.done : '',
                  isActive ? styles.active : '',
                  isPending ? styles.pending : '',
                ].join(' ')}
              >
                <span className={styles.stageIcon} aria-hidden="true">
                  {isDone ? '✓' : isActive ? <span className={styles.pulse} /> : '○'}
                </span>
                <span className={styles.stageBody}>
                  <span className={styles.stageName}>{stage.label}</span>
                  {(isDone || isActive) && (
                    <span className={styles.stageDetail}>{stage.detail}</span>
                  )}
                </span>
                {isActive && (
                  <span className={styles.stageBadge}>In progress</span>
                )}
                {isDone && (
                  <span className={`${styles.stageBadge} ${styles.stageBadgeDone}`}>Done</span>
                )}
              </li>
            );
          })}
        </ol>

        <div className={styles.footer}>
          <span className={styles.timer}>
            <span className={styles.timerDot} />
            {elapsed}s elapsed
          </span>
          <span className={styles.hint}>Hang tight — only happens once</span>
        </div>
      </div>
    </div>
  );
}