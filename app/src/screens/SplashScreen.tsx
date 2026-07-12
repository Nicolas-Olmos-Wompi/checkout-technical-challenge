import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, spacing } from "../theme";
import { useAppSelector } from "../store/hooks";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export default function SplashScreen({ navigation }: Props) {
  const status = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    if (status === "idle" || status === "loading") return;
    navigation.replace(status === "authenticated" ? "Products" : "Login");
  }, [status, navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/splash-icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  logo: {
    width: 160,
    height: 160,
  },
});
