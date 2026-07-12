import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, spacing, fontSize } from "../theme";

type Props = {
  toggleLabel: string;
  backLayer: ReactNode;
  frontLayer: ReactNode;
  initiallyRevealed?: boolean;
  style?: ViewStyle;
};

const ANIMATION_DURATION_MS = 220;
const SLIDE_DISTANCE = 16;

export default function Backdrop({
  toggleLabel,
  backLayer,
  frontLayer,
  initiallyRevealed = false,
  style,
}: Props) {
  const [revealed, setRevealed] = useState(initiallyRevealed);
  const progress = useRef(new Animated.Value(initiallyRevealed ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: revealed ? 1 : 0,
      duration: ANIMATION_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [revealed, progress]);

  const frontLayerAnimatedStyle = {
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, SLIDE_DISTANCE],
        }),
      },
    ],
  };

  return (
    <View testID="backdrop-container" style={[styles.container, style]}>
      <Pressable
        testID="backdrop-toggle"
        onPress={() => setRevealed((prev) => !prev)}
        accessibilityRole="button"
        style={styles.toggle}
      >
        <Text style={styles.toggleText}>{toggleLabel}</Text>
        <Text style={styles.toggleIcon}>{revealed ? "▲" : "▼"}</Text>
      </Pressable>

      {revealed ? (
        <View testID="backdrop-back-layer" style={styles.backLayer}>
          {backLayer}
        </View>
      ) : null}

      <Animated.View
        testID="backdrop-front-layer"
        style={[styles.frontLayer, frontLayerAnimatedStyle]}
      >
        {frontLayer}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  toggleText: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
  },
  toggleIcon: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  backLayer: {
    paddingBottom: spacing.sm,
  },
  frontLayer: {
    flex: 1,
  },
});
