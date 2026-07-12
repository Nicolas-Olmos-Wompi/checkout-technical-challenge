import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SignupFormFieldErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export type SignupFormField = "username" | "email" | "password" | "confirmPassword";

export type SignupFormState = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fieldErrors: SignupFormFieldErrors;
};

const initialState: SignupFormState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  fieldErrors: {},
};

const signupFormSlice = createSlice({
  name: "signupForm",
  initialState,
  reducers: {
    setField(
      state,
      action: PayloadAction<{ field: SignupFormField; value: string }>,
    ) {
      state[action.payload.field] = action.payload.value;
    },
    setFieldErrors(state, action: PayloadAction<SignupFormFieldErrors>) {
      state.fieldErrors = action.payload;
    },
    resetForm() {
      return initialState;
    },
  },
});

export const { setField, setFieldErrors, resetForm } = signupFormSlice.actions;
export default signupFormSlice.reducer;
