ALTER TABLE "users" ADD COLUMN "cpfHash" TEXT;
ALTER TABLE "users" ADD COLUMN "emailHash" TEXT;

ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_cpf_key";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";

ALTER TABLE "users"
ALTER COLUMN "birthDate" TYPE TEXT
USING TO_CHAR("birthDate" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');

CREATE UNIQUE INDEX "users_cpfHash_key" ON "users"("cpfHash");
CREATE UNIQUE INDEX "users_emailHash_key" ON "users"("emailHash");
