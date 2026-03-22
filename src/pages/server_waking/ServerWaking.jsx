import { useEffect } from "react";

const PROD_API = "https://finely.onrender.com";

export default function ServerWaking({ children }) {
  const isProd = !import.meta.env.DEV;

  useEffect(() => {
    if (isProd) {
      window.location.replace(`${PROD_API}/wake`);
    }
  }, []);

  if (isProd) return null;
  return children;
}