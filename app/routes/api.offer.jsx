import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getOffers } from "../offer.server";

// Der Loader behandelt Preflight-Anfragen von Shopify
export const loader = async ({ request }) => {
  const { cors } = await authenticate.public(request);
  return cors(json({}));
};

// Der Action-Handler verarbeitet POST-Anfragen von der Extension
export const action = async ({ request }) => {
  const { cors } = await authenticate.public(request);

  try {
    const offers = getOffers();
    console.log("Verfügbare Angebote:", offers.length);
    return cors(json({ offers }));
  } catch (error) {
    console.error("Fehler beim Abrufen der Angebote:", error);
    return cors(
      json(
        {
          errors: [{ code: "server_error", message: "Interner Serverfehler" }],
        },
        { status: 500 },
      ),
    );
  }
};
