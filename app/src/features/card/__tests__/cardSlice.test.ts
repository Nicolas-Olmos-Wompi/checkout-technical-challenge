import { configureStore } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import cardReducer, {
  setCard,
  resetCard,
  type CardState,
} from "../cardSlice";
import type { CardFormFields } from "../../../utils/cardValidation";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

function createTestStore() {
  return configureStore({ reducer: { card: cardReducer } });
}

const validFields: CardFormFields = {
  cardNumber: "4242424242424242",
  expMonth: "12",
  expYear: "29",
  cvc: "123",
  cardHolder: "John Doe",
};

describe("cardSlice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("has an empty initial state", () => {
    const store = createTestStore();
    const state = store.getState().card;

    expect(state.cardNumber).toBe("");
    expect(state.brand).toBe("UNKNOWN");
    expect(state.status).toBe("idle");
  });

  it("stores full card data in memory when setCard is dispatched", async () => {
    const store = createTestStore();

    await store.dispatch(setCard(validFields));

    const state: CardState = store.getState().card;
    expect(state.cardNumber).toBe(validFields.cardNumber);
    expect(state.cvc).toBe(validFields.cvc);
    expect(state.expMonth).toBe("12");
    expect(state.expYear).toBe("29");
    expect(state.cardHolder).toBe("John Doe");
    expect(state.brand).toBe("VISA");
    expect(state.status).toBe("succeeded");
  });

  it("mirrors only non-sensitive metadata to secure storage on setCard", async () => {
    const store = createTestStore();

    await store.dispatch(setCard(validFields));

    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
    const [key, value] = (SecureStore.setItemAsync as jest.Mock).mock.calls[0];
    expect(key).toBe("card_metadata");
    const parsed = JSON.parse(value);
    expect(parsed).toEqual({
      brand: "VISA",
      lastFour: "4242",
      expMonth: "12",
      expYear: "29",
      cardHolder: "John Doe",
    });
    expect(parsed.cardNumber).toBeUndefined();
    expect(parsed.cvc).toBeUndefined();
  });

  it("clears in-memory card data and secure storage when resetCard is dispatched", async () => {
    const store = createTestStore();
    await store.dispatch(setCard(validFields));

    await store.dispatch(resetCard());

    const state: CardState = store.getState().card;
    expect(state.cardNumber).toBe("");
    expect(state.cvc).toBe("");
    expect(state.status).toBe("idle");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("card_metadata");
  });
});
