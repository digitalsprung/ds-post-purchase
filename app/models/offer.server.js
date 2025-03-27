/**
 * Offer data model for post-purchase upsell offers
 * In a production app, this would likely fetch data from Shopify Admin API
 * or your own database instead of using hardcoded values
 */

const OFFERS = [
  {
    id: 1,
    title: "One time offer",
    productTitle: "The S-Series Snowboard",
    productImageURL:
      "https://cdn.shopify.com/s/files/1/0595/9788/1543/products/s-series-snowboard.jpg",
    productDescription: ["This PREMIUM snowboard is so SUPER DUPER awesome!"],
    originalPrice: "699.95",
    discountedPrice: "699.95",
    changes: [
      {
        type: "add_variant",
        variantID: 123456789, // Replace with your actual variant ID
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
