import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .transform((email) => email.toLowerCase()),
  password: z.string().min(1, "Senha obrigatória").max(128, "Senha muito longa"),
});

export const verifyTwoFactorSchema = z.object({
  challengeId: z.string().uuid("Desafio 2FA inválido"),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Código 2FA inválido"),
});
