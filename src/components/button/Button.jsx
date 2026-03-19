import styles from "./Button.module.css";

export default function Button({
  children,
  variant = "primary",
  size = "medium",
  className = "",
  disabled = false,
  saving = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  ...props
}) {
  const isDisabled = disabled || saving;

  const classes = [
    styles.base,
    styles[variant],
    styles[size],
    isDisabled ? styles.disabled : "",
    saving ? styles.saving : "",
    fullWidth ? styles.fullWidth : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <button className={classes} disabled={isDisabled} {...props}>
      {saving && <span className={styles.spinner}></span>}
      {!saving && icon && iconPosition === "left" && (
        <span className={styles.iconWrapper}>{icon}</span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <span className={styles.iconWrapper}>{icon}</span>
      )}
    </button>
  );
}