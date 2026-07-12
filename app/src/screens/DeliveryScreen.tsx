import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import OrderResultCard from "../components/OrderResultCard";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createOrder, resetOrder } from "../features/orders/ordersSlice";
import {
  validateDeliveryForm,
  type DeliveryFormErrors,
} from "../utils/deliveryValidation";
import { colors, radius, spacing, fontSize } from "../theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Delivery">;

export type DeliveryFormFields = {
  personName: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  phoneNumber: string;
};

const initialFormFields: DeliveryFormFields = {
  personName: "",
  address: "",
  city: "",
  region: "",
  postalCode: "",
  phoneNumber: "",
};

export default function DeliveryScreen({ navigation, route }: Props) {
  const { product } = route.params;
  const dispatch = useAppDispatch();
  const { order, status, error } = useAppSelector((state) => state.orders);
  const [form, setForm] = useState<DeliveryFormFields>(initialFormFields);
  const [quantity, setQuantity] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<DeliveryFormErrors>({});

  // A stored order from a previous purchase (different product) is stale —
  // reset it so this screen doesn't show someone else's result. The order
  // for the *current* product is intentionally left in place so navigating
  // away (e.g. to Card) and back still shows the result.
  useEffect(() => {
    if (order && order.productId !== product.id) {
      dispatch(resetOrder());
    }
  }, [order, product.id, dispatch]);

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

  const isIncrementDisabled = quantity >= product.stock;
  const isDecrementDisabled = quantity <= 1;
  const isSubmitting = status === "loading";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Delivery details</Text>

      {status === "failed" && error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      ) : null}

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

      <PrimaryButton
        title="Submit"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
        testID="submit-button"
        style={styles.submitButton}
      />

      {status === "succeeded" && order && order.productId === product.id ? (
        <View style={styles.resultContainer}>
          <OrderResultCard
            order={order}
            onContinue={() => navigation.navigate("Card")}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
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
    marginBottom: spacing.lg,
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
  resultContainer: {
    marginTop: spacing.lg,
  },
});
