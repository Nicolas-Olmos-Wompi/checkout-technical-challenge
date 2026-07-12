import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../features/auth/authSlice";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing, fontSize } from "../theme";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Products">;

export default function ProductsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  async function handleLogout() {
    await dispatch(logout());
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Products</Text>
        {user?.username ? (
          <Text style={styles.subtitle}>Welcome, {user.username}</Text>
        ) : null}
        <Text style={styles.placeholder}>Coming soon.</Text>
      </View>

      <PrimaryButton title="Log out" variant="outline" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  placeholder: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
