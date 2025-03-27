import { json } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

import { authenticate } from "../shopify.server";
import { getSelectedOffer } from "../models/offer.server";

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

  const selectedOffer = getSelectedOffer(body.changes);

  const payload = {
    iss: process.env.SHOPIFY_API_KEY,
    jti: uuidv4(),
    iat: Date.now(),
    sub: body.referenceId,
    changes: selectedOffer?.changes,
  };

  const token = jwt.sign(payload, process.env.SHOPIFY_API_SECRET);
  return cors(json({ token }));
};
