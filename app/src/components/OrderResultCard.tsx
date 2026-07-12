import { StyleSheet, Text, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { colors, radius, spacing, fontSize } from "../theme";
import { formatPrice } from "../utils/formatPrice";
import type { PendingOrderResponse } from "../api/order.types";

type Props = {
  order: PendingOrderResponse;
  onContinue: () => void;
};

/**
 * Displays the result of a successfully created order (status, total) and a
 * "Continue to payment" action. Purely presentational — no navigation or
 * Redux coupling, so it stays testable in isolation.
 */
export default function OrderResultCard({ order, onContinue }: Props) {
  const fee = order.delivery.fee;
  const productPriceInCents = order.totalInCents - (fee ?? 0);

  return (
    <View testID="order-result-card" style={styles.card}>
      <Text style={styles.title}>Order created</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{order.status}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Product price</Text>
        <Text style={styles.value}>{formatPrice(productPriceInCents)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Delivery fee</Text>
        <Text style={styles.value}>
          {fee === null ? "Calculating..." : formatPrice(fee)}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.total}>{formatPrice(order.totalInCents)}</Text>
      </View>

      <PrimaryButton
        title="Continue to payment"
        onPress={onContinue}
        style={styles.continueButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  value: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: "600",
  },
  total: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: "800",
  },
  continueButton: {
    marginTop: spacing.md,
  },
});
