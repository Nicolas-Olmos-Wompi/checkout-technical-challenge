import { useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";
import { colors, radius } from "../theme";

type Props = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
};

/**
 * Lightweight pulsing placeholder used while product data is loading.
 * Uses a looping opacity animation instead of a dedicated skeleton library.
 */
export default function Skeleton({
  width = "100%",
  height = 16,
  borderRadius: cornerRadius = radius.sm,
  style,
  testID,
}: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.base,
        { width, height, borderRadius: cornerRadius, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.border,
  },
});
