import { useState, useEffect, useRef, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
  faSpinner,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Setup.module.css";

export default function Setup() {
  const navigate = useNavigate();
  const [linkToken, setLinkToken] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [connectedCardsCount, setConnectedCardsCount] = useState(0);
  const [pendingOpen, setPendingOpen] = useState(false);
  const tokenFetchInProgress = useRef(false);

  // Fetch initial card count to show if user already has connected cards
  useEffect(() => {
    fetchCardsCount();
  }, []);

  const fetchCardsCount = async () => {
    try {
      const { data } = await api.get("/card");
      setConnectedCardsCount(data.length);
    } catch (err) {
      console.error("Failed to fetch cards:", err);
    }
  };

  const fetchLinkToken = useCallback(async () => {
    if (tokenFetchInProgress.current) return;
    tokenFetchInProgress.current = true;
    setTokenLoading(true);
    setTokenError(null);
    try {
      const res = await api.post("/plaid/link-token");
      setLinkToken(res.data.link_token);
    } catch {
      setTokenError("Failed to initialize Plaid. Please try again.");
    } finally {
      setTokenLoading(false);
      tokenFetchInProgress.current = false;
    }
  }, []);

  const onPlaidSuccess = useCallback(
    async (public_token, metadata) => {
      setSaving(true);
      setError(null);
      try {
        // Random color selection
        const colors = [
          { color: "slate", colorFrom: "#64748b", colorTo: "#475569" },
          { color: "emerald", colorFrom: "#34d399", colorTo: "#10b981" },
          { color: "rose", colorFrom: "#f43f5e", colorTo: "#e11d48" },
          { color: "amber", colorFrom: "#fbbf24", colorTo: "#d97706" },
          { color: "violet", colorFrom: "#a78bfa", colorTo: "#8b5cf6" },
          { color: "indigo", colorFrom: "#818cf8", colorTo: "#6366f1" },
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        await api.post("/plaid/exchange", {
          publicToken: public_token,
          metadata,
          ...randomColor,
        });

        // Mark setup as complete (optional but nice)
        try {
          await api.patch("/auth/setup-complete");
        } catch (e) {
          console.error("Failed to mark setup complete:", e);
        }

        setSuccess(true);
        // Refresh card count
        fetchCardsCount();

        // Redirect after short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to connect bank. Please try again.",
        );
      } finally {
        setSaving(false);
      }
    },
    [navigate],
  );

  const { open: openPlaidLink, ready: plaidReady } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: (err) => {
      if (err) console.error("Plaid Link exit with error:", err);
    },
  });

  // Open Plaid as soon as we have a token and Plaid is ready
  useEffect(() => {
    if (pendingOpen && linkToken && plaidReady) {
      setPendingOpen(false);
      openPlaidLink();
    }
  }, [pendingOpen, linkToken, plaidReady, openPlaidLink]);

  const handleConnectBank = async () => {
    setPendingOpen(true);
    await fetchLinkToken();
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faLink} />
          </div>
          <h1 className={styles.title}>
            {connectedCardsCount > 0 ? "You're all set!" : "Connect your bank"}
          </h1>
          <p className={styles.subtitle}>
            {connectedCardsCount > 0
              ? "Your accounts are connected. You can add more banks or continue to your dashboard."
              : "Link your bank accounts to automatically import transactions and track your finances effortlessly."}
          </p>
        </div>

        <div className={styles.content}>
          {success ? (
            <div className={styles.successMessage}>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={styles.successIcon}
              />
              <h3>Bank connected successfully!</h3>
              <p>Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              {tokenError && <p className={styles.error}>{tokenError}</p>}
              {error && <p className={styles.error}>{error}</p>}

              <button
                onClick={handleConnectBank}
                disabled={tokenLoading || saving}
                className={styles.connectBtn}
              >
                {tokenLoading || saving ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  "Link Bank Account"
                )}
              </button>

              <div className={styles.divider}>or</div>

              <button onClick={handleSkip} className={styles.skipBtn}>
                {connectedCardsCount > 0 ? "Go to Dashboard" : "Skip for now"}
              </button>

              <p className={styles.note}>
                {connectedCardsCount > 0
                  ? "You can add more accounts later from the Transactions page."
                  : "You can link your bank later from the Transactions page."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
