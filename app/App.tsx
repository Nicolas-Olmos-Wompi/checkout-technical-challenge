import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import type { NavigationContainerRef } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import { useAppDispatch, useAppSelector } from "./src/store/hooks";
import { restoreSession } from "./src/features/auth/authSlice";
import RootNavigator from "./src/navigation/RootNavigator";
import SessionExpiryListener from "./src/auth/SessionExpiryListener";
import type { RootStackParamList } from "./src/navigation/types";

// Keep the native splash screen visible until auth state has been read.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore — happens if the splash screen was already hidden (e.g. fast refresh).
});

function AppContent() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const [hasHiddenSplash, setHasHiddenSplash] = useState(false);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  const hideSplash = useCallback(async () => {
    if (hasHiddenSplash) return;
    setHasHiddenSplash(true);
    await SplashScreen.hideAsync();
  }, [hasHiddenSplash]);

  useEffect(() => {
    if (status !== "idle" && status !== "loading") {
      hideSplash();
    }
  }, [status, hideSplash]);

  return (
    <NavigationContainer ref={navigationRef}>
      <SessionExpiryListener navigationRef={navigationRef} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
