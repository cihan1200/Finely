import { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import styles from "./SignUp.module.css";
import logoLight from "../../assests/logo-light.svg";
import logoDark from "../../assests/logo-dark.svg";
import Button from "../../components/button/Button";
import Message from "../../components/message/Message";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
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
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModal({ ...modal, isOpen: false });

    if (formData.password !== formData.confirmPassword) {
      return setModal({
        isOpen: true,
        message: "Passwords do not match",
        variant: "error"
      });
    }

    setIsLoading(true);

    const nameParts = formData.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    try {
      const response = await axios.post("http://127.0.0.1:5000/auth/signup", {
        firstName,
        lastName,
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
            <h1>Create account</h1>
            <p>Start managing your finances today</p>
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
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
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

            <div className={styles.row}>
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

              <div className={styles.inputGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button size="large" fullWidth type="submit" saving={isLoading}>
              Create account
            </Button>
          </form>

          <div className={styles.footer}>
            <p>
              Already have an account?{" "}
              <span onClick={() => navigate("/signin")}>Sign in</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}