import { Role } from "@prisma/client";

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyTwoFactorInput {
  challengeId: string;
  code: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface VerifyPasswordResetCodeInput {
  challengeId: string;
  code: string;
}

export interface ResetPasswordInput {
  resetToken: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  level: number;
}

export interface LoginResult {
  twoFactorRequired: true;
  challengeId: string;
  expiresAt: Date;
  message: string;
}

export interface AuthResult {
  token: string;
  user: AuthenticatedUser;
}

export interface RegisterResult {
  user: AuthenticatedUser;
}

export interface AuthTokenPayload {
  sub: string;
  sid: string;
  email: string;
  role: Role;
  level: number;
}
