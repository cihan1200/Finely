import { useState, useEffect, useCallback } from "react";
import styles from "./ServerWaking.module.css";

const PROD_API = "https://finely.onrender.com";
const POLL_INTERVAL_MS = 3000;
const MAX_WAIT_MS = 90000; // 90 s — Render typically wakes in ~30–60 s

/**
 * Wraps the app and shows a branded loading screen while the Render
 * instance is cold-starting. In development the children are rendered
 * immediately (no polling needed since the server is already local).
 */
export default function ServerWaking({ children }) {
  const isProd = !import.meta.env.DEV;

  const [status, setStatus] = useState(isProd ? "checking" : "ready");
  // "checking" | "waking" | "ready" | "timeout"

  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState("");

  const ping = useCallback(async () => {
    try {
      const res = await fetch(`${PROD_API}/health`, { cache: "no-store" });
      if (res.ok) {
        setStatus("ready");
        return true;
      }
    } catch {
      // server not yet reachable — keep polling
    }
    return false;
  }, []);

  useEffect(() => {
    if (status === "ready") return;

    let startTime = Date.now();
    let timerId;

    const tick = async () => {
      const elapsed = Date.now() - startTime;
      setElapsed(Math.floor(elapsed / 1000));

      if (elapsed > POLL_INTERVAL_MS * 1.5) {
        setStatus("waking"); // first ping missed — server is cold-starting
      }

      if (elapsed >= MAX_WAIT_MS) {
        setStatus("timeout");
        return;
      }

      const ready = await ping();
      if (!ready) {
        timerId = setTimeout(tick, POLL_INTERVAL_MS);
      }
    };

    // Kick off immediately
    tick();
    return () => clearTimeout(timerId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Animated ellipsis
  useEffect(() => {
    if (status === "ready" || status === "timeout") return;
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(id);
  }, [status]);

  if (status === "ready") return children;

  const isTimeout = status === "timeout";

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        {/* Logo mark */}
        <div className={styles.logoMark}>
          <span className={styles.logoIcon}>₣</span>
        </div>

        <h1 className={styles.appName}>Finely</h1>

        {!isTimeout ? (
          <>
            {/* Spinner */}
            <div className={styles.spinnerTrack}>
              <div className={styles.spinner} />
            </div>

            <p className={styles.headline}>
              {status === "checking" ? "Connecting" : "Server is waking up"}
              <span className={styles.dots}>{dots}</span>
            </p>

            <p className={styles.subline}>
              {status === "waking"
                ? "Render spins down free servers after inactivity. This usually takes 30–60 seconds."
                : "Checking server status…"}
            </p>

            {status === "waking" && (
              <div className={styles.timerRow}>
                <div className={styles.timerBar}>
                  <div
                    className={styles.timerFill}
                    style={{ width: `${Math.min((elapsed / 90) * 100, 100)}%` }}
                  />
                </div>
                <span className={styles.timerLabel}>{elapsed}s</span>
              </div>
            )}
          </>
        ) : (
          <>
            <p className={styles.headline}>Taking longer than expected</p>
            <p className={styles.subline}>
              The server hasn't responded after {elapsed}s. You can wait a
              little longer or try refreshing the page.
            </p>
            <button
              className={styles.retryBtn}
              onClick={() => {
                setStatus("checking");
                setElapsed(0);
              }}
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}