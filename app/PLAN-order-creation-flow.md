# Implementation Plan: Order Creation Flow (Delivery Form → Create Order → Card Placeholder)

## Problem Statement

Add a checkout flow starting from `ProductDetailScreen`: a "Buy" button navigates to a new Delivery screen with a quantity selector and delivery form (Colombia hardcoded as country). Submitting that form calls `POST /orders` (omitting `delivery.fee`, letting the API compute it), and stacks a result component at the bottom of the same screen showing the created order. From there, the user proceeds to a new placeholder "Card" screen (no fields yet, reachable via nav, no params).

## Requirements (from Q&A)

- Delivery data comes from a real form (not hardcoded), built with plain `TextField`s; only `country` is hardcoded to "Colombia" (not user-editable).
- Quantity is chosen via a quantity selector (not fixed to 1).
- Order creation is triggered from the Delivery screen itself (not ProductDetail).
- Result of order creation is displayed in a component stacked at the bottom of the Delivery screen (no animation for now — plain conditional render).
- After viewing the result, user proceeds to a new placeholder "Card" screen — empty, no params, just wired into navigation.
- Must follow Flux/Redux Toolkit conventions already used in `features/products` and `features/auth`.
- Must use TDD: tests written before implementation for every unit.

## Background (research/codebase findings)

### Server Contract

Confirmed by reading `order.controller.ts`, `order.type.ts`, `create-order.handler.ts`:

- `POST /orders` (JWT-protected) accepts:
  ```json
  {
    "productId": "uuid",
    "quantity": 1,
    "delivery": {
      "personName": "string",
      "address": "string",
      "country": "string",
      "city": "string",
      "region": "string",
      "postalCode": "string",
      "phoneNumber": "string",
      "fee": 0  // OPTIONAL — omit to let server compute it
    }
  }
  ```
- Response is wrapped in `HTTPResponse` envelope; `data` is `PendingOrderResponse`:
  ```typescript
  {
    orderId: string;
    reference: string;
    status: string;
    productId: string;
    quantity: number;
    totalInCents: number;
    delivery: DeliveryResponse;
    presignedAcceptance: {
      endUserPolicy: { acceptanceToken: string; permalink: string };
      personalDataAuth: { acceptanceToken: string; permalink: string };
    };
  }
  ```

### App Conventions

- API modules are thin wrappers over `apiRequest<T>(path, { method, body, auth })`.
- Feature slices use `createAsyncThunk` + `createSlice`, with a `toErrorMessage` helper mapping `ApiError` to a message, and `status: idle|loading|succeeded|failed`.
- Screens receive `NativeStackScreenProps<RootStackParamList, "ScreenName">`; navigation params are typed in `navigation/types.ts`.
- No animation or picker library installed — plan uses plain `TextField`/`View` only.
- Test convention: co-located `__tests__/*.test.ts(x)` using `@testing-library/react-native` and Jest.

## Proposed Solution

### Flux Dataflow

```
ProductDetailScreen (Buy button)
  → navigate("Delivery", { product })
  → DeliveryScreen
    → dispatch(createOrder thunk)
    → api/orders.ts createOrder()
    → POST /orders to Server
    → ordersSlice reducer updates state
    → DeliveryScreen renders OrderResultCard at bottom
    → Continue button → navigate("Card")
    → CardScreen (placeholder)
```

### New/Changed Files

| File | Purpose |
|------|---------|
| `src/api/order.types.ts` | Mirrors server DTOs (without `fee`) |
| `src/api/orders.ts` | `createOrder()` API call |
| `src/features/orders/ordersSlice.ts` | Redux slice + thunk |
| `src/utils/deliveryValidation.ts` | Field-level validation for delivery form (phone format, postal code, required fields) |
| `src/screens/DeliveryScreen.tsx` | Form + quantity selector + result display |
| `src/components/OrderResultCard.tsx` | Result component (reference/status/total + continue button) |
| `src/screens/CardScreen.tsx` | Empty placeholder |
| `src/navigation/types.ts` | Add `Delivery` and `Card` routes |
| `src/navigation/RootNavigator.tsx` | Register new screens |
| `src/screens/ProductDetailScreen.tsx` | Add "Buy" button |
| `src/store/store.ts` | Register `ordersReducer` |
| + corresponding `__tests__` for all above | TDD coverage |

### Quantity Selector

Simple `-`/`+` pressable pair with numeric display, clamped `[1, product.stock]`, local `useState` in `DeliveryScreen` (ephemeral UI state, consistent with `searchText` local state pattern in `ProductsScreen`).

---

## Task Breakdown

### Task 1: API layer for order creation

- **Objective:** Add `order.types.ts` and `orders.ts` mirroring server DTOs, minus `fee`.
- **Guidance:** Follow `product.types.ts`/`products.ts` pattern exactly; `createOrder` takes `{ productId, quantity, delivery }` and calls `apiRequest("/orders", { method: "POST", body: request, auth: true })`.
- **Tests:** Unit test in `api/__tests__/orders.test.ts` mocking `apiRequest`, verifying method/path/body/auth flag, and that a successful/error response is passed through.
- **Demo:** `createOrder()` can be called from a test and correctly hits the mocked `apiRequest` with the right shape.

### Task 2: Orders Redux slice (Flux state layer)

- **Objective:** Add `features/orders/ordersSlice.ts` with `createOrder` thunk, `status`, `order`, `error` state, and `resetOrder` reducer.
- **Guidance:** Mirror `productsSlice.ts`/`authSlice.ts` structure (`toErrorMessage`, `pending/fulfilled/rejected` cases).
- **Tests:** `features/orders/__tests__/ordersSlice.test.ts` covering initial state, pending/fulfilled/rejected transitions, and `resetOrder`.
- **Demo:** Dispatching `createOrder(...)` against a mocked API updates slice state to `succeeded` with the order payload; dispatching `resetOrder` clears it.

### Task 3: Register slice in the store

- **Objective:** Wire `ordersReducer` into `store.ts`.
- **Guidance:** Add key `orders: ordersReducer`, matching existing reducers.
- **Tests:** Extend `store/__tests__/store.test.tsx` to assert `state.orders` exists with expected initial shape.
- **Demo:** `store.getState().orders` returns the initial orders state.

### Task 4: OrderResultCard component

- **Objective:** Build the bottom-of-screen result component showing reference/status/total and a "Continue to payment" button.
- **Guidance:** Use `formatPrice` for `totalInCents`, `PrimaryButton` for the continue action; accept `order` and `onContinue` as props (no navigation coupling, keeps it testable in isolation).
- **Tests:** `components/__tests__/OrderResultCard.test.tsx` — renders order fields correctly, calls `onContinue` on press.
- **Demo:** Component renders standalone in a test harness with a sample order and fires the callback.

### Task 5: Navigation wiring for Delivery and Card routes

- **Objective:** Add `Delivery` and `Card` to `RootStackParamList` and register both screens in `RootNavigator`.
- **Guidance:** `Delivery: { product: Product }`, `Card: undefined`.
- **Tests:** Typecheck acts as safety net; extend navigator test coverage if present.
- **Demo:** App compiles/typechecks with new routes.

### Task 6: CardScreen placeholder

- **Objective:** Build the actual empty placeholder screen (title + back navigation).
- **Guidance:** Mirror minimal screens like `SplashScreen.tsx` for structure/style.
- **Tests:** `screens/__tests__/CardScreen.test.tsx` — renders without crashing, shows expected placeholder text.
- **Demo:** Navigating to Card screen shows a real (if empty) screen with a title.

### Task 7: DeliveryScreen — form and quantity selector (no order creation yet)

- **Objective:** Build the form UI: personName, address, city, region, postalCode, phoneNumber fields, hardcoded read-only "Colombia" country display, and a quantity stepper clamped to `[1, product.stock]`.
- **Guidance:** Local `useState` for form fields and quantity (ephemeral UI state, consistent with `ProductsScreen`'s `searchText` pattern); no submission wired yet.
- **Tests:** `screens/__tests__/DeliveryScreen.test.tsx` — renders all fields, quantity stepper increments/decrements and clamps at bounds.
- **Demo:** Screen renders with a product passed via route params; user can type into fields and adjust quantity.

### Task 8: Wire "Buy" button on ProductDetailScreen

- **Objective:** Add a "Buy" `PrimaryButton` on `ProductDetailScreen` navigating to `Delivery` with `{ product }`.
- **Guidance:** Mirror existing button usage/styling on that screen.
- **Tests:** Extend `screens/__tests__/ProductDetailScreen.test.tsx` to assert pressing "Buy" calls `navigation.navigate("Delivery", { product })`.
- **Demo:** From a product detail page, tapping "Buy" opens the Delivery screen.

### Task 9: Delivery field validation utility

- **Objective:** Add `utils/deliveryValidation.ts` with a `validateDeliveryForm` function that validates all delivery fields and returns per-field error messages.
- **Guidance:** Mirror the `validation.ts`/`priceValidation.ts` pattern. Validation rules:
  - `personName`: required, minimum 2 characters.
  - `address`: required, minimum 5 characters.
  - `city`: required, non-empty.
  - `region`: required, non-empty.
  - `postalCode`: required, numeric digits only, 6 digits (Colombian postal code format).
  - `phoneNumber`: required, Colombian phone format — 10 digits, optionally prefixed with `+57` (strip prefix before checking length).
  - Returns an object `{ [field]: errorMessage | undefined }` — empty object means valid.
- **Tests:** `utils/__tests__/deliveryValidation.test.ts` — TDD, written before implementation. Cover valid inputs, each field missing/empty, invalid phone formats, invalid postal code formats, edge cases (whitespace-only, too short).
- **Demo:** Calling `validateDeliveryForm(validData)` returns `{}`; calling with invalid phone returns `{ phoneNumber: "..." }`.

### Task 10: Submit handler — dispatch createOrder from DeliveryScreen

- **Objective:** Wire the form's submit button to validate fields using `validateDeliveryForm`, build the `CreateOrderRequest` (country hardcoded "Colombia", no `fee`), and dispatch `createOrder`.
- **Guidance:** Disable submit while `status === "loading"`; show per-field validation errors inline using `TextField`'s `error` prop; show generic error banner on `status === "failed"` (mirror `ProductsScreen`'s error banner pattern) — server errors like insufficient stock (409) or product not found (404) are displayed through this same generic banner with no special-case UI.
- **Tests:** Extend `DeliveryScreen.test.tsx` — submitting with valid fields dispatches `createOrder` with correct payload; submitting with invalid phone shows field-level error and does NOT dispatch; submitting with empty required fields shows validation feedback; loading state disables the button; server error renders the generic error banner.
- **Demo:** Filling the form and submitting shows a loading state, then either an error banner or moves to result view.

### Task 11: Render OrderResultCard at the bottom of DeliveryScreen on success

- **Objective:** Connect `ordersSlice.order` state to conditionally render `OrderResultCard` under the form once `status === "succeeded"`; "Continue to payment" navigates to `Card`.
- **Guidance:** Order state persists in Redux across navigation — user can navigate to `Card` and back to `Delivery` and still see their order result. `resetOrder` is only dispatched when `DeliveryScreen` mounts with a different `product.id` than the currently stored order's `productId` (i.e., the user started a new purchase flow for a different product). This ensures the user can freely navigate back without losing their order. Stack result below the form (form on top, result below), no animation.
- **Tests:** Extend `DeliveryScreen.test.tsx` — after successful dispatch, `OrderResultCard` appears with correct data; pressing "Continue to payment" navigates to `Card`; order result persists when component re-renders (simulating navigate-back); mounting with a different product ID resets stale order state.
- **Demo:** Full end-to-end manual flow — pick a product, tap Buy, fill delivery form, submit, see the order result at the bottom of the screen, tap continue, land on the empty Card screen. Navigate back — order result is still visible.

### Task 12: Full regression pass

- **Objective:** Run the entire app test suite and typecheck to confirm no regressions across touched files.
- **Guidance:** `npm test` and `tsc --noEmit` in `app/`.
- **Tests:** N/A (verification task).
- **Demo:** Green test suite and clean typecheck.

---

## Notes

- No new dependencies needed — this uses only React Native core, RN Navigation, RTK, and existing project utilities.
- Animation for the result reveal is explicitly deferred to a future task.
- The Card screen receives no params for now; when card payment form is implemented later, it will need the `orderId` from the order result.
- Server errors (insufficient stock 409, product not found 404) are shown through the generic error banner — no special-case UI.
- Order state persists in Redux so the user can navigate to Card and back without losing their result. Reset only occurs when starting a new purchase flow with a different product.
- Delivery validation uses Colombian conventions: 6-digit postal code, 10-digit phone (optionally +57 prefixed).
