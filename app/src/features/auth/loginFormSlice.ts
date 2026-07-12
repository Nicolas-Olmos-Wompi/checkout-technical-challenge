import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type LoginFormFieldErrors = {
  username?: string;
  password?: string;
};

export type LoginFormState = {
  username: string;
  password: string;
  fieldErrors: LoginFormFieldErrors;
};

const initialState: LoginFormState = {
  username: "",
  password: "",
  fieldErrors: {},
};

const loginFormSlice = createSlice({
  name: "loginForm",
  initialState,
  reducers: {
    setField(
      state,
      action: PayloadAction<{ field: "username" | "password"; value: string }>,
    ) {
      state[action.payload.field] = action.payload.value;
    },
    setFieldErrors(state, action: PayloadAction<LoginFormFieldErrors>) {
      state.fieldErrors = action.payload;
    },
    resetForm() {
      return initialState;
    },
  },
});

export const { setField, setFieldErrors, resetForm } = loginFormSlice.actions;
export default loginFormSlice.reducer;
