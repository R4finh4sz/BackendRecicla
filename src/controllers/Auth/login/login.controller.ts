import { Request, Response } from "express";
import { InactiveUserError, InvalidCredentialsError, login } from "@/services/Auth/login/login.service";
import { EmailConfigurationError, EmailDeliveryError } from "@/services/Auth/email/email.service";
import { loginSchema } from "@/validation/login.validation";

export async function loginController(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors });
  }

  try {
    return res.status(200).json(await login(parsed.data));
  } catch (err) {
    if (err instanceof InvalidCredentialsError) return res.status(401).json({ message: err.message });
    if (err instanceof InactiveUserError) return res.status(403).json({ message: err.message });
    if (err instanceof EmailConfigurationError || err instanceof EmailDeliveryError) {
      return res.status(502).json({ message: "Não foi possível enviar o código de autenticação" });
    }
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao processar login" });
  }
}
