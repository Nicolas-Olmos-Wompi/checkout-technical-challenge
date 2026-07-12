import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import loginFormReducer from "../features/auth/loginFormSlice";
import signupFormReducer from "../features/auth/signupFormSlice";

export function createStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      loginForm: loginFormReducer,
      signupForm: signupFormReducer,
    },
  });
}

export const store = createStore();

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
