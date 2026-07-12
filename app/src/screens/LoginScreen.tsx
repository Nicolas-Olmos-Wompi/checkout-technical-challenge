import { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearError, login } from "../features/auth/authSlice";
import { setField, setFieldErrors } from "../features/auth/loginFormSlice";
import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import { colors, spacing, fontSize } from "../theme";
import { validatePassword, validateUsername } from "../utils/validation";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { username, password, fieldErrors } = useAppSelector((state) => state.loginForm);
  const isSubmitting = useAppSelector((state) => state.auth.status === "loading");
  const formError = useAppSelector((state) => state.auth.error);

  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  function validate(): boolean {
    const errors = {
      username: validateUsername(username),
      password: validatePassword(password),
    };
    dispatch(setFieldErrors(errors));
    return !errors.username && !errors.password;
  }

  async function handleSubmit() {
    if (!validate()) return;

    const result = await dispatch(login({ username, password }));
    if (login.fulfilled.match(result)) {
      navigation.reset({ index: 0, routes: [{ name: "Products" }] });
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>

        {formError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{formError}</Text>
          </View>
        ) : null}

        <TextField
          label="Username"
          value={username}
          onChangeText={(value) => dispatch(setField({ field: "username", value }))}
          error={fieldErrors.username}
          autoComplete="username"
          textContentType="username"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={(value) => dispatch(setField({ field: "password", value }))}
          error={fieldErrors.password}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
        />

        <PrimaryButton
          title="Log in"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitButton}
        />

        <PrimaryButton
          title="Create an account"
          variant="outline"
          onPress={() => navigation.navigate("Signup")}
          disabled={isSubmitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
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
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.error,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    color: colors.onError,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  submitButton: {
    marginBottom: spacing.sm,
  },
});
