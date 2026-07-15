import { randomBytes } from "crypto";
import { Prisma, RedemptionStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { decryptSensitiveData } from "@/services/Auth/data-protection/data-protection.service";

const REDEMPTION_DAYS = 5;
const productPublicSelect = {
  id: true, name: true, description: true, photo: true, price: true,
  quantity: true, city: true, state: true, active: true, createdAt: true, updatedAt: true,
} satisfies Prisma.ProductSelect;
const redemptionPublicSelect = {
  id: true, quantity: true, unitPrice: true, totalPrice: true, pickupCode: true,
  status: true, expiresAt: true, completedAt: true, createdAt: true, updatedAt: true,
} satisfies Prisma.RedemptionSelect;

export class StoreError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

function sameLocation(a: { city: string; state: string }, b: { city: string; state: string }) {
  return a.city.trim().toLocaleLowerCase("pt-BR") === b.city.trim().toLocaleLowerCase("pt-BR") &&
    a.state.trim().toUpperCase() === b.state.trim().toUpperCase();
}

function decryptedLocation(value: { city: string; state: string }) {
  return { city: decryptSensitiveData(value.city), state: decryptSensitiveData(value.state) };
}

function decryptPickupUser<T extends { user?: { name: string } }>(value: T): T {
  if (value.user) value.user.name = decryptSensitiveData(value.user.name);
  return value;
}

export async function createProduct(adminId: string, input: { name: string; description: string; photo: string; price: string; quantity: number }) {
  const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { city: true, state: true } });
  if (!admin) throw new StoreError("Administrador não encontrado", 404);
  const location = decryptedLocation(admin);
  return prisma.product.create({ data: { ...input, adminId, city: location.city, state: location.state }, select: productPublicSelect });
}

export async function listProductsForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { city: true, state: true } });
  if (!user) throw new StoreError("Usuário não encontrado", 404);
  const location = decryptedLocation(user);
  return prisma.product.findMany({
    where: { city: { equals: location.city, mode: "insensitive" }, state: { equals: location.state, mode: "insensitive" }, active: true, quantity: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    select: productPublicSelect,
  });
}

export async function listAdminProducts(adminId: string) {
  return prisma.product.findMany({ where: { adminId }, orderBy: { createdAt: "desc" }, select: productPublicSelect });
}

export async function grantEcoCoin(adminId: string, userId: string, amountValue: string) {
  const amount = new Prisma.Decimal(amountValue);
  if (amount.lte(0)) throw new StoreError("O valor deve ser maior que zero", 400);
  return prisma.$transaction(async (tx) => {
    const [admin, user] = await Promise.all([
      tx.user.findUnique({ where: { id: adminId }, select: { city: true, state: true } }),
      tx.user.findUnique({ where: { id: userId }, select: { city: true, state: true, role: true, active: true } }),
    ]);
    if (!admin || !user) throw new StoreError("Usuário não encontrado", 404);
    if (user.role !== Role.USER || !user.active) throw new StoreError("EcoCoin só pode ser creditada a um usuário ativo", 400);
    if (!sameLocation(decryptedLocation(admin), decryptedLocation(user))) throw new StoreError("O administrador só pode creditar usuários da própria cidade", 403);
    const updated = await tx.user.update({ where: { id: userId }, data: { ecoCoinBalance: { increment: amount } }, select: { id: true, ecoCoinBalance: true } });
    await tx.ecoCoinTransaction.create({ data: { userId, grantedById: adminId, type: "CREDIT", amount, description: "Crédito concedido pelo administrador" } });
    return updated;
  });
}

export async function getEcoCoinBalance(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { ecoCoinBalance: true } });
  if (!user) throw new StoreError("Usuário não encontrado", 404);
  return user.ecoCoinBalance;
}

export async function redeemProduct(userId: string, productId: string, quantity: number) {
  return prisma.$transaction(async (tx) => {
    const [user, product] = await Promise.all([
      tx.user.findUnique({ where: { id: userId }, select: { city: true, state: true } }),
      tx.product.findUnique({ where: { id: productId } }),
    ]);
    if (!user || !product || !product.active) throw new StoreError("Produto não encontrado", 404);
    if (!sameLocation(decryptedLocation(user), product)) throw new StoreError("Produto indisponível para a sua cidade", 403);
    const total = product.price.mul(quantity);
    const stock = await tx.product.updateMany({ where: { id: productId, active: true, quantity: { gte: quantity } }, data: { quantity: { decrement: quantity } } });
    if (!stock.count) throw new StoreError("Estoque insuficiente", 409);
    const balance = await tx.user.updateMany({ where: { id: userId, active: true, ecoCoinBalance: { gte: total } }, data: { ecoCoinBalance: { decrement: total } } });
    if (!balance.count) throw new StoreError("Saldo EcoCoin insuficiente", 409);
    const expiresAt = new Date(Date.now() + REDEMPTION_DAYS * 24 * 60 * 60 * 1000);
    const redemption = await tx.redemption.create({ data: { userId, productId, quantity, unitPrice: product.price, totalPrice: total, pickupCode: randomBytes(6).toString("hex").toUpperCase(), expiresAt } });
    await tx.ecoCoinTransaction.create({ data: { userId, redemptionId: redemption.id, type: "REDEMPTION", amount: total.negated(), description: `Troca por ${product.name}` } });
    return tx.redemption.findUnique({
      where: { id: redemption.id },
      select: { ...redemptionPublicSelect, product: { select: productPublicSelect } },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function expirePendingRedemptions() {
  const expired = await prisma.redemption.findMany({ where: { status: RedemptionStatus.PENDING, expiresAt: { lte: new Date() } }, select: { id: true, userId: true, productId: true, quantity: true, totalPrice: true } });
  let count = 0;
  for (const item of expired) {
    const processed = await prisma.$transaction(async (tx) => {
      const claimed = await tx.redemption.updateMany({ where: { id: item.id, status: RedemptionStatus.PENDING, expiresAt: { lte: new Date() } }, data: { status: RedemptionStatus.EXPIRED, pickupCode: null } });
      if (!claimed.count) return false;
      await tx.user.update({ where: { id: item.userId }, data: { ecoCoinBalance: { increment: item.totalPrice } } });
      await tx.product.update({ where: { id: item.productId }, data: { quantity: { increment: item.quantity } } });
      await tx.ecoCoinTransaction.create({ data: { userId: item.userId, redemptionId: item.id, type: "REFUND", amount: item.totalPrice, description: "Estorno por troca expirada" } });
      return true;
    });
    if (processed) count++;
  }
  return count;
}

export async function listUserRedemptions(userId: string) {
  await expirePendingRedemptions();
  return prisma.redemption.findMany({
    where: { userId },
    select: { ...redemptionPublicSelect, product: { select: productPublicSelect } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAdminRedemptions(adminId: string) {
  await expirePendingRedemptions();
  const redemptions = await prisma.redemption.findMany({
    where: { product: { adminId } },
    select: { ...redemptionPublicSelect, product: { select: productPublicSelect }, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return redemptions.map(decryptPickupUser);
}

export async function validatePickupCode(adminId: string, code: string) {
  await expirePendingRedemptions();
  return prisma.$transaction(async (tx) => {
    const redemption = await tx.redemption.findUnique({ where: { pickupCode: code }, include: { product: true } });
    if (!redemption || redemption.status !== RedemptionStatus.PENDING) throw new StoreError("Código inválido ou já utilizado", 404);
    if (redemption.product.adminId !== adminId) throw new StoreError("Código não pertence a esta loja", 403);
    if (redemption.expiresAt <= new Date()) throw new StoreError("Código expirado", 410);
    const result = await tx.redemption.updateMany({ where: { id: redemption.id, status: RedemptionStatus.PENDING, pickupCode: code }, data: { status: RedemptionStatus.COMPLETED, pickupCode: null, completedAt: new Date(), validatedById: adminId } });
    if (!result.count) throw new StoreError("Código inválido ou já utilizado", 409);
    const completed = await tx.redemption.findUnique({
      where: { id: redemption.id },
      select: { ...redemptionPublicSelect, product: { select: productPublicSelect }, user: { select: { name: true } } },
    });
    return completed ? decryptPickupUser(completed) : null;
  });
}
