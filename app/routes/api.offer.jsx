import { authenticate } from "../shopify.server";
import { getOffers } from "../models/offer.server";
import { json } from "@remix-run/react";

/**
 * Loader handles preflight requests from Shopify
 */
export const loader = async ({ request }) => {
  await authenticate.public(request);
};

/**
 * Action responds to POST requests from the extension
 * Returns available offers for post-purchase upsell
 */
export const action = async ({ request }) => {
  const { cors } = await authenticate.public(request);

  const offers = getOffers();
  return cors(json({ offers }));
};
