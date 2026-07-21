import { Request, Response } from "express";
import { AccountError, deleteAccount, exportAccountPdf } from "@/services/Main/account/account.service";

function handleError(res: Response, error: unknown) {
  if (error instanceof AccountError) return res.status(error.status).json({ message: error.message });
  console.error(error);
  return res.status(500).json({ message: "Erro interno ao processar a conta" });
}

export async function deleteAccountController(req: Request, res: Response) {
  try {
    await deleteAccount(req.user!.id, req.body.password);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error);
  }
}

export async function exportAccountController(req: Request, res: Response) {
  try {
    const pdf = await exportAccountPdf(req.user!.id);
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="meus-dados-${date}.pdf"`);
    res.setHeader("Content-Length", pdf.length.toString());
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(pdf);
  } catch (error) {
    return handleError(res, error);
  }
}
