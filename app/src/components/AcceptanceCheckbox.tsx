import { Linking, StyleSheet, Text } from "react-native";
import Checkbox from "./Checkbox";
import { colors, fontSize } from "../theme";

type Props = {
  label: string;
  linkText: string;
  url: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  testID?: string;
};

/**
 * Renders a checkbox paired with a tappable link, e.g.
 * "I accept the [Terms and Conditions]". Tapping the link text opens the
 * given URL externally without toggling the checkbox; tapping the checkbox
 * (or the rest of the row) only toggles acceptance.
 */
export default function AcceptanceCheckbox({
  label,
  linkText,
  url,
  checked,
  onToggle,
  testID,
}: Props) {
  return (
    <Checkbox checked={checked} onToggle={onToggle} testID={testID}>
      <Text style={styles.text}>
        {label}{" "}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL(url)}
          testID={testID ? `${testID}-link` : undefined}
        >
          {linkText}
        </Text>
      </Text>
    </Checkbox>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  link: {
    color: colors.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
