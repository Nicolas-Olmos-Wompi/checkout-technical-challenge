import * as SecureStore from "expo-secure-store";
import { clearToken, getToken, setToken } from "../tokenStorage";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe("tokenStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reads the token under the expected key", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("abc123");

    const token = await getToken();

    expect(token).toBe("abc123");
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("auth_token");
  });

  it("returns null when no token is stored", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    expect(await getToken()).toBeNull();
  });

  it("persists the token under the expected key", async () => {
    await setToken("new-token");

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("auth_token", "new-token");
  });

  it("deletes the token on clear", async () => {
    await clearToken();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("auth_token");
  });
});
