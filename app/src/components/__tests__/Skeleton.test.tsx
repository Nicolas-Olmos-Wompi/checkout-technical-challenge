import React from "react";
import { render, screen } from "@testing-library/react-native";
import Skeleton from "../Skeleton";

describe("Skeleton", () => {
  it("renders without crashing with default props", async () => {
    await render(<Skeleton testID="skeleton" />);
    expect(screen.getByTestId("skeleton")).toBeTruthy();
  });

  it("applies the provided width, height, and borderRadius styles", async () => {
    await render(
      <Skeleton testID="skeleton" width={120} height={40} borderRadius={8} />,
    );
    const node = screen.getByTestId("skeleton");
    const flatStyle = Array.isArray(node.props.style)
      ? Object.assign({}, ...node.props.style)
      : node.props.style;
    expect(flatStyle.width).toBe(120);
    expect(flatStyle.height).toBe(40);
    expect(flatStyle.borderRadius).toBe(8);
  });
});
