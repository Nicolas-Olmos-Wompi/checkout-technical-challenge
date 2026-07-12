import React from "react";
import { render, screen, userEvent } from "@testing-library/react-native";
import ProductDetailScreen from "../ProductDetailScreen";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import type { Product } from "../../api/product.types";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

const product: Product = {
  id: "1",
  name: "Bluetooth Headset",
  description: "A comfortable wireless over-ear headset with noise cancellation.",
  price: 150000,
  stock: 5,
  image: "https://example.com/headset.webp",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

async function renderScreen(overrides: Partial<Product> = {}) {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as unknown as Props["navigation"];
  const route = { params: { product: { ...product, ...overrides } } } as Props["route"];

  await render(<ProductDetailScreen navigation={navigation} route={route} />);

  return { navigation };
}

describe("ProductDetailScreen", () => {
  it("renders the product name", async () => {
    await renderScreen();
    expect(screen.getByText("Bluetooth Headset")).toBeTruthy();
  });

  it("renders the product description", async () => {
    await renderScreen();
    expect(
      screen.getByText(
        "A comfortable wireless over-ear headset with noise cancellation.",
      ),
    ).toBeTruthy();
  });

  it("renders the formatted price", async () => {
    await renderScreen();
    expect(screen.getByText("$1.500")).toBeTruthy();
  });

  it("renders the stock", async () => {
    await renderScreen();
    expect(screen.getByText("Stock: 5")).toBeTruthy();
  });

  it("renders the product image when present", async () => {
    await renderScreen();
    expect(screen.getByTestId("product-detail-image")).toBeTruthy();
  });

  it("renders a fallback when image is null", async () => {
    await renderScreen({ image: null });
    expect(screen.getByTestId("product-detail-image-fallback")).toBeTruthy();
  });

  it("navigates back when the back button is pressed", async () => {
    const user = userEvent.setup();
    const { navigation } = await renderScreen();

    await user.press(screen.getByText("Back"));

    expect(navigation.goBack).toHaveBeenCalled();
  });

  it("navigates to Delivery with the product when Buy is pressed", async () => {
    const user = userEvent.setup();
    const { navigation } = await renderScreen();

    await user.press(screen.getByText("Buy"));

    expect(navigation.navigate).toHaveBeenCalledWith("Delivery", { product });
  });
});
