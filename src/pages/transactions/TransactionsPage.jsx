import { useState, useEffect } from 'react';
import api from "../../utils/api";
import { useNavigate } from 'react-router-dom';
import styles from './TransactionsPage.module.css';
import Sidebar from '../dashboard/sections/Sidebar';
import TransactionsHeader from './sections/TransactionsHeader';
import TransactionsSummary from './sections/TransactionsSummary';
import TransactionsTable from './sections/TransactionsTable';
import AddTransactionModal from '../../components/add_transaction/AddTransactionModal';
import ConfirmModal from '../../components/confirm_modal/ConfirmModal'; // <-- Import new modal

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate('/signin');
      return;
    }

    const fetchTransactions = async () => {
      try {
        const response = await api.get('/transaction');
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [navigate]);

  const addTransaction = async (tx) => {
    try {
      const response = await api.post('/transaction', tx);
      setTransactions((prev) => [response.data, ...prev]);
      setModalOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error.response?.data || error.message);
    }
  };

  const requestDelete = (id) => {
    setTransactionToDelete(id);
  };

  const confirmDelete = async () => {
    const idToDelete = transactionToDelete;

    setTransactionToDelete(null);
    setIsDeletingId(idToDelete);

    try {
      await api.delete(`/transaction/${idToDelete}`);
      setTransactions((prev) => prev.filter((tx) => tx.id !== idToDelete));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <TransactionsHeader onAdd={() => setModalOpen(true)} />
        <div className={styles.content}>
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading transactions...
            </div>
          ) : (
            <>
              <TransactionsSummary transactions={transactions} />
              <TransactionsTable
                transactions={transactions}
                onDeleteRequest={requestDelete}
                isDeletingId={isDeletingId}
              />
            </>
          )}
        </div>
      </div>

      {modalOpen && (
        <AddTransactionModal
          onClose={() => setModalOpen(false)}
          onAdd={addTransaction}
        />
      )}

      <ConfirmModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? It will be permanently removed from your history and budget calculations."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
}