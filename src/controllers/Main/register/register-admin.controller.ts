import { Request, Response } from "express";
import { registerAdmin } from "@/services/Main/register/register-admin.service";
import { UserAlreadyExistsError } from "@/services/Auth/register/register.service";
import { registerSchema } from "@/validation/register.validation";

export async function registerAdminController(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const result = await registerAdmin(parsed.data);
    return res.status(201).json(result);
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return res.status(409).json({ message: "Não foi possível concluir o cadastro com os dados informados" });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno ao cadastrar administrador" });
  }
}
