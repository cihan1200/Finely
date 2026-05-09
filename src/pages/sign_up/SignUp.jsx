import { useState } from "react";
import api from "../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import styles from "./SignUp.module.css";
import logoLight from "../../assests/logo-light.svg";
import logoDark from "../../assests/logo-dark.svg";
import Button from "../../components/button/Button";
import Message from "../../components/message/Message";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return {};
  }
}

export default function SignUp() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const logo = theme === "dark" ? logoDark : logoLight;
  const [isLoading, setIsLoading] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    variant: "notify",
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
        variant: "error",
      });
    }

    setIsLoading(true);

    const nameParts = formData.fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    try {
      const response = await api.post("/auth/signup", {
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);

      const { data: user } = await api.get("/auth/me");
      localStorage.setItem("finely-user", JSON.stringify(user));

      navigate("/setup");
    } catch (err) {
      setModal({
        isOpen: true,
        message:
          err.response?.data?.message || err.message || "Something went wrong",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const response = await api.post("/auth/google", {
          access_token: tokenResponse.access_token,
        });

        const { token } = response.data;
        localStorage.setItem("token", token);

        // Fetch user profile (Google users are automatically verified)
        const { data: user } = await api.get("/auth/me");
        localStorage.setItem("finely-user", JSON.stringify(user));

        // Redirect to setup page
        navigate("/setup");
      } catch (err) {
        setModal({
          isOpen: true,
          message:
            err.response?.data?.message || "Google authentication failed",
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setModal({
        isOpen: true,
        message: "Google login was cancelled or failed",
        variant: "error",
      });
    },
  });

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
              variant="primary"
              size="large"
              fullWidth
              type="button"
              icon={<FontAwesomeIcon icon={faGoogle} />}
              onClick={() => loginWithGoogle()}
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
