import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import OrderResultCard from "../components/OrderResultCard";
import Backdrop from "../components/Backdrop";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createOrder, resetOrder } from "../features/orders/ordersSlice";
import {
  validateDeliveryForm,
  type DeliveryFormErrors,
  type DeliveryFormFields,
} from "../utils/deliveryValidation";
import { formatPrice } from "../utils/formatPrice";
import { colors, radius, spacing, fontSize } from "../theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Delivery">;

const initialFormFields: DeliveryFormFields = {
  personName: "",
  address: "",
  city: "",
  region: "",
  postalCode: "",
  phoneNumber: "",
};

function areDeliveryFieldsEqual(
  a: DeliveryFormFields,
  b: DeliveryFormFields,
): boolean {
  return (
    a.personName.trim() === b.personName.trim() &&
    a.address.trim() === b.address.trim() &&
    a.city.trim() === b.city.trim() &&
    a.region.trim() === b.region.trim() &&
    a.postalCode.trim() === b.postalCode.trim() &&
    a.phoneNumber.trim() === b.phoneNumber.trim()
  );
}

export default function DeliveryScreen({ navigation, route }: Props) {
  const { product } = route.params;
  const dispatch = useAppDispatch();
  const { order, status, error, submittedDelivery } = useAppSelector(
    (state) => state.orders,
  );
  const [form, setForm] = useState<DeliveryFormFields>(initialFormFields);
  const [quantity, setQuantity] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<DeliveryFormErrors>({});
  const [isModalDismissed, setIsModalDismissed] = useState(false);
  const [submittedQuantity, setSubmittedQuantity] = useState<number | null>(null);

  // A stored order from a previous purchase (different product) is stale —
  // reset it so this screen doesn't show someone else's result. The order
  // for the *current* product is intentionally left in place so navigating
  // away (e.g. to Card) and back still shows the result.
  useEffect(() => {
    if (order && order.productId !== product.id) {
      dispatch(resetOrder());
    }
  }, [order, product.id, dispatch]);

  // If the user edits the quantity or any delivery field after a successful
  // submission, the previous receipt is stale — automatically reset the
  // order so Submit re-enables and the outdated receipt is invalidated.
  const hasChangedSinceSubmission =
    status === "succeeded" &&
    (quantity !== submittedQuantity ||
      submittedDelivery === null ||
      !areDeliveryFieldsEqual(form, submittedDelivery));

  useEffect(() => {
    if (hasChangedSinceSubmission) {
      dispatch(resetOrder());
    }
  }, [hasChangedSinceSubmission, dispatch]);

  const isReceiptVisible =
    !isModalDismissed &&
    status === "succeeded" &&
    order !== null &&
    order.productId === product.id;

  function updateField(field: keyof DeliveryFormFields, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function incrementQuantity() {
    setQuantity((prev) => Math.min(prev + 1, product.stock));
  }

  function decrementQuantity() {
    setQuantity((prev) => Math.max(prev - 1, 1));
  }

  function handleSubmit() {
    const errors = validateDeliveryForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsModalDismissed(false);
    setSubmittedQuantity(quantity);
    dispatch(
      createOrder({
        productId: product.id,
        quantity,
        delivery: {
          personName: form.personName.trim(),
          address: form.address.trim(),
          country: "Colombia",
          city: form.city.trim(),
          region: form.region.trim(),
          postalCode: form.postalCode.trim(),
          phoneNumber: form.phoneNumber.trim(),
        },
      }),
    );
  }

  function handleDismissReceipt() {
    setIsModalDismissed(true);
    // Once the user has seen and dismissed the receipt, the successful
    // order is no longer "current" — always reset it so Submit re-enables
    // and the user can place a new order, whether or not they change the
    // form first. (Editing the form or quantity *before* dismissing is
    // still caught by the hasChangedSinceSubmission effect above.)
    dispatch(resetOrder());
  }

  const isIncrementDisabled = quantity >= product.stock;
  const isDecrementDisabled = quantity <= 1;
  const isSubmitting = status === "loading";
  const isSubmitDisabled = status === "loading" || status === "succeeded";
  const subtotalInCents = product.price * quantity;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View testID="delivery-form-content">
          <Text style={styles.title}>Delivery details</Text>
          <Text style={styles.productSubtitle}>{product.name}</Text>

          {status === "failed" && error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <TextField
            label="Full name"
            value={form.personName}
            onChangeText={(value) => updateField("personName", value)}
            placeholder="Full name"
            error={fieldErrors.personName}
          />
          <TextField
            label="Address"
            value={form.address}
            onChangeText={(value) => updateField("address", value)}
            placeholder="Address"
            error={fieldErrors.address}
          />
          <TextField
            label="City"
            value={form.city}
            onChangeText={(value) => updateField("city", value)}
            placeholder="City"
            error={fieldErrors.city}
          />
          <TextField
            label="Region"
            value={form.region}
            onChangeText={(value) => updateField("region", value)}
            placeholder="Region"
            error={fieldErrors.region}
          />
          <TextField
            label="Postal code"
            value={form.postalCode}
            onChangeText={(value) => updateField("postalCode", value)}
            placeholder="Postal code"
            keyboardType="number-pad"
            error={fieldErrors.postalCode}
          />
          <TextField
            label="Phone number"
            value={form.phoneNumber}
            onChangeText={(value) => updateField("phoneNumber", value)}
            placeholder="Phone number"
            keyboardType="phone-pad"
            error={fieldErrors.phoneNumber}
          />

          <View style={styles.countryContainer}>
            <Text style={styles.countryLabel}>Country</Text>
            <View style={styles.countryValue}>
              <Text style={styles.countryText}>Colombia</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.backdropWrapper}>
        <Backdrop
          toggleLabel="Order summary"
          initiallyRevealed
          backLayer={
            <View style={styles.orderSummary}>
              <View style={styles.quantityRow}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <View style={styles.stepper}>
                  <PrimaryButton
                    title="-"
                    variant="outline"
                    disabled={isDecrementDisabled}
                    onPress={decrementQuantity}
                    style={styles.stepperButton}
                    testID="quantity-decrement"
                  />
                  <Text style={styles.quantityValue} testID="quantity-value">
                    {quantity}
                  </Text>
                  <PrimaryButton
                    title="+"
                    variant="outline"
                    disabled={isIncrementDisabled}
                    onPress={incrementQuantity}
                    style={styles.stepperButton}
                    testID="quantity-increment"
                  />
                </View>
              </View>

              <Text style={styles.subtotalText}>
                Subtotal (excl. delivery fee): {formatPrice(subtotalInCents)}
              </Text>
            </View>
          }
          frontLayer={null}
          style={styles.orderSummaryBackdrop}
        />
      </View>

      <View style={styles.footer} testID="delivery-footer">
        <PrimaryButton
          title="Submit"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitDisabled}
          testID="submit-button"
          style={styles.submitButton}
        />
      </View>

      <Modal
        visible={isReceiptVisible}
        animationType="none"
        transparent
        testID="receipt-modal"
        onRequestClose={handleDismissReceipt}
      >
        <Pressable
          testID="receipt-backdrop"
          style={styles.backdrop}
          onPress={handleDismissReceipt}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            {order ? (
              <OrderResultCard
                order={order}
                onContinue={() => navigation.navigate("Card")}
              />
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backdropWrapper: {
    paddingHorizontal: spacing.lg,
  },
  orderSummaryBackdrop: {
    flex: 0,
  },
  orderSummary: {},
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productSubtitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.error,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    color: colors.onError,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  quantityRow: {
    marginBottom: spacing.md,
  },
  quantityLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  stepperButton: {
    flex: 0,
    paddingHorizontal: spacing.lg,
  },
  quantityValue: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
    minWidth: 32,
    textAlign: "center",
  },
  countryContainer: {
    marginBottom: spacing.md,
  },
  countryLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: "600",
  },
  countryValue: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.border,
  },
  countryText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
  subtotalText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalContent: {
    width: "100%",
  },
});
