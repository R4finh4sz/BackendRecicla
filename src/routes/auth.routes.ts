import { Router } from "express";
import { Role } from "@prisma/client";
import { loginController } from "@/controllers/auth.controller";
import { registerAdminController } from "@/controllers/register/register-admin.controller";
import { registerUserController } from "@/controllers/register/register-user.controller";
import { authMiddleware, requireRole } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/register/user", registerUserController);
router.post("/register/admin", authMiddleware, requireRole(Role.MASTER), registerAdminController);
router.post("/login", loginController);

export default router;
