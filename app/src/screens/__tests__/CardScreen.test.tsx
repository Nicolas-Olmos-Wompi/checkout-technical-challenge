import React from "react";
import { render, screen, userEvent } from "@testing-library/react-native";
import CardScreen from "../CardScreen";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Card">;

async function renderCardScreen() {
  const navigation = { goBack: jest.fn() } as unknown as Props["navigation"];
  await render(
    <CardScreen navigation={navigation} route={{} as Props["route"]} />,
  );
  return { navigation };
}

describe("CardScreen", () => {
  it("renders without crashing and shows a title", async () => {
    await renderCardScreen();
    expect(screen.getByText("Card payment")).toBeTruthy();
  });

  it("navigates back when the Back button is pressed", async () => {
    const user = userEvent.setup();
    const { navigation } = await renderCardScreen();

    await user.press(screen.getByText("Back"));

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});
