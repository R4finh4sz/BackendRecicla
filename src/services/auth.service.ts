import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { roleLevel } from "@/config/roles";
import { authConfig } from "@/config/env";
import {
  AuthTokenPayload,
  LoginInput,
  LoginResult,
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
      role: true,
      active: true,
    },
  });

  if (!user) {
    throw new InvalidCredentialsError("E-mail ou senha invalidos");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new InvalidCredentialsError("E-mail ou senha invalidos");
  }

  if (!user.active) {
    throw new InactiveUserError("Usuario desativado");
  }

  const level = roleLevel(user.role);

  const payload: AuthTokenPayload = {
    sub: user.id,
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
