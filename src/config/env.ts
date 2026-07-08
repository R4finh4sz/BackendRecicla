function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const authConfig = {
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  sessionExpiresMinutes: Number(process.env.SESSION_EXPIRES_MINUTES || 60),
};

export const brevoConfig = {
  smtpHost: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
  smtpPort: Number(process.env.BREVO_SMTP_PORT || 587),
  smtpUser: process.env.BREVO_SMTP_USER,
  smtpPass: process.env.BREVO_SMTP_PASS,
  senderEmail: process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SMTP_USER,
  senderName: process.env.BREVO_SENDER_NAME || "ReciclaOnline",
};

export const securityConfig = {
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMaxAttempts: Number(process.env.RATE_LIMIT_MAX_ATTEMPTS || 6),
  bruteForceBlockMs: Number(process.env.BRUTE_FORCE_BLOCK_MS || 15 * 60 * 1000),
  bruteForceDelayMs: Number(process.env.BRUTE_FORCE_DELAY_MS || 500),
  twoFactorCodeExpiresMinutes: Number(process.env.TWO_FACTOR_CODE_EXPIRES_MINUTES || 15),
  twoFactorMaxAttempts: Number(process.env.TWO_FACTOR_MAX_ATTEMPTS || 6),
};
