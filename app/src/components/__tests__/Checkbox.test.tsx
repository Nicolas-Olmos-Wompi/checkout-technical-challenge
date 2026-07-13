import React from "react";
import { Text } from "react-native";
import { render, screen, userEvent } from "@testing-library/react-native";
import Checkbox from "../Checkbox";

describe("Checkbox", () => {
  it("renders the provided label", async () => {
    await render(<Checkbox checked={false} onToggle={jest.fn()} label="Accept terms" />);
    expect(screen.getByText("Accept terms")).toBeTruthy();
  });

  it("renders children instead of label when provided", async () => {
    await render(
      <Checkbox checked={false} onToggle={jest.fn()}>
        <Text>Custom content</Text>
      </Checkbox>,
    );
    expect(screen.getByText("Custom content")).toBeTruthy();
  });

  it("exposes accessibilityState.checked matching the checked prop", async () => {
    await render(
      <Checkbox checked testID="my-checkbox" onToggle={jest.fn()} label="Accept terms" />,
    );
    const checkbox = screen.getByTestId("my-checkbox");
    expect(checkbox.props.accessibilityState).toEqual({ checked: true });
  });

  it("calls onToggle with true when unchecked and pressed", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    await render(
      <Checkbox checked={false} onToggle={onToggle} label="Accept terms" testID="my-checkbox" />,
    );

    await user.press(screen.getByTestId("my-checkbox"));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("calls onToggle with false when checked and pressed", async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    await render(
      <Checkbox checked onToggle={onToggle} label="Accept terms" testID="my-checkbox" />,
    );

    await user.press(screen.getByTestId("my-checkbox"));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it("has accessibilityRole checkbox", async () => {
    await render(
      <Checkbox checked={false} onToggle={jest.fn()} label="Accept terms" testID="my-checkbox" />,
    );
    expect(screen.getByTestId("my-checkbox").props.accessibilityRole).toBe("checkbox");
  });
});
