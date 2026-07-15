import { Role } from "@prisma/client";
import { Router } from "express";
import { adminRedemptionsController, balanceController, createProductController, grantEcoCoinController, listAdminProductsController, listProductsController, redeemController, userRedemptionsController, validatePickupController } from "@/controllers/Main/store/store.controller";
import { CreateProductDto, GrantEcoCoinDto, RedeemProductDto, ValidatePickupDto } from "@/dto/store/store.dto";
import { authMiddleware, requireRole } from "@/middlewares/auth.middleware";
import { validateDto } from "@/middlewares/validate-dto.middleware";

const router = Router();
router.use(authMiddleware);

router.get("/products", requireRole(Role.USER), listProductsController);
router.get("/balance", requireRole(Role.USER), balanceController);
router.post("/redemptions", requireRole(Role.USER), validateDto(RedeemProductDto), redeemController);
router.get("/redemptions", requireRole(Role.USER), userRedemptionsController);

router.post("/admin/products", requireRole(Role.ADMIN), validateDto(CreateProductDto), createProductController);
router.get("/admin/products", requireRole(Role.ADMIN), listAdminProductsController);
router.post("/admin/ecocoins", requireRole(Role.ADMIN), validateDto(GrantEcoCoinDto), grantEcoCoinController);
router.get("/admin/redemptions", requireRole(Role.ADMIN), adminRedemptionsController);
router.post("/admin/redemptions/validate", requireRole(Role.ADMIN), validateDto(ValidatePickupDto), validatePickupController);

export default router;
