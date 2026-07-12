import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Backdrop from "../components/Backdrop";
import PrimaryButton from "../components/PrimaryButton";
import CardBrandLogo from "../components/CardBrandLogo";
import AcceptanceCheckbox from "../components/AcceptanceCheckbox";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { payOrder } from "../features/payment/paymentSlice";
import {
  setAcceptedEndUserPolicy,
  setAcceptedPersonalDataAuth,
} from "../features/orders/ordersSlice";
import { formatPrice } from "../utils/formatPrice";
import { colors, radius, spacing, fontSize } from "../theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PaymentSummary">;

export default function PaymentSummaryScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { order, acceptedEndUserPolicy, acceptedPersonalDataAuth } = useAppSelector(
    (state) => state.orders,
  );
  const card = useAppSelector((state) => state.card);
  const paymentStatus = useAppSelector((state) => state.payment.status);

  const lastFour = card.cardNumber.replace(/\s/g, "").slice(-4);
  const productPriceInCents = order ? order.totalInCents - (order.delivery.fee ?? 0) : 0;
  const isPaying = paymentStatus === "paying" || paymentStatus === "polling";
  const canPay =
    order !== null &&
    card.status === "succeeded" &&
    acceptedEndUserPolicy &&
    acceptedPersonalDataAuth &&
    !isPaying;

  async function handlePay() {
    if (!order) return;

    await dispatch(
      payOrder({
        orderId: order.orderId,
        request: {
          paymentMethodType: "CARD",
          card: {
            cardNumber: card.cardNumber.replace(/\s/g, ""),
            expMonth: card.expMonth,
            expYear: card.expYear,
            cvc: card.cvc,
            cardHolder: card.cardHolder,
          },
        },
      }),
    );

    navigation.navigate("PaymentResult");
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Payment summary</Text>

        <Backdrop
          toggleLabel="Order summary"
          initiallyRevealed
          backLayer={
            order ? (
              <View>
                <View style={styles.row}>
                  <Text style={styles.label}>Quantity</Text>
                  <Text style={styles.value}>{order.quantity}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Product price</Text>
                  <Text style={styles.value}>{formatPrice(productPriceInCents)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Delivery fee</Text>
                  <Text style={styles.value}>
                    {order.delivery.fee === null
                      ? "Calculating..."
                      : formatPrice(order.delivery.fee)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Total</Text>
                  <Text style={styles.total}>{formatPrice(order.totalInCents)}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.value}>No order found.</Text>
            )
          }
          frontLayer={
            <View style={styles.cardSummary} testID="card-summary">
              <View style={styles.cardSummaryHeader}>
                <CardBrandLogo brand={card.brand} />
                <Text style={styles.maskedNumber}>
                  {`**** **** **** ${lastFour}`}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Cardholder</Text>
                <Text style={styles.value}>{card.cardHolder}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Expiry</Text>
                <Text style={styles.value}>
                  {`${card.expMonth}/${card.expYear}`}
                </Text>
              </View>
            </View>
          }
          style={styles.backdrop}
        />

        {order ? (
          <View style={styles.acceptanceSection} testID="acceptance-section">
            <AcceptanceCheckbox
              label="I accept the"
              linkText="Terms and Conditions"
              url={order.presignedAcceptance.endUserPolicy.permalink}
              checked={acceptedEndUserPolicy}
              onToggle={(checked) => dispatch(setAcceptedEndUserPolicy(checked))}
              testID="accept-end-user-policy"
            />
            <AcceptanceCheckbox
              label="I accept the"
              linkText="Personal Data Policy"
              url={order.presignedAcceptance.personalDataAuth.permalink}
              checked={acceptedPersonalDataAuth}
              onToggle={(checked) => dispatch(setAcceptedPersonalDataAuth(checked))}
              testID="accept-personal-data-auth"
            />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Pay"
          onPress={handlePay}
          disabled={!canPay}
          loading={isPaying}
          testID="pay-button"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  backdrop: {
    flex: 0,
  },
  acceptanceSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
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
  cardSummary: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  cardSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  maskedNumber: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: "600",
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
});
