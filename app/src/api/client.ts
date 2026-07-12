import { getToken } from "../auth/tokenStorage";
import { ApiError, HttpResponseEnvelope } from "./types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  auth?: boolean;
};

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path, API_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Thin wrapper around fetch that:
 * - Prefixes requests with EXPO_PUBLIC_API_URL
 * - Injects the Bearer token when `auth: true`
 * - Unwraps the server's HTTPResponse envelope ({ status, code, message, data })
 * - Throws ApiError with the server-provided message on non-2xx responses
 */
export async function apiRequest<TData>(
  path: string,
  options: RequestOptions = {},
): Promise<TData> {
  const { method = "GET", body, query, auth = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Check your connection and try again.",
      0,
    );
  }

  let envelope: HttpResponseEnvelope<TData> | undefined;
  try {
    envelope = await response.json();
  } catch {
    // No/invalid JSON body — fall through to status-based handling below.
  }

  if (!response.ok) {
    const message =
      envelope?.message ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, envelope?.code);
  }

  return envelope?.data as TData;
}
