import { Request, Response } from "express";
import {
  login,
  verifyTwoFactor,
  InvalidCredentialsError,
  InactiveUserError,
} from "@/services/auth.service";
import { revokeSession } from "@/services/session.service";
import { EmailConfigurationError, EmailDeliveryError } from "@/services/email.service";
import {
  InvalidTwoFactorCodeError,
  TwoFactorChallengeBlockedError,
  TwoFactorChallengeExpiredError,
  TwoFactorChallengeNotFoundError,
} from "@/services/two-factor.service";
import { loginSchema, verifyTwoFactorSchema } from "@/validation/login.validation";

export async function loginController(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados invalidos",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const result = await login(parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return res.status(401).json({ message: err.message });
    }

    if (err instanceof InactiveUserError) {
      return res.status(403).json({ message: err.message });
    }

    if (err instanceof EmailConfigurationError || err instanceof EmailDeliveryError) {
      return res.status(502).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno ao processar login" });
  }
}

export async function verifyTwoFactorController(req: Request, res: Response) {
  const parsed = verifyTwoFactorSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados invalidos",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const result = await verifyTwoFactor(parsed.data);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof InvalidTwoFactorCodeError) {
      return res.status(401).json({ message: err.message });
    }

    if (err instanceof TwoFactorChallengeNotFoundError) {
      return res.status(404).json({ message: err.message });
    }

    if (err instanceof TwoFactorChallengeExpiredError) {
      return res.status(403).json({ message: err.message });
    }

    if (err instanceof TwoFactorChallengeBlockedError) {
      return res.status(429).json({ message: err.message });
    }

    if (err instanceof InactiveUserError) {
      return res.status(403).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno ao validar 2FA" });
  }
}

export async function logoutController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Nao autenticado" });
  }

  await revokeSession(req.user.sessionId);
  return res.status(204).send();
}
