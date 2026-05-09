import { useState } from "react";
import api from "../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import styles from "./SignIn.module.css";
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

export default function SignIn() {
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
      const response = await api.post("/auth/signin", {
        email: formData.email,
        password: formData.password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);

      const { data: user } = await api.get("/auth/me");
      localStorage.setItem("finely-user", JSON.stringify(user));

      navigate("/dashboard");
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

        const { data: user } = await api.get("/auth/me");
        localStorage.setItem("finely-user", JSON.stringify(user));

        navigate("/dashboard");
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
            <h1>Welcome back</h1>
            <p>Sign in to continue managing your finances</p>
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
              Don't have an account?{" "}
              <span onClick={() => navigate("/signup")}>Sign up</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
