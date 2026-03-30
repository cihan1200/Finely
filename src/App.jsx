import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import Home from "./pages/home/Home";
import SignIn from "./pages/sign_in/SignIn";
import SignUp from "./pages/sign_up/SignUp";
import Dashboard from "./pages/dashboard/Dashboard";
import VerifyEmail from "./pages/verify_email/VerifyEmail";
import Setup from "./pages/setup/Setup";
import TransactionsPage from './pages/transactions/TransactionsPage';
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import BudgetsPage from "./pages/budgets/BudgetsPage";
import ServerWaking from "./pages/server_waking/ServerWaking";
import ProtectedRoute from "./components/protected_rote/ProtectedRoute";
import ExportPage from "./pages/exports/ExportPage";
import AIAssistant from "./components/ai_assistant/AIAssistant";

export default function App() {
  const [isServerAwake, setIsServerAwake] = useState(
    () => sessionStorage.getItem("serverAwake") === "true"
  );

  // Check if we're on production (Vercel) and not on localhost
  const isProduction = import.meta.env.PROD;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const shouldShowServerWakeup = isProduction && !isLocalhost;

  useEffect(() => {
    if (!shouldShowServerWakeup || isServerAwake) return;

    const wakeUpServer = async () => {
      try {
        const response = await fetch("https://finely.onrender.com/ping");
        if (response.ok) {
          sessionStorage.setItem("serverAwake", "true");
          setIsServerAwake(true);
        }
      } catch (error) {
        console.log("Server still sleeping, retrying...");
        setTimeout(wakeUpServer, 3000);
      }
    };

    wakeUpServer();
  }, [isServerAwake, shouldShowServerWakeup]);
  
  if (shouldShowServerWakeup && !isServerAwake) {
    return <ServerWaking />;
  }

  return (
    <BrowserRouter>
      <AIAssistant />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/setup" element={<Setup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/exports" element={<ExportPage />} />
        </Route>
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}