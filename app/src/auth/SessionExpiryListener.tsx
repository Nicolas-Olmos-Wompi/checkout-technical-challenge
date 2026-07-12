import { useEffect } from "react";
import { Alert } from "react-native";
import type { NavigationContainerRef } from "@react-navigation/native";
import { useAppDispatch } from "../store/hooks";
import { logout } from "../features/auth/authSlice";
import { resetOrder } from "../features/orders/ordersSlice";
import { onSessionExpired } from "./sessionExpiry";
import type { RootStackParamList } from "../navigation/types";

type Props = {
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
};

/**
 * Mounted once near the root of the app (inside both the Redux Provider and
 * the NavigationContainer). Subscribes to session-expiry notifications fired
 * by api/client.ts on authenticated 401 responses. On expiry, informs the
 * user with an alert, then (once dismissed) clears the session, resets any
 * stale order state, and resets navigation to the Login screen.
 */
export default function SessionExpiryListener({ navigationRef }: Props) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    return onSessionExpired(() => {
      Alert.alert("Session expired", "Your session has expired. Please log in again.", [
        {
          text: "OK",
          onPress: () => {
            dispatch(logout());
            dispatch(resetOrder());
            navigationRef.current?.reset({ index: 0, routes: [{ name: "Login" }] });
          },
        },
      ]);
    });
  }, [dispatch, navigationRef]);

  return null;
}
