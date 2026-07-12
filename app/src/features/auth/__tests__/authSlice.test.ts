import { configureStore } from "@reduxjs/toolkit";
import authReducer, {
  login,
  logout,
  restoreSession,
  signup,
} from "../authSlice";
import * as authApi from "../../../api/auth";
import * as tokenStorage from "../../../auth/tokenStorage";
import { ApiError } from "../../../api/types";

jest.mock("../../../api/auth");
jest.mock("../../../auth/tokenStorage");

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockedTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;

function createTestStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

const authResponse = {
  token: "token-abc",
  tokenType: "Bearer" as const,
  expiresIn: "1h",
  user: { id: "1", username: "john", email: "john@example.com" },
};

describe("authSlice reducer", () => {
  it("returns the initial state", () => {
    const store = createTestStore();
    expect(store.getState().auth).toEqual({
      status: "idle",
      user: null,
      token: null,
      error: null,
    });
  });

  describe("restoreSession", () => {
    it("sets status to loading while pending", () => {
      const store = createTestStore();
      store.dispatch({ type: restoreSession.pending.type });
      expect(store.getState().auth.status).toBe("loading");
    });

    it("sets status to authenticated with the token when one is found", () => {
      const store = createTestStore();
      store.dispatch({ type: restoreSession.fulfilled.type, payload: "stored-token" });
      expect(store.getState().auth.status).toBe("authenticated");
      expect(store.getState().auth.token).toBe("stored-token");
    });

    it("sets status to unauthenticated when no token is found", () => {
      const store = createTestStore();
      store.dispatch({ type: restoreSession.fulfilled.type, payload: null });
      expect(store.getState().auth.status).toBe("unauthenticated");
      expect(store.getState().auth.token).toBeNull();
    });

    it("sets status to unauthenticated on rejection", () => {
      const store = createTestStore();
      store.dispatch({ type: restoreSession.rejected.type });
      expect(store.getState().auth.status).toBe("unauthenticated");
    });
  });

  describe("login", () => {
    it("sets status to loading and clears previous errors while pending", () => {
      const store = createTestStore();
      store.dispatch({ type: login.pending.type });
      expect(store.getState().auth.status).toBe("loading");
      expect(store.getState().auth.error).toBeNull();
    });

    it("sets status to authenticated with token/user on fulfillment", () => {
      const store = createTestStore();
      store.dispatch({
        type: login.fulfilled.type,
        payload: { token: "t1", user: authResponse.user },
      });
      const state = store.getState().auth;
      expect(state.status).toBe("authenticated");
      expect(state.token).toBe("t1");
      expect(state.user).toEqual(authResponse.user);
      expect(state.error).toBeNull();
    });

    it("sets status to unauthenticated with the error message on rejection", () => {
      const store = createTestStore();
      store.dispatch({
        type: login.rejected.type,
        payload: "Invalid username or password.",
      });
      const state = store.getState().auth;
      expect(state.status).toBe("unauthenticated");
      expect(state.error).toBe("Invalid username or password.");
    });
  });

  describe("signup", () => {
    it("sets status to authenticated with token/user on fulfillment", () => {
      const store = createTestStore();
      store.dispatch({
        type: signup.fulfilled.type,
        payload: { token: "t2", user: authResponse.user },
      });
      const state = store.getState().auth;
      expect(state.status).toBe("authenticated");
      expect(state.token).toBe("t2");
      expect(state.user).toEqual(authResponse.user);
    });

    it("sets status to unauthenticated with the error message on rejection", () => {
      const store = createTestStore();
      store.dispatch({
        type: signup.rejected.type,
        payload: "Username already exists.",
      });
      const state = store.getState().auth;
      expect(state.status).toBe("unauthenticated");
      expect(state.error).toBe("Username already exists.");
    });
  });

  describe("logout", () => {
    it("clears user/token and sets status to unauthenticated on fulfillment", () => {
      const store = createTestStore();
      store.dispatch({
        type: login.fulfilled.type,
        payload: { token: "t1", user: authResponse.user },
      });
      store.dispatch({ type: logout.fulfilled.type });
      const state = store.getState().auth;
      expect(state.status).toBe("unauthenticated");
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.error).toBeNull();
    });
  });
});

describe("authSlice thunks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("restoreSession reads the token from storage", async () => {
    mockedTokenStorage.getToken.mockResolvedValue("existing-token");
    const store = createTestStore();

    await store.dispatch(restoreSession());

    expect(mockedTokenStorage.getToken).toHaveBeenCalled();
    expect(store.getState().auth.token).toBe("existing-token");
    expect(store.getState().auth.status).toBe("authenticated");
  });

  it("login calls the API, persists the token, and updates state on success", async () => {
    mockedAuthApi.login.mockResolvedValue(authResponse);
    mockedTokenStorage.setToken.mockResolvedValue(undefined);
    const store = createTestStore();

    await store.dispatch(login({ username: "john", password: "password123" }));

    expect(mockedAuthApi.login).toHaveBeenCalledWith({
      username: "john",
      password: "password123",
    });
    expect(mockedTokenStorage.setToken).toHaveBeenCalledWith("token-abc");
    const state = store.getState().auth;
    expect(state.status).toBe("authenticated");
    expect(state.token).toBe("token-abc");
    expect(state.user).toEqual(authResponse.user);
  });

  it("login stores the server error message and does not persist a token on failure", async () => {
    mockedAuthApi.login.mockRejectedValue(
      new ApiError("Invalid username or password.", 401, "401"),
    );
    const store = createTestStore();

    await store.dispatch(login({ username: "john", password: "wrong" }));

    expect(mockedTokenStorage.setToken).not.toHaveBeenCalled();
    const state = store.getState().auth;
    expect(state.status).toBe("unauthenticated");
    expect(state.error).toBe("Invalid username or password.");
  });

  it("signup calls the API, persists the token, and updates state on success", async () => {
    mockedAuthApi.signup.mockResolvedValue(authResponse);
    mockedTokenStorage.setToken.mockResolvedValue(undefined);
    const store = createTestStore();

    await store.dispatch(
      signup({ username: "john", email: "john@example.com", password: "password123" }),
    );

    expect(mockedAuthApi.signup).toHaveBeenCalledWith({
      username: "john",
      email: "john@example.com",
      password: "password123",
    });
    expect(mockedTokenStorage.setToken).toHaveBeenCalledWith("token-abc");
    expect(store.getState().auth.status).toBe("authenticated");
  });

  it("signup stores the server error message on failure (duplicate username)", async () => {
    mockedAuthApi.signup.mockRejectedValue(
      new ApiError("Username already exists.", 409, "409"),
    );
    const store = createTestStore();

    await store.dispatch(
      signup({ username: "john", email: "john@example.com", password: "password123" }),
    );

    expect(store.getState().auth.error).toBe("Username already exists.");
  });

  it("logout clears the stored token", async () => {
    mockedTokenStorage.clearToken.mockResolvedValue(undefined);
    const store = createTestStore();
    store.dispatch({
      type: login.fulfilled.type,
      payload: { token: "t1", user: authResponse.user },
    });

    await store.dispatch(logout());

    expect(mockedTokenStorage.clearToken).toHaveBeenCalled();
    const state = store.getState().auth;
    expect(state.status).toBe("unauthenticated");
    expect(state.user).toBeNull();
  });
});
