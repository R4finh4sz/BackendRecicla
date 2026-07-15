CREATE TABLE "password_reset_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "codeSalt" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "blockedUntil" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "resetTokenHash" TEXT,
    "resetTokenSalt" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_challenges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "password_reset_challenges_userId_idx" ON "password_reset_challenges"("userId");
CREATE INDEX "password_reset_challenges_expiresAt_idx" ON "password_reset_challenges"("expiresAt");
CREATE INDEX "password_reset_challenges_blockedUntil_idx" ON "password_reset_challenges"("blockedUntil");

ALTER TABLE "password_reset_challenges" ADD CONSTRAINT "password_reset_challenges_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
