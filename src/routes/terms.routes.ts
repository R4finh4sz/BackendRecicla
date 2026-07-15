import { Role } from "@prisma/client";
import { Router } from "express";
import {
  acceptCurrentTermController,
  createTermController,
  getCurrentTermController,
  getTermByDocumentIdController,
  getTermStatusController,
  listTermsController,
  updateTermController,
} from "@/controllers/Main/terms/terms.controller";
import { CreateTermDto } from "@/dto/terms/create-term.dto";
import { UpdateTermDto } from "@/dto/terms/update-term.dto";
import { authMiddleware, requireRole } from "@/middlewares/auth.middleware";
import { validateDto } from "@/middlewares/validate-dto.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/current", getCurrentTermController);
router.get("/status", getTermStatusController);
router.post("/accept", acceptCurrentTermController);

router.post("/create", requireRole(Role.MASTER), validateDto(CreateTermDto), createTermController);
router.put("/edit/:documentId", requireRole(Role.MASTER), validateDto(UpdateTermDto), updateTermController);
router.get("/list", requireRole(Role.MASTER), listTermsController);
router.get("/detail/:documentId", requireRole(Role.MASTER), getTermByDocumentIdController);

export default router;
