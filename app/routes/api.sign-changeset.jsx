import { json } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { authenticate } from "../shopify.server";
import { getSelectedOffer } from "../offer.server";

/**
 * Loader handles preflight requests from Shopify
 */
export const loader = async ({ request }) => {
  await authenticate.public(request);
};

/**
 * Action responds to POST requests from the extension
 * Signs the changeset to verify the request came from your app
 */
export const action = async ({ request }) => {
  const { cors } = await authenticate.public(request);

  const body = await request.json();

  // Hole die Änderungen anhand der ID aus dem Backend
  const selectedOffer = getSelectedOffer(body.changes);

  console.log("Selected Offer:", selectedOffer);
  console.log("Offer ID received:", body.changes);

  // Wenn kein Angebot gefunden wurde, verwende Fallback-Änderungen
  const changes = selectedOffer?.changes || [
    {
      type: "add_variant",
      variantID: 49416542650653,
      quantity: 1,
      discount: {
        value: 15,
        valueType: "percentage",
        title: "15% off",
      },
    },
  ];

  const payload = {
    iss: process.env.SHOPIFY_API_KEY,
    jti: uuidv4(),
    iat: Date.now(),
    sub: body.referenceId,
    changes: changes, // Verwende die Änderungen aus dem Backend oder Fallback
  };

  console.log("Final payload:", JSON.stringify(payload, null, 2));

  const token = jwt.sign(payload, process.env.SHOPIFY_API_SECRET);
  return cors(json({ token }));
};
