import { StyleSheet, Text, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { colors, spacing, fontSize } from "../theme";

type Props = {
  page: number;
  totalPages: number;
  onPrev: (page: number) => void;
  onNext: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPrev, onNext }: Props) {
  const isPrevDisabled = page <= 1 || totalPages === 0;
  const isNextDisabled = page >= totalPages || totalPages === 0;

  return (
    <View style={styles.container}>
      <PrimaryButton
        title="Prev"
        variant="outline"
        disabled={isPrevDisabled}
        onPress={() => onPrev(page - 1)}
        style={styles.button}
        testID="pagination-prev"
      />
      <Text style={styles.label}>
        Page {page} of {totalPages}
      </Text>
      <PrimaryButton
        title="Next"
        variant="outline"
        disabled={isNextDisabled}
        onPress={() => onNext(page + 1)}
        style={styles.button}
        testID="pagination-next"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  button: {
    flex: 0,
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: "600",
  },
});
