import { apiRequest } from "../client";
import { ApiError } from "../types";
import * as tokenStorage from "../../auth/tokenStorage";

jest.mock("../../auth/tokenStorage");

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe("apiRequest", () => {
  const mockedGetToken = tokenStorage.getToken as jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it("returns the unwrapped data field on a successful response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        status: 200,
        code: "OK",
        message: "Solicitud ejecutada correctamente.",
        data: { id: "1", username: "john" },
      }),
    );

    const result = await apiRequest<{ id: string; username: string }>("/auth/login", {
      method: "POST",
      body: { username: "john", password: "password123" },
    });

    expect(result).toEqual({ id: "1", username: "john" });
  });

  it("sends the request body as JSON with the correct method", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse({ data: {} }));

    await apiRequest("/auth/signup", {
      method: "POST",
      body: { username: "john", email: "john@example.com", password: "password123" },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/signup"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          username: "john",
          email: "john@example.com",
          password: "password123",
        }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("appends query params to the URL, skipping undefined values", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse({ data: {} }));

    await apiRequest("/products", {
      query: { page: 2, pageSize: undefined, name: "chair" },
    });

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).toContain("name=chair");
    expect(calledUrl).not.toContain("pageSize");
  });

  it("injects the Authorization header with the stored token when auth is true", async () => {
    mockedGetToken.mockResolvedValue("stored-token-123");
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse({ data: {} }));

    await apiRequest("/products", { auth: true });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer stored-token-123" }),
      }),
    );
  });

  it("does not send an Authorization header when auth is false", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse({ data: {} }));

    await apiRequest("/auth/login", { method: "POST" });

    const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
    expect(mockedGetToken).not.toHaveBeenCalled();
  });

  it("does not send an Authorization header when auth is true but no token is stored", async () => {
    mockedGetToken.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse({ data: {} }));

    await apiRequest("/products", { auth: true });

    const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it("throws ApiError with the server message and status on a non-2xx response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(
        { status: 401, code: "401", message: "Invalid username or password." },
        401,
      ),
    );

    await expect(apiRequest("/auth/login", { method: "POST" })).rejects.toMatchObject({
      message: "Invalid username or password.",
      status: 401,
      code: "401",
    });
  });

  it("throws an ApiError instance on non-2xx responses", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ message: "Conflict" }, 409),
    );

    await expect(apiRequest("/auth/signup", { method: "POST" })).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it("falls back to a generic message when the error response has no JSON body", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("no body")),
    } as unknown as Response);

    await expect(apiRequest("/auth/login", { method: "POST" })).rejects.toMatchObject({
      message: "Request failed with status 500",
      status: 500,
    });
  });

  it("throws an ApiError when the network request fails outright", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network request failed"));

    await expect(apiRequest("/auth/login", { method: "POST" })).rejects.toMatchObject({
      message: "Unable to reach the server. Check your connection and try again.",
      status: 0,
    });
  });
});
