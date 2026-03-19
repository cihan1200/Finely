import { useState } from 'react';
import styles from './TransactionsPage.module.css';
import Sidebar from '../dashboard/sections/Sidebar';
import TransactionsHeader from './sections/TransactionsHeader';
import TransactionsSummary from './sections/TransactionsSummary';
import TransactionsTable from './sections/TransactionsTable';
import AddTransactionModal from '../../components/add_transaction/AddTransactionModal';

const INITIAL_TRANSACTIONS = [
  { id: 1, label: 'Salary deposit', category: 'Income', amount: 4200.00, sign: 'income', date: '2025-07-31' },
  { id: 2, label: 'Netflix', category: 'Entertainment', amount: 15.99, sign: 'expense', date: '2025-07-29' },
  { id: 3, label: 'Grocery Store', category: 'Food', amount: 63.40, sign: 'expense', date: '2025-07-28' },
  { id: 4, label: 'Spotify', category: 'Entertainment', amount: 9.99, sign: 'expense', date: '2025-07-27' },
  { id: 5, label: 'Electricity bill', category: 'Utilities', amount: 94.50, sign: 'expense', date: '2025-07-25' },
  { id: 6, label: 'Freelance work', category: 'Income', amount: 850.00, sign: 'income', date: '2025-07-23' },
  { id: 7, label: 'Uber', category: 'Transport', amount: 18.70, sign: 'expense', date: '2025-07-22' },
  { id: 8, label: 'Gym membership', category: 'Health', amount: 40.00, sign: 'expense', date: '2025-07-20' },
  { id: 9, label: 'Supermarket', category: 'Food', amount: 87.30, sign: 'expense', date: '2025-07-19' },
  { id: 10, label: 'Dividends', category: 'Income', amount: 120.00, sign: 'income', date: '2025-07-15' },
  { id: 11, label: 'Water bill', category: 'Utilities', amount: 32.00, sign: 'expense', date: '2025-07-14' },
  { id: 12, label: 'Restaurant', category: 'Food', amount: 54.20, sign: 'expense', date: '2025-07-12' },
  { id: 13, label: 'Online course', category: 'Education', amount: 29.99, sign: 'expense', date: '2025-07-10' },
  { id: 14, label: 'Bus pass', category: 'Transport', amount: 45.00, sign: 'expense', date: '2025-07-08' },
  { id: 15, label: 'Bonus payment', category: 'Income', amount: 500.00, sign: 'income', date: '2025-07-05' },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [modalOpen, setModalOpen] = useState(false);

  const addTransaction = (tx) => {
    setTransactions((prev) => [
      { ...tx, id: Date.now() },
      ...prev,
    ]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <TransactionsHeader onAdd={() => setModalOpen(true)} />
        <div className={styles.content}>
          <TransactionsSummary transactions={transactions} />
          <TransactionsTable
            transactions={transactions}
            onDelete={deleteTransaction}
          />
        </div>
      </div>
      {modalOpen && (
        <AddTransactionModal
          onClose={() => setModalOpen(false)}
          onAdd={addTransaction}
        />
      )}
    </div>
  );
}