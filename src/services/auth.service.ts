import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { roleLevel } from "@/config/roles";
import { authConfig } from "@/config/env";
import { verifyPassword } from "@/services/password.service";
import { createSession } from "@/services/session.service";
import {
  createTwoFactorChallenge,
  verifyTwoFactorChallenge,
} from "@/services/two-factor.service";
import {
  AuthResult,
  AuthTokenPayload,
  LoginInput,
  LoginResult,
  VerifyTwoFactorInput,
} from "@/types/auth.types";

export class InvalidCredentialsError extends Error {}
export class InactiveUserError extends Error {}

export async function login({ email, password }: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      passwordSalt: true,
      role: true,
      active: true,
    },
  });

  if (!user) {
    throw new InvalidCredentialsError("E-mail ou senha invalidos");
  }

  const isPasswordValid = await verifyPassword(password, user.password, user.passwordSalt);
  if (!isPasswordValid) {
    throw new InvalidCredentialsError("E-mail ou senha invalidos");
  }

  if (!user.active) {
    throw new InactiveUserError("Usuario desativado");
  }

  const challenge = await createTwoFactorChallenge(user);

  return {
    twoFactorRequired: true,
    challengeId: challenge.id,
    expiresAt: challenge.expiresAt,
    message: "Codigo 2FA enviado para o e-mail cadastrado",
  };
}

export async function verifyTwoFactor({
  challengeId,
  code,
}: VerifyTwoFactorInput): Promise<AuthResult> {
  const user = await verifyTwoFactorChallenge(challengeId, code);

  if (!user.active) {
    throw new InactiveUserError("Usuario desativado");
  }

  const level = roleLevel(user.role);
  const session = await createSession(user.id);

  const payload: AuthTokenPayload = {
    sub: user.id,
    sid: session.id,
    email: user.email,
    role: user.role,
    level,
  };

  const token = jwt.sign(
    payload,
    authConfig.jwtSecret,
    { expiresIn: authConfig.jwtExpiresIn } as jwt.SignOptions
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      level,
    },
  };
}
