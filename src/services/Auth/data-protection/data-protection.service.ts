import crypto from "crypto";
import { dataProtectionConfig } from "@/config/env";

const PREFIX = "enc:v1";

function getKey() {
  const key = Buffer.from(dataProtectionConfig.encryptionKey, "base64");
  if (key.length !== 32) {
    throw new Error("DATA_ENCRYPTION_KEY deve ser uma chave Base64 de 32 bytes");
  }
  return key;
}

export function encryptSensitiveData(value: string) {
  if (value.startsWith(`${PREFIX}:`)) return value;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(":");
}

export function decryptSensitiveData(value: string) {
  if (!value.startsWith(`${PREFIX}:`)) return value;
  const parts = value.split(":");
  if (parts.length !== 5) throw new Error("Dado criptografado inválido");
  const [, , iv, tag, encrypted] = parts;
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function createSearchHash(value: string) {
  return crypto.createHmac("sha256", getKey()).update(value).digest("hex");
}
