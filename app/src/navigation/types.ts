import type { Product } from "../api/product.types";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Products: undefined;
  ProductDetail: { product: Product };
  Delivery: { product: Product };
  Card: undefined;
};
