import React from "react";
import { render, screen, userEvent } from "@testing-library/react-native";
import Pagination from "../Pagination";

describe("Pagination", () => {
  it("renders the current page and total pages", async () => {
    await render(
      <Pagination page={2} totalPages={5} onPrev={jest.fn()} onNext={jest.fn()} />,
    );
    expect(screen.getByText("Page 2 of 5")).toBeTruthy();
  });

  it("disables the Prev button on the first page", async () => {
    await render(
      <Pagination page={1} totalPages={5} onPrev={jest.fn()} onNext={jest.fn()} />,
    );
    expect(screen.getByTestId("pagination-prev").props.accessibilityState.disabled).toBe(
      true,
    );
  });

  it("disables the Next button on the last page", async () => {
    await render(
      <Pagination page={5} totalPages={5} onPrev={jest.fn()} onNext={jest.fn()} />,
    );
    expect(screen.getByTestId("pagination-next").props.accessibilityState.disabled).toBe(
      true,
    );
  });

  it("disables both buttons when there are zero total pages", async () => {
    await render(
      <Pagination page={1} totalPages={0} onPrev={jest.fn()} onNext={jest.fn()} />,
    );
    expect(screen.getByTestId("pagination-prev").props.accessibilityState.disabled).toBe(
      true,
    );
    expect(screen.getByTestId("pagination-next").props.accessibilityState.disabled).toBe(
      true,
    );
  });

  it("calls onPrev when Prev is pressed on a page after the first", async () => {
    const user = userEvent.setup();
    const onPrev = jest.fn();
    await render(
      <Pagination page={3} totalPages={5} onPrev={onPrev} onNext={jest.fn()} />,
    );

    await user.press(screen.getByTestId("pagination-prev"));

    expect(onPrev).toHaveBeenCalledWith(2);
  });

  it("calls onNext when Next is pressed on a page before the last", async () => {
    const user = userEvent.setup();
    const onNext = jest.fn();
    await render(
      <Pagination page={3} totalPages={5} onPrev={jest.fn()} onNext={onNext} />,
    );

    await user.press(screen.getByTestId("pagination-next"));

    expect(onNext).toHaveBeenCalledWith(4);
  });
});
