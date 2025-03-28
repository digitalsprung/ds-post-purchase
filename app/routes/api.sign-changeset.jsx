import { json } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { unauthenticated } from "../shopify.server";
import { getSelectedOffer } from "../offer.server";

/**
 * Loader handles preflight requests from Shopify
 */
export const loader = async ({ request }) => {
  return await unauthenticated.loader({ request });
};

/**
 * Action responds to POST requests from the extension
 * Signs the changeset to verify the request came from your app
 */
export const action = async ({ request }) => {
  const { cors } = await unauthenticated.action({ request });

  try {
    const body = await request.json();
    console.log("Received request body:", JSON.stringify(body, null, 2));

    if (!body.referenceId) {
      console.error("Missing referenceId in request");
      return cors(
        json(
          {
            errors: [
              {
                code: "invalid_request",
                message: "Reference ID must be supplied",
              },
            ],
            status: "unprocessed",
          },
          { status: 400 },
        ),
      );
    }

    // Hole die Änderungen anhand der ID aus dem Backend
    const selectedOffer = getSelectedOffer(body.changes);

    console.log("Selected Offer:", selectedOffer);
    console.log(
      "Offer ID received:",
      body.changes,
      "Type:",
      typeof body.changes,
    );

    // Wenn kein Angebot gefunden wurde, verwende Fallback-Änderungen
    if (!selectedOffer) {
      console.warn(
        "No offer found with ID:",
        body.changes,
        "Using fallback changes",
      );
    }

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
      iat: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
      sub: body.referenceId,
      changes: changes, // Verwende die Änderungen aus dem Backend oder Fallback
    };

    console.log("Final payload:", JSON.stringify(payload, null, 2));

    const token = jwt.sign(payload, process.env.SHOPIFY_API_SECRET);
    return cors(json({ token }));
  } catch (error) {
    console.error("Error processing request:", error);
    return cors(
      json(
        {
          errors: [{ code: "server_error", message: "Internal server error" }],
          status: "unprocessed",
        },
        { status: 500 },
      ),
    );
  }
};
