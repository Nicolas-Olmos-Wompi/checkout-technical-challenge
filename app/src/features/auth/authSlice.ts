import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { login as loginRequest, signup as signupRequest } from "../../api/auth";
import type { AuthenticatedUser, LoginRequest, SignupRequest } from "../../api/auth.types";
import { ApiError } from "../../api/types";
import { clearToken, getToken, setToken } from "../../auth/tokenStorage";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export type AuthState = {
  status: AuthStatus;
  user: AuthenticatedUser | null;
  token: string | null;
  error: string | null;
};

const initialState: AuthState = {
  status: "idle",
  user: null,
  token: null,
  error: null,
};

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}

export const restoreSession = createAsyncThunk<string | null>(
  "auth/restoreSession",
  async () => {
    return getToken();
  },
);

export const login = createAsyncThunk<
  { token: string; user: AuthenticatedUser },
  LoginRequest,
  { rejectValue: string }
>("auth/login", async (request, { rejectWithValue }) => {
  try {
    const response = await loginRequest(request);
    await setToken(response.token);
    return { token: response.token, user: response.user };
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const signup = createAsyncThunk<
  { token: string; user: AuthenticatedUser },
  SignupRequest,
  { rejectValue: string }
>("auth/signup", async (request, { rejectWithValue }) => {
  try {
    const response = await signupRequest(request);
    await setToken(response.token);
    return { token: response.token, user: response.user };
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const logout = createAsyncThunk<void>("auth/logout", async () => {
  await clearToken();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(restoreSession.fulfilled, (state, action: PayloadAction<string | null>) => {
        state.token = action.payload;
        state.status = action.payload ? "authenticated" : "unauthenticated";
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = "unauthenticated";
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = action.payload ?? "Something went wrong. Please try again.";
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = action.payload ?? "Something went wrong. Please try again.";
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "unauthenticated";
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
