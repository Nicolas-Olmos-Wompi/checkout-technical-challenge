import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import TextField from "./TextField";
import PrimaryButton from "./PrimaryButton";
import { colors, spacing, fontSize } from "../theme";
import { validatePrice, validatePriceRange } from "../utils/priceValidation";

export type PriceFilters = {
  minPrice: string;
  maxPrice: string;
};

type Props = {
  onApply: (filters: PriceFilters) => void;
  onClear: () => void;
  initialMinPrice?: string;
  initialMaxPrice?: string;
};

export default function FiltersPanel({
  onApply,
  onClear,
  initialMinPrice = "",
  initialMaxPrice = "",
}: Props) {
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [error, setError] = useState<string | undefined>(undefined);

  function handleApply() {
    const minError = validatePrice(minPrice);
    const maxError = validatePrice(maxPrice);
    const rangeError = validatePriceRange(minPrice, maxPrice);
    const firstError = minError ?? maxError ?? rangeError;

    if (firstError) {
      setError(firstError);
      return;
    }

    setError(undefined);
    onApply({ minPrice, maxPrice });
  }

  function handleClear() {
    setMinPrice("");
    setMaxPrice("");
    setError(undefined);
    onClear();
  }

  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <View style={styles.field}>
          <TextField
            label="Minimum price"
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
        <View style={styles.field}>
          <TextField
            label="Maximum price"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <PrimaryButton
          title="Clear"
          variant="outline"
          onPress={handleClear}
          style={styles.actionButton}
        />
        <PrimaryButton title="Apply" onPress={handleApply} style={styles.actionButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingTop: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  field: {
    flex: 1,
  },
  error: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
