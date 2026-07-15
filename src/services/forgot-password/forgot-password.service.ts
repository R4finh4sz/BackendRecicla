import crypto from "crypto";
import { securityConfig } from "@/config/env";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/services/email/email.service";
import { hashPassword } from "@/services/password/password.service";
import { createSearchHash, decryptSensitiveData } from "@/services/data-protection/data-protection.service";
import {
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyPasswordResetCodeInput,
} from "@/types/auth.types";

export class PasswordResetChallengeNotFoundError extends Error {}
export class PasswordResetCodeExpiredError extends Error {}
export class PasswordResetBlockedError extends Error {
  constructor(message: string, public readonly blockedUntil: Date) {
    super(message);
  }
}
export class InvalidPasswordResetCodeError extends Error {}
export class InvalidPasswordResetTokenError extends Error {}

const CODE_LIMIT = 1_000_000;

function digest(value: string, salt: string) {
  return crypto.createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

function addMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60_000);
}

function addHours(hours: number) {
  return new Date(Date.now() + hours * 3_600_000);
}

export async function requestPasswordReset({ email }: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: { emailHash: createSearchHash(email) },
    select: { id: true, email: true, name: true, active: true },
  });

  if (!user || !user.active) {
    return {
      challengeId: crypto.randomUUID(),
      expiresAt: addMinutes(securityConfig.passwordResetCodeExpiresMinutes),
    };
  }

  const blockedChallenge = await prisma.passwordResetChallenge.findFirst({
    where: { userId: user.id, blockedUntil: { gt: new Date() } },
    orderBy: { blockedUntil: "desc" },
    select: { blockedUntil: true },
  });

  if (blockedChallenge?.blockedUntil) {
    return {
      challengeId: crypto.randomUUID(),
      expiresAt: addMinutes(securityConfig.passwordResetCodeExpiresMinutes),
    };
  }

  const code = crypto.randomInt(0, CODE_LIMIT).toString().padStart(6, "0");
  const codeSalt = crypto.randomBytes(32).toString("hex");

  await prisma.passwordResetChallenge.updateMany({
    where: { userId: user.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const challenge = await prisma.passwordResetChallenge.create({
    data: {
      userId: user.id,
      codeHash: digest(code, codeSalt),
      codeSalt,
      expiresAt: addMinutes(securityConfig.passwordResetCodeExpiresMinutes),
    },
    select: { id: true, expiresAt: true },
  });

  try {
    await sendEmail({
      to: decryptSensitiveData(user.email),
      name: decryptSensitiveData(user.name),
      subject: "Recuperação de senha ReciclaOnline",
      textContent: `Olá, ${decryptSensitiveData(user.name)}.\n\nSeu código para redefinir a senha é: ${code}\n\nEle expira em ${securityConfig.passwordResetCodeExpiresMinutes} minutos. Se você não solicitou a recuperação, ignore este e-mail.`,
      htmlContent: `<p>Olá, ${decryptSensitiveData(user.name)}.</p><p>Seu código para redefinir a senha é:</p><p><strong>${code}</strong></p><p>Ele expira em ${securityConfig.passwordResetCodeExpiresMinutes} minutos.</p><p>Se você não solicitou a recuperação, ignore este e-mail.</p>`,
    });
  } catch (error) {
    console.error("Falha interna no envio do e-mail de recuperação:", error);
  }

  return { challengeId: challenge.id, expiresAt: challenge.expiresAt };
}

export async function verifyPasswordResetCode({ challengeId, code }: VerifyPasswordResetCodeInput) {
  const challenge = await prisma.passwordResetChallenge.findUnique({ where: { id: challengeId } });
  const now = new Date();

  if (!challenge || challenge.consumedAt || challenge.verifiedAt) {
    throw new PasswordResetChallengeNotFoundError("Desafio de recuperação não encontrado");
  }
  if (challenge.blockedUntil && challenge.blockedUntil > now) {
    throw new PasswordResetBlockedError("Recuperação de senha bloqueada temporariamente", challenge.blockedUntil);
  }
  if (challenge.expiresAt <= now) {
    throw new PasswordResetCodeExpiredError("Código de recuperação expirado");
  }

  if (digest(code, challenge.codeSalt) !== challenge.codeHash) {
    const attempts = challenge.attempts + 1;
    const blockedUntil = attempts >= securityConfig.passwordResetMaxAttempts
      ? addHours(securityConfig.passwordResetBlockHours)
      : null;

    await prisma.passwordResetChallenge.update({
      where: { id: challenge.id },
      data: { attempts, blockedUntil },
    });

    if (blockedUntil) {
      throw new PasswordResetBlockedError(
        `Recuperação bloqueada por ${securityConfig.passwordResetBlockHours} horas`,
        blockedUntil
      );
    }
    throw new InvalidPasswordResetCodeError("Código de recuperação inválido");
  }

  const tokenSecret = crypto.randomBytes(48).toString("base64url");
  const resetToken = `${challenge.id}.${tokenSecret}`;
  const resetTokenSalt = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiresAt = addMinutes(securityConfig.passwordResetTokenExpiresMinutes);

  await prisma.passwordResetChallenge.update({
    where: { id: challenge.id },
    data: {
      verifiedAt: now,
      resetTokenHash: digest(tokenSecret, resetTokenSalt),
      resetTokenSalt,
      resetTokenExpiresAt,
    },
  });

  return { resetToken, expiresAt: resetTokenExpiresAt };
}

export async function resetPassword({ resetToken, password }: ResetPasswordInput) {
  const separator = resetToken.indexOf(".");
  const challengeId = separator > 0 ? resetToken.slice(0, separator) : "";
  const tokenSecret = separator > 0 ? resetToken.slice(separator + 1) : "";
  const challenge = challengeId
    ? await prisma.passwordResetChallenge.findFirst({
        where: {
          id: challengeId,
          verifiedAt: { not: null },
          consumedAt: null,
          resetTokenExpiresAt: { gt: new Date() },
          resetTokenHash: { not: null },
          resetTokenSalt: { not: null },
        },
        select: { id: true, userId: true, resetTokenHash: true, resetTokenSalt: true },
      })
    : null;

  if (
    !challenge ||
    digest(tokenSecret, challenge.resetTokenSalt!) !== challenge.resetTokenHash
  ) {
    throw new InvalidPasswordResetTokenError("Token de redefinição inválido ou expirado");
  }

  const hashedPassword = await hashPassword(password);
  await prisma.$transaction(async (tx) => {
    const consumed = await tx.passwordResetChallenge.updateMany({
      where: { id: challenge.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (consumed.count !== 1) {
      throw new InvalidPasswordResetTokenError("Token de redefinição já utilizado");
    }
    await tx.user.update({
      where: { id: challenge.userId },
      data: { password: hashedPassword },
    });
    await tx.session.updateMany({
      where: { userId: challenge.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  });
}
