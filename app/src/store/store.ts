import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import loginFormReducer from "../features/auth/loginFormSlice";
import signupFormReducer from "../features/auth/signupFormSlice";
import productsReducer from "../features/products/productsSlice";
import ordersReducer from "../features/orders/ordersSlice";

export function createStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      loginForm: loginFormReducer,
      signupForm: signupFormReducer,
      products: productsReducer,
      orders: ordersReducer,
    },
  });
}

export const store = createStore();

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
