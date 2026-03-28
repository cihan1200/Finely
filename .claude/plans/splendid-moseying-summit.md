# Plan: Prevent AI Tips Generation When No Transaction Data

## Context
The AI insights section on the analytics page currently attempts to generate tips even when there is no transaction data. This results in unnecessary API calls and meaningless AI responses based on zero financial data. The goal is to show a user-friendly message when there are no transactions instead of generating tips.

## Current Implementation
- `src/pages/analytics/sections/AITips.jsx` fetches:
  - `/analytic/summary?period=${period}` → returns stats object with avgIncome, avgExpenses, etc.
  - `/analytic/expenses-by-category?period=${period}` → returns array of expense categories
- When no transactions exist:
  - summary returns: `{avgIncome: 0, avgExpenses: 0, savingsRate: 0, ...}`
  - categories returns: `[]` (empty array)
- Currently, AI is still called with this zero data, which is wasteful and unhelpful

## Proposed Solution
Modify `AITips.jsx` to:
1. After fetching both data sources, check if there's meaningful transaction data
2. Define "no data" as:
   - Both `avgIncome` and `avgExpenses` are 0 (or very small threshold)
   - AND categories array is empty or has negligible amounts
3. If no data, skip AI API call and display a friendly message prompting user to add transactions
4. If data exists, proceed with current AI tip generation logic

## Files to Modify
- `src/pages/analytics/sections/AITips.jsx`

## Implementation Details
1. Add a state variable `hasData` to track whether transactions exist
2. After fetching data, check:
   ```javascript
   const hasTransactions = categories.length > 0 && (summary.avgIncome > 0 || summary.avgExpenses > 0);
   ```
3. If `hasTransactions` is false:
   - Set tips to a static message: "Add transactions to get personalized AI insights"
   - Set loading to false
   - Skip the AI API call
4. Update the render to show either the loading, tips, or "no data" message

## Testing
1. Run the app and navigate to analytics page with no transactions
2. Verify AI tips section shows a message like "Add transactions to get personalized AI insights"
3. Add some transactions and verify AI tips generate normally
4. Check console to ensure no AI API calls are made when there's no data
