import { useState, useEffect } from 'react';
import styles from './BudgetsPage.module.css';
import Sidebar from '../dashboard/sections/Sidebar';
import BudgetsHeader from './sections/BudgetsHeader';
import BudgetsSummary from './sections/BudgetsSummary';
import BudgetsList from './sections/BudgetsList';
import AddBudgetModal from '../../components/add_budget/AddBudgetModal';
import api from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const TOTAL_AVAILABLE_CATEGORIES = 9;
  const allCategoriesUsed = budgets.length >= TOTAL_AVAILABLE_CATEGORIES;

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budget');
      setBudgets(res.data);
    } catch (err) {
      console.error('Failed to fetch budgets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const addBudget = (budget) => {
    setBudgets((prev) => [...prev, budget]);
  };

  const deleteBudget = async (id) => {
    try {
      await api.delete(`/budget/${id}`);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Failed to delete budget', err);
    }
  };

  const updateLimit = async (id, limit) => {
    try {
      await api.put(`/budget/${id}`, { limit });
      setBudgets((prev) => prev.map((b) => b.id === id ? { ...b, limit } : b));
    } catch (err) {
      console.error('Failed to update budget limit', err);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <BudgetsHeader onAdd={() => setModalOpen(true)} disableAdd={allCategoriesUsed} />
        <div className={styles.content}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            </div>
          ) : (
            <>
              <BudgetsSummary budgets={budgets} />
              <BudgetsList
                budgets={budgets}
                onDelete={deleteBudget}
                onUpdateLimit={updateLimit}
              />
            </>
          )}
        </div>
      </div>
      {modalOpen && (
        <AddBudgetModal
          onClose={() => setModalOpen(false)}
          onAdd={addBudget}
          existingCategories={budgets.map((b) => b.category)}
        />
      )}
    </div>
  );
}
