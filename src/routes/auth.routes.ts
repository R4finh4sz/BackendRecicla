import { Router } from "express";
import { Role } from "@prisma/client";
import { loginController } from "@/controllers/login/login.controller";
import { logoutController } from "@/controllers/logout/logout.controller";
import { verifyTwoFactorController } from "@/controllers/two-factor/two-factor.controller";
import {
  forgotPasswordController,
  resetPasswordController,
  verifyPasswordResetCodeController,
} from "@/controllers/forgot-password/forgot-password.controller";
import { registerAdminController } from "@/controllers/register/register-admin.controller";
import { registerUserController } from "@/controllers/register/register-user.controller";
import { authMiddleware, requireRole } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/register/user", registerUserController);
router.post("/register/admin", authMiddleware, requireRole(Role.MASTER), registerAdminController);
router.post("/login", loginController);
router.post("/2fa/verify", verifyTwoFactorController);
router.post("/password/forgot", forgotPasswordController);
router.post("/password/verify-code", verifyPasswordResetCodeController);
router.post("/password/reset", resetPasswordController);
router.post("/logout", authMiddleware, logoutController);

export default router;
