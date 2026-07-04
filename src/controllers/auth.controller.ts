import { Request, Response } from "express";
import {
  login,
  InvalidCredentialsError,
  InactiveUserError,
} from "@/services/auth.service";
import { loginSchema } from "@/validation/login.validation";

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

    console.error(err);
    return res.status(500).json({ message: "Erro interno ao processar login" });
  }
}
