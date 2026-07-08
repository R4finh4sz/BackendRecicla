import bcrypt from "bcryptjs";

const PASSWORD_SALT_ROUNDS = 12;

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(PASSWORD_SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);

  return { hash, salt };
}

export async function verifyPassword(password: string, hash: string, salt?: string | null) {
  if (!salt) {
    return bcrypt.compare(password, hash);
  }

  const candidateHash = await bcrypt.hash(password, salt);
  return candidateHash === hash;
}
