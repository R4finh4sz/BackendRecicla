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

export interface LoginResult {
  twoFactorRequired: true;
  challengeId: string;
  expiresAt: Date;
  message: string;
}

export interface AuthResult {
  token: string;
}

export interface RegisterResult {
  user: {
    id: string;
  };
}

export interface AuthTokenPayload {
  sub: string;
  sid: string;
  role: Role;
  level: number;
}
