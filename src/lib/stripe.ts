import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";

export const STRIPE_CONFIG = {
  successUrl: `${process.env.NEXT_PUBLIC_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${process.env.NEXT_PUBLIC_URL}/payment/cancel`,
};
