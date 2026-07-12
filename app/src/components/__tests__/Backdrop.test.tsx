import React from "react";
import { Text } from "react-native";
import { render, screen, userEvent } from "@testing-library/react-native";
import Backdrop from "../Backdrop";

describe("Backdrop", () => {
  it("hides the back layer by default", async () => {
    await render(
      <Backdrop
        toggleLabel="Filters"
        backLayer={<Text>Back layer content</Text>}
        frontLayer={<Text>Front layer content</Text>}
      />,
    );

    expect(screen.queryByText("Back layer content")).toBeNull();
  });

  it("always renders the front layer, even before toggling", async () => {
    await render(
      <Backdrop
        toggleLabel="Filters"
        backLayer={<Text>Back layer content</Text>}
        frontLayer={<Text>Front layer content</Text>}
      />,
    );

    expect(screen.getByText("Front layer content")).toBeTruthy();
  });

  it("reveals the back layer when the toggle is pressed", async () => {
    const user = userEvent.setup();
    await render(
      <Backdrop
        toggleLabel="Filters"
        backLayer={<Text>Back layer content</Text>}
        frontLayer={<Text>Front layer content</Text>}
      />,
    );

    await user.press(screen.getByText("Filters"));

    expect(screen.getByText("Back layer content")).toBeTruthy();
  });

  it("keeps the front layer rendered after the back layer is revealed", async () => {
    const user = userEvent.setup();
    await render(
      <Backdrop
        toggleLabel="Filters"
        backLayer={<Text>Back layer content</Text>}
        frontLayer={<Text>Front layer content</Text>}
      />,
    );

    await user.press(screen.getByText("Filters"));

    expect(screen.getByText("Front layer content")).toBeTruthy();
  });

  it("hides the back layer again when the toggle is pressed a second time", async () => {
    const user = userEvent.setup();
    await render(
      <Backdrop
        toggleLabel="Filters"
        backLayer={<Text>Back layer content</Text>}
        frontLayer={<Text>Front layer content</Text>}
      />,
    );

    await user.press(screen.getByText("Filters"));
    await user.press(screen.getByText("Filters"));

    expect(screen.queryByText("Back layer content")).toBeNull();
  });

  it("renders a custom toggleLabel", async () => {
    await render(
      <Backdrop
        toggleLabel="Order summary"
        backLayer={<Text>Back layer content</Text>}
        frontLayer={<Text>Front layer content</Text>}
      />,
    );

    expect(screen.getByText("Order summary")).toBeTruthy();
  });

  it("starts revealed when initiallyRevealed is true", async () => {
    await render(
      <Backdrop
        toggleLabel="Filters"
        initiallyRevealed
        backLayer={<Text>Back layer content</Text>}
        frontLayer={<Text>Front layer content</Text>}
      />,
    );

    expect(screen.getByText("Back layer content")).toBeTruthy();
  });

  it("exposes testIDs for the toggle, back layer and front layer", async () => {
    await render(
      <Backdrop
        toggleLabel="Filters"
        initiallyRevealed
        backLayer={<Text>Back layer content</Text>}
        frontLayer={<Text>Front layer content</Text>}
      />,
    );

    expect(screen.getByTestId("backdrop-toggle")).toBeTruthy();
    expect(screen.getByTestId("backdrop-back-layer")).toBeTruthy();
    expect(screen.getByTestId("backdrop-front-layer")).toBeTruthy();
  });

  it("applies an animated transform style to the front layer to drive the slide transition", async () => {
    await render(
      <Backdrop
        toggleLabel="Filters"
        initiallyRevealed
        backLayer={<Text>Back layer content</Text>}
        frontLayer={<Text>Front layer content</Text>}
      />,
    );

    const frontLayer = screen.getByTestId("backdrop-front-layer");
    const style = Array.isArray(frontLayer.props.style)
      ? frontLayer.props.style
      : [frontLayer.props.style];
    const hasTransform = style.some(
      (s: unknown) =>
        s !== null && typeof s === "object" && "transform" in (s as Record<string, unknown>),
    );

    expect(hasTransform).toBe(true);
  });

  it("applies a custom container style when the style prop is provided, for callers that don't want it to flex-fill", async () => {
    await render(
      <Backdrop
        toggleLabel="Filters"
        style={{ flex: 0 }}
        backLayer={<Text>Back layer content</Text>}
        frontLayer={null}
      />,
    );

    const container = screen.getByTestId("backdrop-container");
    const style = Array.isArray(container.props.style)
      ? container.props.style
      : [container.props.style];
    const hasFlexZero = style.some(
      (s: unknown) => s !== null && typeof s === "object" && (s as { flex?: number }).flex === 0,
    );

    expect(hasFlexZero).toBe(true);
  });
});
