import { Request, Response } from "express";
import {
  InvalidTwoFactorCodeError,
  TwoFactorChallengeBlockedError,
  TwoFactorChallengeExpiredError,
  TwoFactorChallengeNotFoundError,
  TwoFactorInactiveUserError,
  verifyTwoFactor,
} from "@/services/two-factor/two-factor.service";
import { verifyTwoFactorSchema } from "@/validation/login.validation";

export async function verifyTwoFactorController(req: Request, res: Response) {
  const parsed = verifyTwoFactorSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors });
  }

  try {
    return res.status(200).json(await verifyTwoFactor(parsed.data));
  } catch (err) {
    if (err instanceof InvalidTwoFactorCodeError) return res.status(401).json({ message: err.message });
    if (err instanceof TwoFactorChallengeNotFoundError) return res.status(404).json({ message: err.message });
    if (err instanceof TwoFactorChallengeExpiredError || err instanceof TwoFactorInactiveUserError) {
      return res.status(403).json({ message: err.message });
    }
    if (err instanceof TwoFactorChallengeBlockedError) return res.status(429).json({ message: err.message });
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao validar 2FA" });
  }
}
