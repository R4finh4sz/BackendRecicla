import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(128, "Senha muito longa");

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("E-mail inválido").transform((email) => email.toLowerCase()),
});

export const verifyPasswordResetCodeSchema = z.object({
  challengeId: z.string().uuid("Desafio de recuperação inválido"),
  code: z.string().trim().regex(/^\d{6}$/, "Código de recuperação inválido"),
});

export const resetPasswordSchema = z
  .object({
    resetToken: z.string().trim().min(1, "Token de redefinição obrigatório"),
    password: passwordSchema,
    passwordConfirmation: passwordSchema,
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem",
    path: ["passwordConfirmation"],
  });
