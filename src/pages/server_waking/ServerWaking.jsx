import { useEffect } from "react";

const PROD_API = "https://finely.onrender.com";

export default function ServerWaking({ children }) {
  const isProd = !import.meta.env.DEV;
  const isReady = new URLSearchParams(window.location.search).has("ready");

  useEffect(() => {
    if (isProd && !isReady) {
      const returnTo = encodeURIComponent(
        window.location.origin + window.location.pathname + "?ready=1"
      );
      window.location.replace(`${PROD_API}/wake?return=${returnTo}`);
    }

    if (isReady) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (isProd && !isReady) return null;
  return children;
}