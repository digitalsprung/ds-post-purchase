import { json } from "@remix-run/node";

import { authenticate } from "../shopify.server";
import { getOffers } from "../offer.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Or restrict to specific origins for better security
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Specify allowed methods
  "Access-Control-Allow-Headers": "Content-Type, Authorization", // Specify allowed headers
};

// The loader responds to preflight requests from Shopify
export const loader = async ({ request }) => {
  const { cors } = await authenticate.public(request);

  return cors(json({ message: "Hello World!" }), { headers: corsHeaders });
};

// The action responds to the POST request from the extension. Make sure to use the cors helper for the request to work.
export const action = async ({ request }) => {
  const { cors } = await authenticate.public(request);

  const offers = getOffers();
  return cors(json({ offers }), { headers: corsHeaders });
};
