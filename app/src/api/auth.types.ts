export type LoginRequest = {
  username: string;
  password: string;
};

export type SignupRequest = {
  username: string;
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: AuthenticatedUser;
};
