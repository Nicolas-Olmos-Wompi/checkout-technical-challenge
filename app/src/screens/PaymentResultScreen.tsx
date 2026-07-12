import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import PrimaryButton from "../components/PrimaryButton";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resetOrder } from "../features/orders/ordersSlice";
import { resetCard } from "../features/card/cardSlice";
import { resetPayment } from "../features/payment/paymentSlice";
import { colors, radius, spacing, fontSize } from "../theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentResult">;

const RESULT_COPY: Record<string, { title: string; message: string }> = {
  APPROVED: {
    title: "Payment approved",
    message: "Your payment was approved. Thank you for your purchase!",
  },
  DECLINED: {
    title: "Payment declined",
    message: "Your payment was declined. Please try again with a different card.",
  },
  VOIDED: {
    title: "Payment voided",
    message: "Your payment was voided. Please try again.",
  },
  ERROR: {
    title: "Payment error",
    message: "Something went wrong processing your payment. Please try again.",
  },
};

export default function PaymentResultScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { status, result, error } = useAppSelector((state) => state.payment);

  async function handleBackToProducts() {
    await Promise.all([
      dispatch(resetOrder()),
      dispatch(resetCard()),
      dispatch(resetPayment()),
    ]);
    navigation.reset({ index: 0, routes: [{ name: "Products" }] });
  }

  function renderContent() {
    if (status === "polling" || status === "paying") {
      return (
        <View testID="payment-result-pending" style={styles.card}>
          <Text style={styles.title}>Verifying payment...</Text>
          <Text style={styles.message}>
            We're confirming your payment with the bank. This may take a few
            seconds.
          </Text>
        </View>
      );
    }

    if (status === "stillPending") {
      return (
        <View testID="payment-result-still-pending" style={styles.card}>
          <Text style={styles.title}>Still processing</Text>
          <Text style={styles.message}>
            Your payment is taking longer than expected to confirm. We'll
            update your order status once it's ready — no need to try again.
          </Text>
        </View>
      );
    }

    if (status === "succeeded") {
      const copy = RESULT_COPY[result?.status ?? "APPROVED"] ?? RESULT_COPY.APPROVED;
      return (
        <View testID="payment-result-success" style={styles.card}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.message}>{copy.message}</Text>
        </View>
      );
    }

    // status === "failed"
    const copy = result ? RESULT_COPY[result.status] : undefined;
    return (
      <View testID="payment-result-failure" style={styles.card}>
        <Text style={styles.title}>{copy?.title ?? "Payment failed"}</Text>
        <Text style={styles.message}>
          {error ?? copy?.message ?? "Something went wrong. Please try again."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>{renderContent()}</View>

      <View style={styles.footer}>
        <PrimaryButton
          title="Back to Products"
          onPress={handleBackToProducts}
          testID="back-to-products-button"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    padding: spacing.lg,
  },
});
