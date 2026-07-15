import { Request, Response } from "express";
import {
  InvalidPasswordResetCodeError,
  InvalidPasswordResetTokenError,
  PasswordResetBlockedError,
  PasswordResetChallengeNotFoundError,
  PasswordResetCodeExpiredError,
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetCode,
} from "@/services/forgot-password/forgot-password.service";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyPasswordResetCodeSchema,
} from "@/validation/password-reset.validation";

export async function forgotPasswordController(req: Request, res: Response) {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors });
  try {
    const result = await requestPasswordReset(parsed.data);
    return res.status(200).json({ ...result, message: "Código de recuperação enviado por e-mail" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao solicitar recuperação de senha" });
  }
}

export async function verifyPasswordResetCodeController(req: Request, res: Response) {
  const parsed = verifyPasswordResetCodeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors });
  try {
    const result = await verifyPasswordResetCode(parsed.data);
    return res.status(200).json({ ...result, message: "Código validado" });
  } catch (err) {
    if (
      err instanceof InvalidPasswordResetCodeError ||
      err instanceof PasswordResetChallengeNotFoundError ||
      err instanceof PasswordResetCodeExpiredError
    ) {
      return res.status(401).json({ message: "Código inválido ou expirado" });
    }
    if (err instanceof PasswordResetBlockedError) return res.status(429).json({ message: err.message, blockedUntil: err.blockedUntil });
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao validar código de recuperação" });
  }
}

export async function resetPasswordController(req: Request, res: Response) {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors });
  try {
    await resetPassword(parsed.data);
    return res.status(200).json({ message: "Senha redefinida com sucesso" });
  } catch (err) {
    if (err instanceof InvalidPasswordResetTokenError) return res.status(401).json({ message: err.message });
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao redefinir senha" });
  }
}
