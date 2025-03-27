/**
 * Offer data model for post-purchase upsell offers
 * In a production app, this would likely fetch data from Shopify Admin API
 * or your own database instead of using hardcoded values
 */

const OFFERS = [
  {
    id: 1,
    title: "15% off",
    productTitle: "Adaptil Halsband Gr. S für Welpen und kleine Hunde",
    productImageURL:
      "https://cdn.shopify.com/s/files/1/0677/3830/4797/files/full_adaptilcalmhalsbandsm.png?v=1732896539",
    productDescription: ["Adaptil Halsband Gr. S für Welpen und kleine Hunde"],
    originalPrice: "20.00",
    discountedPrice: "17.00",
    changes: [
      {
        type: "add_variant",
        variantID: 49416542650653, // Replace with your actual variant ID
        quantity: 1,
        discount: {
          value: 15,
          valueType: "percentage",
          title: "15% off",
        },
      },
    ],
  },
];

/**
 * Get all available offers
 *
 * @returns {Array} Array of offer objects
 */
export function getOffers() {
  return OFFERS;
}

/**
 * Get a specific offer by ID
 *
 * @param {number} offerId - The ID of the offer to retrieve
 * @returns {Object|undefined} The offer object or undefined if not found
 */
export function getSelectedOffer(offerId) {
  return OFFERS.find((offer) => offer.id === offerId);
}
