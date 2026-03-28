import { PlaidApi, PlaidEnvironments, Configuration } from "plaid";

const clientId = process.env.PLAID_CLIENT_ID || process.env.CLIENT_ID;
const secret   = process.env.PLAID_SECRET    || process.env.SANDBOX_SECRET;
const env      = process.env.PLAID_ENV       || "sandbox";

if (!clientId || !secret) {
  console.error(
    "[Plaid] Missing credentials. Set PLAID_CLIENT_ID and PLAID_SECRET (or CLIENT_ID / SANDBOX_SECRET) in your .env file."
  );
}

const configuration = new Configuration({
  basePath: PlaidEnvironments[env],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": clientId,
      "PLAID-SECRET":    secret,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);