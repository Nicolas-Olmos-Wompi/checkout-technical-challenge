import React from "react";
import { render, screen, userEvent } from "@testing-library/react-native";
import ProductCard from "../ProductCard";
import type { Product } from "../../api/product.types";

const product: Product = {
  id: "1",
  name: "Bluetooth Headset",
  description: "Wireless over-ear headset",
  price: 150000,
  stock: 5,
  image: "https://example.com/headset.webp",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("ProductCard", () => {
  it("renders the product name", async () => {
    await render(<ProductCard product={product} onPress={jest.fn()} />);
    expect(screen.getByText("Bluetooth Headset")).toBeTruthy();
  });

  it("renders the formatted COP price", async () => {
    await render(<ProductCard product={product} onPress={jest.fn()} />);
    expect(screen.getByText("$1.500")).toBeTruthy();
  });

  it("renders the stock count", async () => {
    await render(<ProductCard product={product} onPress={jest.fn()} />);
    expect(screen.getByText("Stock: 5")).toBeTruthy();
  });

  it("renders the product image when present", async () => {
    await render(<ProductCard product={product} onPress={jest.fn()} />);
    expect(screen.getByTestId("product-card-image")).toBeTruthy();
  });

  it("renders a fallback placeholder when image is null", async () => {
    await render(
      <ProductCard product={{ ...product, image: null }} onPress={jest.fn()} />,
    );
    expect(screen.queryByTestId("product-card-image")).toBeNull();
    expect(screen.getByTestId("product-card-image-fallback")).toBeTruthy();
  });

  it("calls onPress with the product when tapped", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<ProductCard product={product} onPress={onPress} />);

    await user.press(screen.getByTestId("product-card"));

    expect(onPress).toHaveBeenCalledWith(product);
  });
});
