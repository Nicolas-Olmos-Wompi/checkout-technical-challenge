import React from "react";
import { render, screen } from "@testing-library/react-native";
import CardBrandLogo from "../CardBrandLogo";

describe("CardBrandLogo", () => {
  it("renders a Visa badge", async () => {
    await render(<CardBrandLogo brand="VISA" />);
    expect(screen.getByTestId("card-brand-logo-visa")).toBeTruthy();
  });

  it("renders a Mastercard badge", async () => {
    await render(<CardBrandLogo brand="MASTERCARD" />);
    expect(screen.getByTestId("card-brand-logo-mastercard")).toBeTruthy();
  });

  it("renders an Amex badge", async () => {
    await render(<CardBrandLogo brand="AMEX" />);
    expect(screen.getByTestId("card-brand-logo-amex")).toBeTruthy();
  });

  it("renders a Diners Club badge", async () => {
    await render(<CardBrandLogo brand="DINERS" />);
    expect(screen.getByTestId("card-brand-logo-diners")).toBeTruthy();
  });

  it("renders a Discover badge", async () => {
    await render(<CardBrandLogo brand="DISCOVER" />);
    expect(screen.getByTestId("card-brand-logo-discover")).toBeTruthy();
  });

  it("renders a generic placeholder for an unknown brand", async () => {
    await render(<CardBrandLogo brand="UNKNOWN" />);
    expect(screen.getByTestId("card-brand-logo-unknown")).toBeTruthy();
  });

  it("sets an accessibility label describing the brand", async () => {
    await render(<CardBrandLogo brand="VISA" />);
    expect(screen.getByLabelText("Visa card")).toBeTruthy();
  });

  it("sets a generic accessibility label for unknown brand", async () => {
    await render(<CardBrandLogo brand="UNKNOWN" />);
    expect(screen.getByLabelText("Card")).toBeTruthy();
  });
});
