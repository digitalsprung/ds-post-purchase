import { json } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { authenticate } from "../shopify.server";
import { getSelectedOffer } from "../offer.server";

// Der Loader behandelt Preflight-Anfragen von Shopify
export const loader = async ({ request }) => {
  const { cors } = await authenticate.public(request);
  return cors(json({}));
};

// Der Action-Handler verarbeitet POST-Anfragen von der Extension
export const action = async ({ request }) => {
  const { cors } = await authenticate.public(request);

  try {
    const body = await request.json();

    // Hole das ausgewählte Angebot anhand der ID
    const selectedOffer = getSelectedOffer(body.changes);
    console.log(
      "Angebot gefunden:",
      selectedOffer ? "Ja" : "Nein",
      "ID:",
      body.changes,
    );

    // Fallback für den Fall, dass keine Änderungen gefunden wurden
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

    // JWT-Payload erstellen
    const payload = {
      iss: process.env.SHOPIFY_API_KEY,
      jti: uuidv4(),
      iat: Math.floor(Date.now() / 1000), // Unix-Timestamp in Sekunden
      sub: body.referenceId,
      changes: changes,
    };

    // Token signieren und zurückgeben
    const token = jwt.sign(payload, process.env.SHOPIFY_API_SECRET);
    return cors(json({ token }));
  } catch (error) {
    console.error("Fehler bei der Verarbeitung:", error);
    return cors(
      json(
        {
          errors: [{ code: "server_error", message: "Interner Serverfehler" }],
          status: "unprocessed",
        },
        { status: 500 },
      ),
    );
  }
};
