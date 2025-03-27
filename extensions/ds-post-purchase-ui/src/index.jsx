import { useEffect, useState } from "react";
import {
  extend,
  render,
  useExtensionInput,
  BlockStack,
  Button,
  CalloutBanner,
  Heading,
  Image,
  Text,
  TextContainer,
  Separator,
  Tiles,
  TextBlock,
  Layout,
} from "@shopify/post-purchase-ui-extensions-react";

// Updated to use the deployed app URL
const APP_URL = "https://ai-content-tool.ds-apps.de"

// Preload data from your app server to ensure that the extension loads quickly.
extend(
  "Checkout::PostPurchase::ShouldRender",
  async ({ inputData, storage }) => {
    try {
      const postPurchaseOffer = await fetch(`${APP_URL}/api/offer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${inputData.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceId: inputData.initialPurchase.referenceId,
        }),
      }).then((response) => response.json());

      await storage.update(postPurchaseOffer);
    } catch (error) {
      console.error("Error fetching offers:", error);
      // Fallback offer data
      await storage.update({
        offers: [
          {
            id: 1,
            title: "15% off",
            productTitle: "Adaptil Halsband Gr. S für Welpen und kleine Hunde",
            productImageURL:
              "https://cdn.shopify.com/s/files/1/0677/3830/4797/files/full_adaptilcalmhalsbandsm.png?v=1732896539",
            productDescription: [
              "Adaptil Halsband Gr. S für Welpen und kleine Hunde",
            ],
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
        ],
      });
    }

    // Immer die Post-Purchase UI anzeigen für Testzwecke
    return { render: true };
  },
);

render("Checkout::PostPurchase::Render", () => <App />);

export function App() {
  const { storage, inputData, calculateChangeset, applyChangeset, done } =
    useExtensionInput();
  const [loading, setLoading] = useState(true);
  const [calculatedPurchase, setCalculatedPurchase] = useState();

  const { offers } = storage.initialData;

  const purchaseOption = offers[0];

  // Define the changes that you want to make to the purchase, including the discount to the product.
  useEffect(() => {
    async function calculatePurchase() {
      // Call Shopify to calculate the new price of the purchase, if the above changes are applied.
      const result = await calculateChangeset({
        changes: purchaseOption.changes,
      });

      setCalculatedPurchase(result.calculatedPurchase);
      setLoading(false);
    }

    calculatePurchase();
  }, [calculateChangeset, purchaseOption.changes]);

  // Extract values from the calculated purchase.
  const shipping =
    calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney
      ?.amount;
  const taxes =
    calculatedPurchase?.addedTaxLines[0]?.priceSet?.presentmentMoney?.amount;
  const total = calculatedPurchase?.totalOutstandingSet.presentmentMoney.amount;
  const discountedPrice =
    calculatedPurchase?.updatedLineItems[0].totalPriceSet.presentmentMoney
      .amount;
  const originalPrice =
    calculatedPurchase?.updatedLineItems[0].priceSet.presentmentMoney.amount;

  async function acceptOffer() {
    setLoading(true);

    // Make a request to your app server to sign the changeset with your app's API secret key.
    const token = await fetch(`${APP_URL}/api/sign-changeset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${inputData.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referenceId: inputData.initialPurchase.referenceId,
        changes: purchaseOption.id, // Sende die ID, das Backend holt die Änderungen
      }),
    })
      .then((response) => response.json())
      .then((response) => response.token)
      .catch((e) => console.log(e));

    // Make a request to Shopify servers to apply the changeset.
    await applyChangeset(token);

    // Redirect to the thank-you page.
    done();
  }

  function declineOffer() {
    setLoading(true);
    // Redirect to the thank-you page
    done();
  }

  return (
    <BlockStack spacing="loose">
      <CalloutBanner>
        <BlockStack spacing="tight">
          <TextContainer>
            <Text size="medium" emphasized>
              It&#39;s not too late to add this to your order
            </Text>
          </TextContainer>
          <TextContainer>
            <Text size="medium">
              Add the {purchaseOption.productTitle} to your order and{" "}
            </Text>
            <Text size="medium" emphasized>
              {purchaseOption.changes[0].discount.title}
            </Text>
          </TextContainer>
        </BlockStack>
      </CalloutBanner>
      <Layout
        media={[
          { viewportSize: "small", sizes: [1, 0, 1], maxInlineSize: 0.9 },
          { viewportSize: "medium", sizes: [532, 0, 1], maxInlineSize: 420 },
          { viewportSize: "large", sizes: [560, 38, 340] },
        ]}
      >
        <Image
          description="product photo"
          source={purchaseOption.productImageURL}
        />
        <BlockStack />
        <BlockStack>
          <Heading>{purchaseOption.productTitle}</Heading>
          <PriceHeader
            discountedPrice={discountedPrice}
            originalPrice={originalPrice}
            loading={!calculatedPurchase}
          />
          <ProductDescription textLines={purchaseOption.productDescription} />
          <BlockStack spacing="tight">
            <Separator />
            <MoneyLine
              label="Subtotal"
              amount={discountedPrice}
              loading={!calculatedPurchase}
            />
            <MoneyLine
              label="Shipping"
              amount={shipping}
              loading={!calculatedPurchase}
            />
            <MoneyLine
              label="Taxes"
              amount={taxes}
              loading={!calculatedPurchase}
            />
            <Separator />
            <MoneySummary label="Total" amount={total} />
          </BlockStack>
          <BlockStack>
            <Button onPress={acceptOffer} submit loading={loading}>
              Pay now · {formatCurrency(total)}
            </Button>
            <Button onPress={declineOffer} subdued loading={loading}>
              Decline this offer
            </Button>
          </BlockStack>
        </BlockStack>
      </Layout>
    </BlockStack>
  );
}

function PriceHeader({ discountedPrice, originalPrice, loading }) {
  return (
    <TextContainer alignment="leading" spacing="loose">
      <Text role="deletion" size="large">
        {!loading && formatCurrency(originalPrice)}
      </Text>
      <Text emphasized size="large" appearance="critical">
        {" "}
        {!loading && formatCurrency(discountedPrice)}
      </Text>
    </TextContainer>
  );
}

function ProductDescription({ textLines }) {
  return (
    <BlockStack spacing="xtight">
      {textLines.map((text, index) => (
        <TextBlock key={index} subdued>
          {text}
        </TextBlock>
      ))}
    </BlockStack>
  );
}

function MoneyLine({ label, amount, loading = false }) {
  return (
    <Tiles>
      <TextBlock size="small">{label}</TextBlock>
      <TextContainer alignment="trailing">
        <TextBlock emphasized size="small">
          {loading ? "-" : formatCurrency(amount)}
        </TextBlock>
      </TextContainer>
    </Tiles>
  );
}

function MoneySummary({ label, amount }) {
  return (
    <Tiles>
      <TextBlock size="medium" emphasized>
        {label}
      </TextBlock>
      <TextContainer alignment="trailing">
        <TextBlock emphasized size="medium">
          {formatCurrency(amount)}
        </TextBlock>
      </TextContainer>
    </Tiles>
  );
}

function formatCurrency(amount) {
  if (!amount || parseInt(amount, 10) === 0) {
    return "Free";
  }
  return `$${amount}`;
}
