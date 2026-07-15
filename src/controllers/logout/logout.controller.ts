import { Request, Response } from "express";
import { revokeSession } from "@/services/session/session.service";

export async function logoutController(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Não autenticado" });
  await revokeSession(req.user.sessionId);
  return res.status(204).send();
}
