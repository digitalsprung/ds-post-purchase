import { unauthenticated } from "../shopify.server";
import { getOffers } from "../offer.server";
import { json } from "@remix-run/node";

/**
 * Loader handles preflight requests from Shopify
 */
export const loader = async ({ request }) => {
  return await unauthenticated.loader({ request });
};

/**
 * Action responds to POST requests from the extension
 * Returns available offers for post-purchase upsell
 */
export const action = async ({ request }) => {
  const { cors } = await unauthenticated.action({ request });

  try {
    const offers = getOffers();
    console.log("Available offers:", JSON.stringify(offers, null, 2));
    
    return cors(json({ offers }));
  } catch (error) {
    console.error("Error fetching offers:", error);
    return cors(json({ 
      errors: [{ code: "server_error", message: "Internal server error" }]
    }, { status: 500 }));
  }
};
