import { Request, Response } from "express";
import { registerUser } from "@/services/register/register-user.service";
import { UserAlreadyExistsError } from "@/services/register/register.service";
import { registerSchema } from "@/validation/register.validation";

export async function registerUserController(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const result = await registerUser(parsed.data);
    return res.status(201).json(result);
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return res.status(409).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno ao cadastrar usuário" });
  }
}
