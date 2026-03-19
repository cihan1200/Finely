import { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import styles from "./SignIn.module.css";
import logoLight from "../../assests/logo-light.svg";
import logoDark from "../../assests/logo-dark.svg";
import Button from "../../components/button/Button";
import Message from "../../components/message/Message";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const logo = theme === "dark" ? logoDark : logoLight;
  const [isLoading, setIsLoading] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    variant: "notify"
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModal({ ...modal, isOpen: false });
    setIsLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/auth/signin", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setModal({
        isOpen: true,
        message: err.response?.data?.message || err.message || "Something went wrong",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Message
        isOpen={modal.isOpen}
        message={modal.message}
        variant={modal.variant}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <img src={logo} alt="finely logo" onClick={() => navigate("/")} />
            </div>
            <h1>Welcome back</h1>
            <p>Sign in to continue managing your finances</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <Button
              variant="secondary"
              size="large"
              fullWidth
              type="button"
              icon={<FontAwesomeIcon icon={faGoogle} />}
            >
              Continue with Google
            </Button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className={styles.options}>
              <label className={styles.remember}>
                <input type="checkbox" />
                Remember me
              </label>

              <button type="button" className={styles.forgot}>
                Forgot password?
              </button>
            </div>

            <Button size="large" fullWidth type="submit" saving={isLoading}>
              Sign in
            </Button>
          </form>

          <div className={styles.footer}>
            <p>
              Don’t have an account? <span onClick={() => navigate("/signup")}>Sign up</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}