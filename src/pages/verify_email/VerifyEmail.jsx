import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faSpinner, faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import styles from "./VerifyEmail.module.css";

export default function VerifyEmail() {
  const [status, setStatus] = useState("checking"); // checking, sent, verified, error
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check URL for token first (if user clicked verification link)
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      verifyEmail(token);
      return;
    }
    // If no token, check verification status
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (data.emailVerified) {
        setStatus("verified");
        setTimeout(() => navigate("/setup"), 2000);
      } else {
        setStatus("sent");
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Not authenticated, redirect to signin
        navigate("/signin");
        return;
      }
      setStatus("sent"); // Assume not verified yet
    }
  };

  const verifyEmail = async (token) => {
    try {
      const { data } = await api.get(`/auth/verify-email/${token}`);

      // Store token and user data for auto-login
      localStorage.setItem("token", data.token);
      localStorage.setItem("finely-user", JSON.stringify(data.user));

      setStatus("verified");
      setTimeout(() => {
        navigate(data.redirectUrl || "/setup");
      }, 2000);
    } catch (err) {
      setStatus("error");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await api.post("/auth/resend-verification");
      setStatus("sent");
      setResendCooldown(60);
      const countdown = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Failed to resend:", err);
    }
  };

  const renderContent = () => {
    switch (status) {
      case "checking":
        return (
          <div className={styles.content}>
            <div className={styles.icon}>
              <FontAwesomeIcon icon={faSpinner} spin />
            </div>
            <h2>Checking verification status...</h2>
          </div>
        );
      case "sent":
        return (
          <div className={styles.content}>
            <div className={styles.icon}>
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <h2>Check your inbox</h2>
            <p>
              We've sent a verification email to your email address.
              Please click the link in that email to verify your account.
            </p>
            <div className={styles.actions}>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className={resendCooldown > 0 ? styles.disabled : styles.resendBtn}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend verification email"}
              </button>
            </div>
            <p className={styles.hint}>
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        );
      case "verified":
        return (
          <div className={styles.content}>
            <div className={styles.icon + " " + styles.success}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h2>Email verified!</h2>
            <p>Redirecting you to setup...</p>
          </div>
        );
      case "error":
        return (
          <div className={styles.content}>
            <div className={styles.icon + " " + styles.error}>
              <FontAwesomeIcon icon={faExclamationCircle} />
            </div>
            <h2>Verification failed</h2>
            <p>The verification link is invalid or has expired.</p>
            <div className={styles.actions}>
              <button onClick={handleResend} className={styles.resendBtn}>
                Request new verification email
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className={styles.container}>{renderContent()}</div>;
}