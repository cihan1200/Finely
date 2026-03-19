import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import SignIn from "./pages/sign_in/SignIn";
import SignUp from "./pages/sign_up/SignUp";
import Dashboard from "./pages/dashboard/Dashboard";
import TransactionsPage from './pages/transactions/TransactionsPage';
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import BudgetsPage from "./pages/budgets/BudgetsPage";

export default function App() {
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