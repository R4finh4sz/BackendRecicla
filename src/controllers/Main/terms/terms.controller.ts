import { Request, Response } from "express";
import {
  acceptCurrentTerm,
  createTerm,
  CurrentTermNotFoundError,
  getCurrentTermByRole,
  getTermByDocumentId,
  getTermStatus,
  listTerms,
  TermAlreadyAcceptedError,
  TermNotFoundError,
  updateTerm,
} from "@/services/Main/terms/terms.service";

export async function createTermController(req: Request, res: Response) {
  try {
    const term = await createTerm(req.body);
    return res.status(201).json({ term });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao cadastrar termo" });
  }
}

export async function updateTermController(req: Request, res: Response) {
  try {
    const term = await updateTerm(req.params.documentId, req.body);
    return res.status(201).json({ term });
  } catch (err) {
    if (err instanceof TermNotFoundError) {
      return res.status(404).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno ao atualizar termo" });
  }
}

export async function listTermsController(_req: Request, res: Response) {
  try {
    const terms = await listTerms();
    return res.json({ terms });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno ao listar termos" });
  }
}

export async function getTermByDocumentIdController(req: Request, res: Response) {
  try {
    const term = await getTermByDocumentId(req.params.documentId);
    return res.json({ term });
  } catch (err) {
    if (err instanceof TermNotFoundError) {
      return res.status(404).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno ao buscar termo" });
  }
}

export async function getCurrentTermController(req: Request, res: Response) {
  try {
    const term = await getCurrentTermByRole(req.user!.role);
    return res.json({ term });
  } catch (err) {
    if (err instanceof CurrentTermNotFoundError) {
      return res.status(404).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno ao buscar termo vigente" });
  }
}

export async function getTermStatusController(req: Request, res: Response) {
  try {
    const status = await getTermStatus(req.user!.id, req.user!.role);
    return res.json(status);
  } catch (err) {
    if (err instanceof CurrentTermNotFoundError) {
      return res.status(404).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno ao buscar status do termo" });
  }
}

export async function acceptCurrentTermController(req: Request, res: Response) {
  try {
    const accept = await acceptCurrentTerm(req.user!.id, req.user!.role);
    return res.status(201).json({ accept });
  } catch (err) {
    if (err instanceof CurrentTermNotFoundError) {
      return res.status(404).json({ message: err.message });
    }

    if (err instanceof TermAlreadyAcceptedError) {
      return res.status(409).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno ao aceitar termo" });
  }
}
