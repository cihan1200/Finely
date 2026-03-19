import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import styles from "./Message.module.css";

export default function Message({ isOpen, message, variant = "notify", onClose }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: faCircleCheck,
    error: faCircleXmark,
    notify: faCircleInfo,
  };

  return (
    <div className={`${styles.modal} ${styles[variant]}`}>
      <FontAwesomeIcon icon={icons[variant]} className={styles.icon} />
      <span className={styles.message}>{message}</span>
    </div>
  );
}