import dotenv from "dotenv";
dotenv.config();

import { createPaypalProductAndPlan, getPaypalConfig } from "../api/services/paypal";

async function main() {
  const cfg = getPaypalConfig();
  if (!cfg.clientId || !cfg.clientSecret) {
    console.error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in environment.");
    process.exit(1);
  }

  console.log(`Creating AI FrontDesk $5/mo Product + Plan in PayPal (${cfg.env}) at ${cfg.apiBase}...`);
  const { productId, planId } = await createPaypalProductAndPlan({
    productName: "AI FrontDesk Chatbot",
    planName: "AI FrontDesk ($5/month)",
    priceUsd: "5.00"
  });

  console.log("\nDone! Add these to your .env and Vercel Environment Variables:\n");
  console.log(`PAYPAL_PRODUCT_ID=${productId}`);
  console.log(`PAYPAL_PLAN_ID=${planId}`);
}

main().catch((err) => {
  console.error("PayPal setup error:", err?.message || err);
  process.exit(1);
});
