import React from "react";
import { Linking } from "react-native";
import { render, screen, userEvent } from "@testing-library/react-native";
import AcceptanceCheckbox from "../AcceptanceCheckbox";

jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);

describe("AcceptanceCheckbox", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the label and link text", async () => {
    await render(
      <AcceptanceCheckbox
        label="I accept the"
        linkText="Terms and Conditions"
        url="https://example.com/terms"
        checked={false}
        onToggle={jest.fn()}
      />,
    );
    expect(screen.getByText(/I accept the/)).toBeTruthy();
    expect(screen.getByText("Terms and Conditions")).toBeTruthy();
  });

  it("opens the url when the link text is pressed", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    await render(
      <AcceptanceCheckbox
        label="I accept the"
        linkText="Terms and Conditions"
        url="https://example.com/terms"
        checked={false}
        onToggle={onToggle}
        testID="terms-checkbox"
      />,
    );

    await user.press(screen.getByTestId("terms-checkbox-link"));

    expect(Linking.openURL).toHaveBeenCalledTimes(1);
    expect(Linking.openURL).toHaveBeenCalledWith("https://example.com/terms");
  });

  it("does not toggle the checkbox when the link text is pressed", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    await render(
      <AcceptanceCheckbox
        label="I accept the"
        linkText="Terms and Conditions"
        url="https://example.com/terms"
        checked={false}
        onToggle={onToggle}
        testID="terms-checkbox"
      />,
    );

    await user.press(screen.getByTestId("terms-checkbox-link"));

    expect(onToggle).not.toHaveBeenCalled();
  });

  it("toggles the checkbox when the row is pressed without opening the url", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    await render(
      <AcceptanceCheckbox
        label="I accept the"
        linkText="Terms and Conditions"
        url="https://example.com/terms"
        checked={false}
        onToggle={onToggle}
        testID="terms-checkbox"
      />,
    );

    await user.press(screen.getByTestId("terms-checkbox"));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(Linking.openURL).not.toHaveBeenCalled();
  });
});
