import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from "../../../utils/api"
import styles from './AITips.module.css';

export default function AITips({ period }) {
  const [tips, setTips] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const [summaryRes, categoriesRes] = await Promise.all([
          api.get(`/analytic/summary?period=${period}`),
          api.get(`/analytic/expenses-by-category?period=${period}`)
        ]);

        const summary = summaryRes.data;
        const categories = categoriesRes.data;

        const categoryText = categories
          .map(c => `${c.category}: $${c.amount.toFixed(0)}`)
          .join(', ');
          
        const promptData = `Over the last ${period} months, my average monthly income was $${summary.avgIncome.toFixed(0)} and expenses were $${summary.avgExpenses.toFixed(0)}. My savings rate is ${summary.savingsRate.toFixed(1)}%. My total expenses by category are: ${categoryText}.`;

        const systemPrompt = `You are Finely AI, an expert financial advisor. Based on the user's provided spending summary and category breakdown, provide 3 highly specific, actionable, and short tips to help them optimize their spending or increase their savings. Focus heavily on their highest spending categories. Format the response strictly as a simple HTML unordered list (<ul><li><strong>Tip Title:</strong> Tip description...</li></ul>) without any introductory or concluding text.`;

        const aiRes = await api.post('/ai/chat', {
          system: systemPrompt,
          messages: [{ role: 'user', content: promptData }]
        });

        setTips(aiRes.data.content[0].text);
      } catch (err) {
        console.error("Failed to load AI tips", err);
        setTips("<ul><li>Unable to generate AI insights at this time. Please check back later.</li></ul>");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [period]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={faWandMagicSparkles} />
        </div>
        <h3 className={styles.title}>Finely AI Insights</h3>
      </div>
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
            <span>Analyzing your spending habits for the last {period} months...</span>
          </div>
        ) : (
          <div className={styles.tips} dangerouslySetInnerHTML={{ __html: tips }} />
        )}
      </div>
    </div>
  );
}