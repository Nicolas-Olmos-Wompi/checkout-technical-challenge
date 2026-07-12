import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { detectCardBrand, type CardBrand, type CardFormFields } from "../../utils/cardValidation";
import { saveCardMetadata, clearCardMetadata } from "../../auth/cardMetadataStorage";

export type CardStatus = "idle" | "succeeded";

export type CardState = {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
  brand: CardBrand;
  status: CardStatus;
};

const initialState: CardState = {
  cardNumber: "",
  expMonth: "",
  expYear: "",
  cvc: "",
  cardHolder: "",
  brand: "UNKNOWN",
  status: "idle",
};

/**
 * Stores the validated card in memory for the active session and mirrors
 * only non-sensitive metadata (brand, last 4 digits, expiry, holder name)
 * to encrypted storage. The full card number and CVC are never persisted.
 */
export const setCard = createAsyncThunk<CardFormFields, CardFormFields>(
  "card/setCard",
  async (fields) => {
    const brand = detectCardBrand(fields.cardNumber);
    const digits = fields.cardNumber.replace(/\s/g, "");
    const lastFour = digits.slice(-4);

    await saveCardMetadata({
      brand,
      lastFour,
      expMonth: fields.expMonth,
      expYear: fields.expYear,
      cardHolder: fields.cardHolder,
    });

    return fields;
  },
);

export const resetCard = createAsyncThunk<void>("card/resetCard", async () => {
  await clearCardMetadata();
});

const cardSlice = createSlice({
  name: "card",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setCard.fulfilled, (state, action) => {
        const fields = action.payload;
        state.cardNumber = fields.cardNumber;
        state.expMonth = fields.expMonth;
        state.expYear = fields.expYear;
        state.cvc = fields.cvc;
        state.cardHolder = fields.cardHolder;
        state.brand = detectCardBrand(fields.cardNumber);
        state.status = "succeeded";
      })
      .addCase(resetCard.fulfilled, () => initialState);
  },
});

export default cardSlice.reducer;
