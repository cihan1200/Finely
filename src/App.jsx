import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/home/Home";
import SignIn from "./pages/sign_in/SignIn";
import SignUp from "./pages/sign_up/SignUp";
import Dashboard from "./pages/dashboard/Dashboard";
import TransactionsPage from './pages/transactions/TransactionsPage';
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import BudgetsPage from "./pages/budgets/BudgetsPage";
import ServerWaking from "./pages/server_waking/ServerWaking";

export default function App() {
  const [isServerAwake, setIsServerAwake] = useState(false);

  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        const response = await fetch("https://finely.onrender.com/ping");
        if (response.ok) {
          setIsServerAwake(true);
        }
      } catch (error) {
        console.log("Server still sleeping, retrying...");
        setTimeout(wakeUpServer, 3000);
      }
    };

    wakeUpServer();
  }, []);

  if (!isServerAwake) {
    return <ServerWaking />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
      </Routes>
    </BrowserRouter>
  );
}