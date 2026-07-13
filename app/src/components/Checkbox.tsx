import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, spacing, fontSize } from "../theme";

type Props = {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label?: string;
  children?: React.ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export default function Checkbox({ checked, onToggle, label, children, testID, style }: Props) {
  return (
    <Pressable
      style={[styles.container, style]}
      onPress={() => onToggle(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      testID={testID}
    >
      <View style={[styles.box, checked ? styles.boxChecked : null]}>
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <View style={styles.labelContainer}>
        {label ? <Text style={styles.label}>{label}</Text> : children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.onPrimary,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
});
