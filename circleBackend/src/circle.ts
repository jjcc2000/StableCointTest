import axios from "axios";
import 'dotenv/config';

const baseURL = process.env.CIRCLE_BASE_URL || "https://api-sandbox.circle.com";
const api = axios.create({
  baseURL: `${baseURL}/v1`,
  headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}` },
});

export async function createPaymentIntent(params: {
  amount: string;
  currency: "USD";
  walletAddress: string;
  description?: string;
}) {
  const body = {
    amount: { amount: params.amount, currency: params.currency },
    settlementCurrency: params.currency,
    paymentMethods: [{ type: "card" }],
    metadata: { walletAddress: params.walletAddress, description: params.description ?? "Top-up" },
    capture: true
  };
  const { data } = await api.post("/paymentIntents", body);
  return data;
}

export async function createPayout(params: {
  amount: string;
  currency: "USD";
  beneficiaryId: string;
  description?: string;
}) {
  const body = {
    amount: { amount: params.amount, currency: params.currency },
    destination: { type: "beneficiary", id: params.beneficiaryId },
    metadata: { description: params.description ?? "Payout" }
  };
  const { data } = await api.post("/payouts", body);
  return data;
}
