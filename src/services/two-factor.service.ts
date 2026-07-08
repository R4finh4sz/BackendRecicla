import crypto from "crypto";
import { securityConfig } from "@/config/env";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/services/email.service";

export class TwoFactorChallengeNotFoundError extends Error {}
export class TwoFactorChallengeExpiredError extends Error {}
export class TwoFactorChallengeBlockedError extends Error {}
export class InvalidTwoFactorCodeError extends Error {}

const CODE_LENGTH = 6;

function createCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(CODE_LENGTH, "0");
}

function hashCode(code: string, salt: string) {
  return crypto.createHash("sha256").update(`${salt}:${code}`).digest("hex");
}

function createCodeSalt() {
  return crypto.randomBytes(32).toString("hex");
}

function getChallengeExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + securityConfig.twoFactorCodeExpiresMinutes);

  return expiresAt;
}

export async function createTwoFactorChallenge(user: { id: string; email: string; name: string }) {
  const code = createCode();
  const codeSalt = createCodeSalt();
  const codeHash = hashCode(code, codeSalt);

  await prisma.twoFactorChallenge.updateMany({
    where: {
      userId: user.id,
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      consumedAt: new Date(),
    },
  });

  const challenge = await prisma.twoFactorChallenge.create({
    data: {
      userId: user.id,
      codeHash,
      codeSalt,
      expiresAt: getChallengeExpiresAt(),
    },
    select: {
      id: true,
      expiresAt: true,
    },
  });

  await sendEmail({
    to: user.email,
    name: user.name,
    subject: "Codigo de verificacao ReciclaOnline",
    textContent: [
      "Olá,",
      "",
      "Recebemos uma solicitação para verificar sua identidade.",
      "",
      "Seu código de verificação é:",
      "",
      `${code}`,
      "",
      `Este código expira em ${securityConfig.twoFactorCodeExpiresMinutes} minutos.`,
      "",
      "Por motivos de segurança:",
      "- Nunca compartilhe este código com ninguém.",
      "- Nossa equipe nunca solicitará esse código por telefone, e-mail ou mensagem.",
      "- Se você não solicitou este código, ignore este e-mail. Nenhuma ação adicional será necessária.",
      "",
      "Atenciosamente,",
      "",
      "Equipe ReciclaOnline",
    ].join("\n"),
    htmlContent: `<p>Olá,</p><p>Recebemos uma solicitação para verificar sua identidade.</p><p>Seu código de verificação é:</p><p><strong>${code}</strong></p><p>⏱️ Este código expira em ${securityConfig.twoFactorCodeExpiresMinutes} minutos.</p><p>Por motivos de segurança:</p><ul><li>Nunca compartilhe este código com ninguém.</li><li>Nossa equipe nunca solicitará esse código por telefone, e-mail ou mensagem.</li><li>Se você não solicitou este código, ignore este e-mail. Nenhuma ação adicional será necessária.</li></ul><p>Atenciosamente,</p><p><strong>Equipe ReciclaOnline</strong></p>`,
  });

  return challenge;
}

export async function verifyTwoFactorChallenge(challengeId: string, code: string) {
  const challenge = await prisma.twoFactorChallenge.findUnique({
    where: { id: challengeId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
        },
      },
    },
  });

  if (!challenge || challenge.consumedAt) {
    throw new TwoFactorChallengeNotFoundError("Desafio 2FA nao encontrado");
  }

  if (challenge.expiresAt <= new Date()) {
    throw new TwoFactorChallengeExpiredError("Codigo 2FA expirado");
  }

  if (challenge.attempts >= securityConfig.twoFactorMaxAttempts) {
    throw new TwoFactorChallengeBlockedError("Codigo 2FA bloqueado por excesso de tentativas");
  }

  const candidateHash = hashCode(code, challenge.codeSalt);
  if (candidateHash !== challenge.codeHash) {
    await prisma.twoFactorChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });

    throw new InvalidTwoFactorCodeError("Codigo 2FA invalido");
  }

  await prisma.twoFactorChallenge.update({
    where: { id: challenge.id },
    data: {
      consumedAt: new Date(),
    },
  });

  return challenge.user;
}
