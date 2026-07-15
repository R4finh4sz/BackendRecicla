import { Router } from "express";
import { Role } from "@prisma/client";
import { loginController } from "@/controllers/Auth/login/login.controller";
import { logoutController } from "@/controllers/Main/logout/logout.controller";
import { verifyTwoFactorController } from "@/controllers/Auth/two-factor/two-factor.controller";
import {
  forgotPasswordController,
  resetPasswordController,
  verifyPasswordResetCodeController,
} from "@/controllers/Auth/forgot-password/forgot-password.controller";
import { registerAdminController } from "@/controllers/Main/register/register-admin.controller";
import { registerUserController } from "@/controllers/Auth/register/register-user.controller";
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
