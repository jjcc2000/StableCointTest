import express from "express";
import cors from "cors";
import 'dotenv/config';
import { z } from "zod";
import { createPaymentIntent, createPayout } from "./circle";
import { contract, toUnits } from "./chain";
import { ethers } from "ethers";

const app = express();
app.use(cors());
app.use(express.json());


// Create payment intent
app.post("/payments/create-intent", async (req, res) => {
  try {
    const schema = z.object({
      amount: z.string(),
      currency: z.literal("USD"),
      walletAddress: z.string().refine((v) => ethers.isAddress(v), "Invalid address"),
      description: z.string().optional()
    });
    const input = schema.parse(req.body);
    const result = await createPaymentIntent(input);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Your expected webhook route (accept both with/without trailing slash)
app.post(["/webhooks/circle", "/webhooks/circle/"], (req, res) => {
  console.log("✅ Received Circle webhook payload:", JSON.stringify(req.body, null, 2));
  // Always return 200 quickly so Circle accepts the endpoint
  res.status(200).send("OK");
});

app.post("/", (req, res) => {
  console.log("✅ Received Circle webhook payload:", JSON.stringify(req.body, null, 2));
  res.status(200).send("OK");
});
// Webhook from Circle
// app.post("/webhooks/circle", async (req, res) => {
//   try {
//     console.log("Received Circle webhook:", req.body);
//     const event = req.body;
//     const type: string = event?.type || "";
//     const metadata = event?.data?.metadata || {};
//     const walletAddress: string | undefined = metadata.walletAddress;
//     const fiatAmount: string | undefined = event?.data?.amount?.amount;

//     const isSuccess =
//       type.includes("payment") &&
//       (type.includes("captured") || type.includes("succeeded"));

//     if (isSuccess && walletAddress && fiatAmount) {
//       const tx = await contract.mint(walletAddress, toUnits(fiatAmount));
//       await tx.wait();
//       console.log(`Minted ${fiatAmount} tokens to ${walletAddress}`);
//     }
//     res.status(200).send("OK");

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });

// Burn + payout
app.post("/redeem/burn-and-payout", async (req, res) => {
  try {
    const schema = z.object({
      burnAmount: z.string(),
      payoutAmountUSD: z.string(),
      beneficiaryId: z.string()
    });
    const input = schema.parse(req.body);

    const burnTx = await contract.burn(toUnits(input.burnAmount));
    await burnTx.wait();

    const payout = await createPayout({
      amount: input.payoutAmountUSD,
      currency: "USD",
      beneficiaryId: input.beneficiaryId
    });

    res.json({ burnTx: burnTx.hash, payout });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
