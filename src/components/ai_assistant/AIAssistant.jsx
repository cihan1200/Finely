import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faWandMagicSparkles,
  faChevronDown,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import styles from './AIAssistant.module.css';

const SYSTEM_PROMPT = `You are Finely AI, a personal finance assistant built into Finely — a full-stack finance tracker app. You have deep knowledge of how the app works, its pages, and its backend logic.

## App Overview
Finely is a React + Node.js/Express + MongoDB finance tracker. The frontend uses Vite, React Router, CSS Modules, and FontAwesome. The backend runs on Render (https://finely.onrender.com) and the frontend is deployed on Vercel. Auth uses JWT tokens stored in localStorage under the key "token". User info is stored in localStorage under "finely-user".

## Pages & What They Show

### Dashboard (/dashboard)
The main overview page. Contains 4 sections:
- **Overview cards**: Fetches from GET /analytic/dashboard. Shows 4 cards: Total Balance (all-time income minus expenses), Total Income (current month), Total Expenses (current month), and Savings Rate (current month). Each card shows a % change vs last month.
- **Spending Chart**: A visual chart of spending trends.
- **Budget Progress**: Shows the user's active budgets and how much of each they've used this month.
- **Recent Transactions**: The latest transactions for a quick snapshot.

### Transactions (/transactions)
Full transaction history. Features:
- A summary bar at the top showing total income, total expenses, and net balance for the visible data.
- A searchable, filterable, sortable table with 10 rows per page.
- Filters: All / Income / Expense.
- Sort by: label, category, date (default desc), or amount.
- Categories shown with color-coded badges: Income (green), Food (amber), Utilities (blue), Entertainment (primary), Transport/Health (red), others (neutral).
- Users can add new transactions (label, category, amount, sign: income/expense, date) and delete existing ones.
- Data fetches from GET /transaction, POST /transaction, DELETE /transaction/:id.

### Analytics (/analytics)
Deep financial analysis with a period selector (3, 6, or 12 months). Contains:
- **Summary cards**: Fetches from GET /analytic/summary?period=N. Shows avg monthly income, avg monthly expenses, avg savings rate, and total saved — all compared to the previous equivalent period.
- **Income vs Expenses chart**: Monthly bar/line comparison. Fetches from GET /analytic/income-vs-expenses?period=N.
- **Monthly Trend chart**: Tracks net savings trend over time.
- **Spending by Category**: Pie/donut chart of expense breakdown. Fetches from GET /analytic/expenses-by-category?period=N.
- **Top Expenses**: List of the highest individual expense transactions.
The backend calculates deltas by comparing the selected period to the equally-sized previous period.

### Budgets (/budgets)
Monthly budget management. Features:
- **Summary**: Total budget limit vs total spent this month, and overall status.
- **Budget cards**: Each card shows a category (Food, Entertainment, Transport, etc.) with an icon, a progress bar, amount spent vs limit, and whether it's "On track" or how much over budget it is.
- Budget spending is calculated in real-time by aggregating expense transactions for the current calendar month that match the budget's category.
- Users can create budgets (label, category, icon, color, limit), edit the spending limit inline, and delete budgets.
- Data fetches from GET /budget, POST /budget, PATCH /budget/:id, DELETE /budget/:id.
- Max budget limit is $999,999.

### Export (/exports)
Data export tool. Users can:
- Choose format: CSV (Excel/Sheets compatible), JSON (developer use), or PDF (printable report).
- Choose data: Transactions only, Budgets only, Analytics only, or Everything.
- Choose date range: This month, Last month, Last 3/6 months, This year, or Custom range.
- View export history (past downloads).
- Data fetches from the /export routes on the backend.

## Backend Logic
- All routes are protected with JWT via the verifyToken middleware.
- Transactions have fields: userId, label, category, amount, sign (income/expense), date.
- Budgets have fields: userId, label, category, icon, color, limit. The "spent" value is computed live by aggregating this month's expense transactions matching the budget category.
- Analytics are computed on-the-fly from transaction data — nothing is pre-aggregated.
- Savings rate = (income - expenses) / income * 100 for the period.
- Balance delta = % change in (income - expenses) vs previous month.

## Guidelines
- Be concise, warm, and practical.
- When a user asks about a page or feature, explain it using the actual data and logic described above.
- If they ask about their specific numbers, acknowledge you can't see their live data and guide them to the right page/section.
- For financial advice, be practical and actionable.
- Keep responses short and scannable.`;

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm **Finely AI** — your personal finance assistant. I can help you understand your spending, optimize budgets, or answer any money questions. What's on your mind?",
};

function formatMessage(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/^[-•] (.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  text = text.replace(/\n\n/g, '</p><p>');
  text = text.replace(/\n/g, '<br>');
  return `<p>${text}</p>`;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('finely-ai-messages');
      return saved ? JSON.parse(saved) : [WELCOME_MESSAGE];
    } catch {
      return [WELCOME_MESSAGE];
    }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('finely-ai-messages', JSON.stringify(messages));
    } catch { }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const API_URL = import.meta.env.DEV
        ? 'http://localhost:5000/ai/chat'
        : 'https://finely.onrender.com/ai/chat';

      const token = localStorage.getItem('token');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: newMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await response.json();
      const assistantText =
        data?.content?.find((b) => b.type === 'text')?.text ||
        "Sorry, I couldn't generate a response. Please try again.";

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Something went wrong. Please try again.' },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    if (isLoading) {
      abortRef.current?.abort();
      setIsLoading(false);
    }
    setMessages([WELCOME_MESSAGE]);
    setInput('');
    localStorage.removeItem('finely-ai-messages');
  };

  return (
    <>
      <button
        className={`${styles.trigger} ${isOpen ? styles.triggerHidden : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
      >
        <FontAwesomeIcon icon={faWandMagicSparkles} className={styles.triggerIcon} />
        <span className={styles.triggerLabel}>Ask to assistant</span>
      </button>

      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerAvatar}>
              <FontAwesomeIcon icon={faWandMagicSparkles} />
            </div>
            <div>
              <div className={styles.headerTitle}>Finely AI</div>
              <div className={styles.headerStatus}>
                <span className={styles.statusDot} />
                Finance Assistant
              </div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.iconBtn}
              onClick={resetChat}
              title="New conversation"
              aria-label="Reset conversation"
            >
              <FontAwesomeIcon icon={faRotateRight} />
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
            >
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
          </div>
        </div>

        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
            >
              {msg.role === 'assistant' && (
                <div className={styles.assistantAvatar}>
                  <FontAwesomeIcon icon={faWandMagicSparkles} />
                </div>
              )}
              <div
                className={styles.bubble}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              <div className={styles.assistantAvatar}>
                <FontAwesomeIcon icon={faWandMagicSparkles} />
              </div>
              <div className={`${styles.bubble} ${styles.loadingBubble}`}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className={styles.suggestions}>
            {[
              'How can I reduce spending?',
              'Explain my budget progress',
              'Tips for saving more',
            ].map((s) => (
              <button
                key={s}
                className={styles.suggestion}
                onClick={() => {
                  setInput(s);
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className={styles.inputArea}>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances…"
            rows={1}
            disabled={isLoading}
          />
          <button
            className={styles.sendBtn}
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>

      {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)} />}
    </>
  );
}