import { Router } from "express";
import { loginController } from "@/controllers/auth.controller";
import { registerAdminController } from "@/controllers/register/register-admin.controller";
import { registerMasterController } from "@/controllers/register/register-master.controller";
import { registerUserController } from "@/controllers/register/register-user.controller";
import { authMiddleware, requireLevel } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/register/user", registerUserController);
router.post("/register/admin", authMiddleware, requireLevel(3), registerAdminController);
router.post("/register/master", authMiddleware, requireLevel(3), registerMasterController);
router.post("/login", loginController);

export default router;
