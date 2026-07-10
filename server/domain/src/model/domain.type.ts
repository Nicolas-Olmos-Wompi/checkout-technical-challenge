type AuthUsersPayload = {
  auth_time: number;
  client_id: string;
  exp: number;
  event_id: string;
  iat: number;
  iss: string;
  jti: string;
  scope: string;
  sub: string;
  token_use: string;
  username: string;
};

type UserEmail = {
  email: string;
};

export type {AuthUsersPayload, UserEmail};
