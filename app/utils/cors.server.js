/**
 * CORS-Header für die Shopify Post-Purchase Extension
 * Diese Header erlauben Cross-Origin-Anfragen von Shopify-Domains
 */

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // In Produktion sollte dies auf die spezifischen Shopify-Domains beschränkt werden
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Shopify-Access-Token",
  "Access-Control-Max-Age": "86400", // 24 Stunden
};
