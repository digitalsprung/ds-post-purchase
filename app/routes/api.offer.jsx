import { authenticate } from "../shopify.server";
import { getOffers } from "../offer.server";
import { json } from "@remix-run/node";
import { corsHeaders } from "../utils/cors.server";

/**
 * Loader handles preflight requests from Shopify
 */
export const loader = async ({ request }) => {
  // Für OPTIONS Preflight-Anfragen
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  await authenticate.public(request);
  return json({}, { headers: corsHeaders });
};

/**
 * Action responds to POST requests from the extension
 * Returns available offers for post-purchase upsell
 */
export const action = async ({ request }) => {
  const { cors } = await authenticate.public(request);

  try {
    const offers = getOffers();
    console.log("Available offers:", JSON.stringify(offers, null, 2));

    // Kombiniere die CORS-Header mit denen, die von Shopify bereitgestellt werden
    return cors(json({ offers }, { headers: corsHeaders }));
  } catch (error) {
    console.error("Error fetching offers:", error);
    return cors(
      json(
        {
          errors: [{ code: "server_error", message: "Internal server error" }],
        },
        { status: 500, headers: corsHeaders },
      ),
    );
  }
};
