import { User } from "./user.entity";

export type SignupCommand = {
  username: string;
  password: string;
};

export type LoginCommand = {
  username: string;
  password: string;
};

export type AuthResult = {
  user: User;
  token: string;
  expiresIn: string;
};

export type AuthenticatedUser = {
  id: string;
  username: string;
};
