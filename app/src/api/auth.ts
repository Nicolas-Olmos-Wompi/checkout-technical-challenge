import { apiRequest } from "./client";
import { AuthResponse, LoginRequest, SignupRequest } from "./auth.types";

export function login(request: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: request,
  });
}

export function signup(request: SignupRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: request,
  });
}
