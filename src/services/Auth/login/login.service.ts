import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/services/Auth/password/password.service";
import { createTwoFactorChallenge } from "@/services/Auth/two-factor/two-factor.service";
import {
  LoginInput,
  LoginResult,
} from "@/types/auth.types";
import { createSearchHash, decryptSensitiveData } from "@/services/Auth/data-protection/data-protection.service";

export class InvalidCredentialsError extends Error {}
export class InactiveUserError extends Error {}

export async function login({ email, password }: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { emailHash: createSearchHash(email) },
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
    throw new InvalidCredentialsError("E-mail ou senha inválidos");
  }

  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new InvalidCredentialsError("E-mail ou senha inválidos");
  }

  if (!user.active) {
    throw new InactiveUserError("Usuário desativado");
  }

  const challenge = await createTwoFactorChallenge({
    ...user,
    name: decryptSensitiveData(user.name),
    email: decryptSensitiveData(user.email),
  });

  return {
    twoFactorRequired: true,
    challengeId: challenge.id,
    expiresAt: challenge.expiresAt,
    message: "Código 2FA enviado para o e-mail cadastrado",
  };
}
