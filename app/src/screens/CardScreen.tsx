import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import CardBrandLogo from "../components/CardBrandLogo";
import { useAppDispatch } from "../store/hooks";
import { setCard } from "../features/card/cardSlice";
import {
  detectCardBrand,
  validateCardForm,
  type CardFormErrors,
} from "../utils/cardValidation";
import { colors, spacing, fontSize } from "../theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Card">;

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 19);
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function parseExpiry(value: string): { expMonth: string; expYear: string } {
  const [month = "", year = ""] = value.split("/");
  return { expMonth: month, expYear: year };
}

export default function CardScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [errors, setErrors] = useState<CardFormErrors>({});

  const brand = detectCardBrand(cardNumber);

  function handleSubmit() {
    const { expMonth, expYear } = parseExpiry(expiry);
    const fields = { cardNumber, expMonth, expYear, cvc, cardHolder };
    const validationErrors = validateCardForm(fields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    dispatch(setCard(fields));
    navigation.navigate("PaymentSummary");
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Card payment</Text>

        <View style={styles.cardNumberRow}>
          <View style={styles.cardNumberField}>
            <TextField
              label="Card number"
              value={cardNumber}
              onChangeText={(value) => setCardNumber(formatCardNumber(value))}
              placeholder="1234 5678 9012 3456"
              keyboardType="number-pad"
              error={errors.cardNumber}
              testID="card-number-input"
            />
          </View>
          <View style={styles.brandLogo}>
            <CardBrandLogo brand={brand} />
          </View>
        </View>

        <TextField
          label="Expiry (MM/YY)"
          value={expiry}
          onChangeText={(value) => setExpiry(formatExpiry(value))}
          placeholder="MM/YY"
          keyboardType="number-pad"
          error={errors.expiry}
          testID="card-expiry-input"
        />

        <TextField
          label="CVC"
          value={cvc}
          onChangeText={(value) => setCvc(value.replace(/\D/g, "").slice(0, 4))}
          placeholder="123"
          keyboardType="number-pad"
          secureTextEntry
          error={errors.cvc}
          testID="card-cvc-input"
        />

        <TextField
          label="Cardholder name"
          value={cardHolder}
          onChangeText={setCardHolder}
          placeholder="John Doe"
          autoCapitalize="words"
          error={errors.cardHolder}
          testID="card-holder-input"
        />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          onPress={handleSubmit}
          testID="card-submit-button"
          style={styles.submitButton}
        />
        <PrimaryButton
          title="Back"
          variant="outline"
          onPress={() => navigation.goBack()}
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
  cardNumberRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardNumberField: {
    flex: 1,
  },
  brandLogo: {
    marginTop: spacing.lg + 4,
    marginLeft: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  submitButton: {
    marginBottom: spacing.xs,
  },
});
