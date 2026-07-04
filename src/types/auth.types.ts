import { Role } from "@prisma/client";

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  level: number;
}

export interface LoginResult {
  token: string;
  user: AuthenticatedUser;
}

export interface RegisterResult {
  user: AuthenticatedUser;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: Role;
  level: number;
}
