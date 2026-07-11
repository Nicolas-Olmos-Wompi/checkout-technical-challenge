import { Request } from "express";
import { AuthenticatedUser } from "domain/src/model/auth.type";

export type RequestWithUser = Request & { user: AuthenticatedUser };
