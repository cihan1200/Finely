import { useState, useEffect, useCallback, useRef } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import api from "../../utils/api";
import { useNavigate } from 'react-router-dom';
import styles from './TransactionsPage.module.css';
import Sidebar from '../dashboard/sections/Sidebar';
import TransactionsHeader from './sections/TransactionsHeader';
import TransactionsSummary from './sections/TransactionsSummary';
import TransactionsTable from './sections/TransactionsTable';
import ConnectedCards from './sections/ConnectedCards';
import AddTransactionModal from '../../components/add_transaction/AddTransactionModal';
import AddCardModal from '../../components/add_card/AddCardModal';
import ConfirmModal from '../../components/confirm_modal/ConfirmModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const MAX_CARDS = 3;

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions]      = useState([]);
  const [txLoading, setTxLoading]            = useState(true);
  const [modalOpen, setModalOpen]            = useState(false);
  const [transactionToDelete, setTxToDelete] = useState(null);
  const [isDeletingId, setIsDeletingId]      = useState(null);
  const [connectedCards, setConnectedCards]  = useState([]);
  const [cardsLoading, setCardsLoading]      = useState(true);
  const [cardModalOpen, setCardModalOpen]    = useState(false);
  const [editingCard, setEditingCard]        = useState(null);
  const [cardToRemove, setCardToRemove]      = useState(null);
  const [cardSaving, setCardSaving]          = useState(false);
  const [cardRemoving, setCardRemoving]      = useState(null);
  const [cardSyncing, setCardSyncing]        = useState(null);
  const [linkToken, setLinkToken]                   = useState(null);
  const [tokenLoading, setTokenLoading]             = useState(false);
  const [tokenError, setTokenError]                 = useState(null);
  const [pendingPlaidResult, setPendingPlaidResult] = useState(null);

  const tokenFetchInProgress = useRef(false);

  const isLoading = txLoading || cardsLoading;

  const fetchLinkToken = useCallback(async () => {
    if (tokenFetchInProgress.current) return;
    tokenFetchInProgress.current = true;
    setTokenLoading(true);
    setTokenError(null);
    try {
      const res = await api.post('/plaid/link-token');
      setLinkToken(res.data.link_token);
    } catch {
      setTokenError('Failed to initialize Plaid. Please try again.');
    } finally {
      setTokenLoading(false);
      tokenFetchInProgress.current = false;
    }
  }, []);

  const onPlaidSuccess = useCallback((public_token, metadata) => {
    setPendingPlaidResult({ publicToken: public_token, metadata });
  }, []);

  const { open: openPlaidLink, ready: plaidReady } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: (err) => {
      if (err) console.error('Plaid Link exit with error:', err);
    },
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate('/signin');
      return;
    }
    const fetchAll = async () => {
      try {
        const [txRes, cardRes] = await Promise.all([
          api.get('/transaction'),
          api.get('/card'),
        ]);
        setTransactions(txRes.data);
        setConnectedCards(cardRes.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setTxLoading(false);
        setCardsLoading(false);
      }
    };
    fetchAll();
  }, [navigate]);

  const refreshTransactions = useCallback(async () => {
    try {
      const res = await api.get('/transaction');
      setTransactions(res.data);
    } catch (err) {
      console.error('Transaction refresh error:', err);
    }
  }, []);

  const addTransaction = async (tx) => {
    try {
      const response = await api.post('/transaction', tx);
      setTransactions((prev) => [response.data, ...prev]);
      setModalOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error.response?.data || error.message);
    }
  };

  const confirmDeleteTransaction = async () => {
    const id = transactionToDelete;
    setTxToDelete(null);
    setIsDeletingId(id);
    try {
      await api.delete(`/transaction/${id}`);
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setIsDeletingId(null);
    }
  };

  const openAddCard = async () => {
    if (connectedCards.length >= MAX_CARDS) return;
    setEditingCard(null);
    setPendingPlaidResult(null);
    setCardModalOpen(true);
    await fetchLinkToken();
  };

  const openEditCard = (card) => {
    setEditingCard(card);
    setPendingPlaidResult(null);
    setCardModalOpen(true);
  };

  const closeCardModal = () => {
    setCardModalOpen(false);
    setEditingCard(null);
    setPendingPlaidResult(null);
    setLinkToken(null);
    setTokenError(null);
  };

  const handleCardConnect = async ({ publicToken, metadata, color, colorFrom, colorTo }) => {
    setCardSaving(true);
    try {
      const res = await api.post('/plaid/exchange', { publicToken, metadata, color, colorFrom, colorTo });
      setConnectedCards((prev) => [...prev, res.data]);
      await refreshTransactions();
      closeCardModal();
    } catch (err) {
      console.error('Card connect error:', err.response?.data || err.message);
    } finally {
      setCardSaving(false);
    }
  };

  const handleCardUpdate = async ({ cardId, color, colorFrom, colorTo }) => {
    setCardSaving(true);
    try {
      const res = await api.put(`/card/${cardId}`, { color, colorFrom, colorTo });
      setConnectedCards((prev) => prev.map((c) => (c.id === cardId ? res.data : c)));
      closeCardModal();
    } catch (err) {
      console.error('Card update error:', err.response?.data || err.message);
    } finally {
      setCardSaving(false);
    }
  };

  const handleCardSync = async (cardId) => {
    setCardSyncing(cardId);
    try {
      await api.post(`/plaid/sync/${cardId}`);
      await refreshTransactions();
    } catch (err) {
      console.error('Sync error:', err.response?.data || err.message);
    } finally {
      setCardSyncing(null);
    }
  };

  const confirmRemoveCard = async () => {
    const id = cardToRemove;
    setCardToRemove(null);
    setCardRemoving(id);
    try {
      await api.delete(`/card/${id}`);
      setConnectedCards((prev) => prev.filter((c) => c.id !== id));
      setTransactions((prev) => prev.filter((tx) => !(tx.cardId === id && tx.source === 'plaid')));
    } catch (err) {
      console.error('Card remove error:', err.response?.data || err.message);
    } finally {
      setCardRemoving(null);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <TransactionsHeader
          onAdd={() => setModalOpen(true)}
          onConnectCard={openAddCard}
          connectedCardCount={connectedCards.length}
        />

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <FontAwesomeIcon icon={faSpinner} spin className={styles.pageSpinner} />
              <p>Loading your transactions...</p>
            </div>
          ) : (
            <>
              <TransactionsSummary transactions={transactions} />
              <ConnectedCards
                cards={connectedCards}
                onAdd={openAddCard}
                onEdit={openEditCard}
                onRemove={(id) => setCardToRemove(id)}
                onSync={handleCardSync}
                removingId={cardRemoving}
                syncingId={cardSyncing}
              />
              <TransactionsTable
                transactions={transactions}
                onDeleteRequest={(id) => setTxToDelete(id)}
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

      <AddCardModal
        isOpen={cardModalOpen}
        onClose={closeCardModal}
        onConnect={handleCardConnect}
        onUpdate={handleCardUpdate}
        editCard={editingCard}
        saving={cardSaving}
        openPlaidLink={openPlaidLink}
        plaidReady={plaidReady}
        tokenLoading={tokenLoading}
        tokenError={tokenError}
        pendingPlaidResult={pendingPlaidResult}
      />

      <ConfirmModal
        isOpen={!!transactionToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={confirmDeleteTransaction}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? It will be permanently removed from your history and budget calculations."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />

      <ConfirmModal
        isOpen={!!cardToRemove}
        onClose={() => setCardToRemove(null)}
        onConfirm={confirmRemoveCard}
        title="Disconnect Card"
        message="Are you sure you want to disconnect this card? It will be removed from your account and all synced transactions will be deleted."
        confirmText="Yes, Disconnect"
        cancelText="Cancel"
      />
    </div>
  );
}