import React from "react";
import { render, screen, userEvent } from "@testing-library/react-native";
import FiltersPanel from "../FiltersPanel";

describe("FiltersPanel", () => {
  it("renders the price inputs immediately (no internal toggle)", async () => {
    await render(<FiltersPanel onApply={jest.fn()} onClear={jest.fn()} />);
    expect(screen.getByLabelText("Minimum price")).toBeTruthy();
    expect(screen.getByLabelText("Maximum price")).toBeTruthy();
  });

  it("calls onApply with the entered min/max price when valid", async () => {
    const user = userEvent.setup();
    const onApply = jest.fn();
    await render(<FiltersPanel onApply={onApply} onClear={jest.fn()} />);

    await user.type(screen.getByLabelText("Minimum price"), "100");
    await user.type(screen.getByLabelText("Maximum price"), "500");
    await user.press(screen.getByText("Apply"));

    expect(onApply).toHaveBeenCalledWith({ minPrice: "100", maxPrice: "500" });
  });

  it("shows an inline error and does not call onApply when min is greater than max", async () => {
    const user = userEvent.setup();
    const onApply = jest.fn();
    await render(<FiltersPanel onApply={onApply} onClear={jest.fn()} />);

    await user.type(screen.getByLabelText("Minimum price"), "500");
    await user.type(screen.getByLabelText("Maximum price"), "100");
    await user.press(screen.getByText("Apply"));

    expect(
      screen.getByText("Minimum price must be less than or equal to maximum price"),
    ).toBeTruthy();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("shows an inline error and does not call onApply when a price is not a valid integer", async () => {
    const user = userEvent.setup();
    const onApply = jest.fn();
    await render(<FiltersPanel onApply={onApply} onClear={jest.fn()} />);

    await user.type(screen.getByLabelText("Minimum price"), "abc");
    await user.press(screen.getByText("Apply"));

    expect(screen.getByText("Enter a non-negative whole number")).toBeTruthy();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("calls onClear and resets the input fields when Clear is pressed", async () => {
    const user = userEvent.setup();
    const onClear = jest.fn();
    await render(<FiltersPanel onApply={jest.fn()} onClear={onClear} />);

    await user.type(screen.getByLabelText("Minimum price"), "100");
    await user.press(screen.getByText("Clear"));

    expect(onClear).toHaveBeenCalled();
    expect(screen.getByLabelText("Minimum price").props.value).toBe("");
  });

  it("pre-fills inputs from initialMinPrice/initialMaxPrice props", async () => {
    await render(
      <FiltersPanel
        onApply={jest.fn()}
        onClear={jest.fn()}
        initialMinPrice="200"
        initialMaxPrice="900"
      />,
    );

    expect(screen.getByLabelText("Minimum price").props.value).toBe("200");
    expect(screen.getByLabelText("Maximum price").props.value).toBe("900");
  });
});
