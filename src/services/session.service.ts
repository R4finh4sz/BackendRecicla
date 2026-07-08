import { prisma } from "@/lib/prisma";
import { authConfig } from "@/config/env";

export function getSessionExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + authConfig.sessionExpiresMinutes);

  return expiresAt;
}

export async function createSession(userId: string) {
  return prisma.session.create({
    data: {
      userId,
      expiresAt: getSessionExpiresAt(),
    },
  });
}

export async function revokeSession(sessionId: string) {
  await prisma.session.updateMany({
    where: {
      id: sessionId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function isSessionActive(sessionId: string, userId: string) {
  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      userId,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(session);
}
