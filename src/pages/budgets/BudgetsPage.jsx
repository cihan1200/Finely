import { useState } from 'react';
import styles from './BudgetsPage.module.css';
import Sidebar from '../dashboard/sections/Sidebar';
import BudgetsHeader from './sections/BudgetsHeader';
import BudgetsSummary from './sections/BudgetsSummary';
import BudgetsList from './sections/BudgetsList';
import AddBudgetModal from '../../components/add_budget/AddBudgetModal';

const INITIAL_BUDGETS = [
  { id: 1, label: 'Food & dining', icon: 'utensils', limit: 500, spent: 420, color: 'warning' },
  { id: 2, label: 'Entertainment', icon: 'film', limit: 80, spent: 95, color: 'primary' },
  { id: 3, label: 'Transport', icon: 'car', limit: 250, spent: 140, color: 'info' },
  { id: 4, label: 'Utilities', icon: 'bolt', limit: 200, spent: 180, color: 'info' },
  { id: 5, label: 'Health', icon: 'heart-pulse', limit: 150, spent: 60, color: 'success' },
  { id: 6, label: 'Clothing', icon: 'shirt', limit: 200, spent: 210, color: 'danger' },
  { id: 7, label: 'Education', icon: 'book', limit: 100, spent: 30, color: 'primary' },
  { id: 8, label: 'Subscriptions', icon: 'rotate', limit: 50, spent: 26, color: 'warning' },
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [modalOpen, setModalOpen] = useState(false);

  const addBudget = (budget) => {
    setBudgets((prev) => [...prev, { ...budget, id: Date.now(), spent: 0 }]);
  };

  const deleteBudget = (id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const updateLimit = (id, limit) => {
    setBudgets((prev) => prev.map((b) => b.id === id ? { ...b, limit } : b));
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <BudgetsHeader onAdd={() => setModalOpen(true)} />
        <div className={styles.content}>
          <BudgetsSummary budgets={budgets} />
          <BudgetsList
            budgets={budgets}
            onDelete={deleteBudget}
            onUpdateLimit={updateLimit}
          />
        </div>
      </div>
      {modalOpen && (
        <AddBudgetModal
          onClose={() => setModalOpen(false)}
          onAdd={addBudget}
        />
      )}
    </div>
  );
}