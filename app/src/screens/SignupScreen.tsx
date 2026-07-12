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
import { clearError, signup } from "../features/auth/authSlice";
import { setField, setFieldErrors } from "../features/auth/signupFormSlice";
import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import { colors, spacing, fontSize } from "../theme";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateUsername,
} from "../utils/validation";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

export default function SignupScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { username, email, password, confirmPassword, fieldErrors } = useAppSelector(
    (state) => state.signupForm,
  );
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
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    };
    dispatch(setFieldErrors(errors));
    return Object.values(errors).every((error) => !error);
  }

  async function handleSubmit() {
    if (!validate()) return;

    const result = await dispatch(signup({ username, email, password }));
    if (signup.fulfilled.match(result)) {
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
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

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
          label="Email"
          value={email}
          onChangeText={(value) => dispatch(setField({ field: "email", value }))}
          error={fieldErrors.email}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={(value) => dispatch(setField({ field: "password", value }))}
          error={fieldErrors.password}
          secureTextEntry
          autoComplete="password-new"
          textContentType="newPassword"
        />
        <TextField
          label="Confirm password"
          value={confirmPassword}
          onChangeText={(value) => dispatch(setField({ field: "confirmPassword", value }))}
          error={fieldErrors.confirmPassword}
          secureTextEntry
          autoComplete="password-new"
          textContentType="newPassword"
        />

        <PrimaryButton
          title="Sign up"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitButton}
        />

        <PrimaryButton
          title="Already have an account? Log in"
          variant="outline"
          onPress={() => navigation.navigate("Login")}
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
