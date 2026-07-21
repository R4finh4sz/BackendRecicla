import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { decryptSensitiveData } from "@/services/Auth/data-protection/data-protection.service";
import { verifyPassword } from "@/services/Auth/password/password.service";

export class AccountError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export async function deleteAccount(userId: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true, products: { select: { id: true }, take: 1 } },
  });

  if (!user) throw new AccountError("Conta não encontrada", 404);
  if (!(await verifyPassword(password, user.password))) {
    throw new AccountError("Senha incorreta", 401);
  }
  if (user.products.length) {
    throw new AccountError("Contas que administram produtos devem transferi-los antes da exclusão", 409);
  }

  await prisma.$transaction(async (tx) => {
    // Remove referências opcionais mantidas em históricos de terceiros.
    await tx.redemption.updateMany({ where: { validatedById: userId }, data: { validatedById: null } });
    await tx.ecoCoinTransaction.updateMany({ where: { grantedById: userId }, data: { grantedById: null } });

    await tx.ecoCoinTransaction.deleteMany({ where: { userId } });
    await tx.redemption.deleteMany({ where: { userId } });
    await tx.termAccept.deleteMany({ where: { userId } });
    await tx.passwordResetChallenge.deleteMany({ where: { userId } });
    await tx.twoFactorChallenge.deleteMany({ where: { userId } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });
}

function addField(doc: PDFKit.PDFDocument, label: string, value: unknown) {
  doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
  doc.font("Helvetica").text(value === null || value === undefined || value === "" ? "Não informado" : String(value));
}

export async function exportAccountPdf(userId: string): Promise<Buffer> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      termAccepts: { include: { term: true }, orderBy: { acceptedAt: "desc" } },
      redemptions: { include: { product: true }, orderBy: { createdAt: "desc" } },
      ecoCoinTransactions: { orderBy: { createdAt: "desc" } },
      products: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) throw new AccountError("Conta não encontrada", 404);

  const personal = {
    name: decryptSensitiveData(user.name),
    cpf: decryptSensitiveData(user.cpf),
    birthDate: decryptSensitiveData(user.birthDate),
    phone: decryptSensitiveData(user.phone),
    cep: decryptSensitiveData(user.cep),
    address: decryptSensitiveData(user.address),
    city: decryptSensitiveData(user.city),
    state: decryptSensitiveData(user.state),
    email: decryptSensitiveData(user.email),
    profilePhoto: user.profilePhoto ? decryptSensitiveData(user.profilePhoto) : null,
  };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4", info: { Title: "Exportação de dados pessoais" } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).font("Helvetica-Bold").text("Exportação de dados pessoais");
    doc.moveDown(0.4).fontSize(9).font("Helvetica").fillColor("#555555")
      .text(`Documento gerado em ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`);
    doc.moveDown().fillColor("#000000").fontSize(14).font("Helvetica-Bold").text("Dados da conta");
    doc.moveDown(0.4).fontSize(10);
    addField(doc, "ID", user.id);
    addField(doc, "Nome", personal.name);
    addField(doc, "CPF", personal.cpf);
    addField(doc, "Data de nascimento", personal.birthDate);
    addField(doc, "Telefone", personal.phone);
    addField(doc, "E-mail", personal.email);
    addField(doc, "CEP", personal.cep);
    addField(doc, "Endereço", personal.address);
    addField(doc, "Cidade/UF", `${personal.city}/${personal.state}`);
    addField(doc, "Foto de perfil", personal.profilePhoto);
    addField(doc, "Perfil", user.role);
    addField(doc, "Conta ativa", user.active ? "Sim" : "Não");
    addField(doc, "Saldo EcoCoin", user.ecoCoinBalance.toFixed(2));
    addField(doc, "Criada em", user.createdAt.toLocaleString("pt-BR"));
    addField(doc, "Atualizada em", user.updatedAt.toLocaleString("pt-BR"));

    doc.moveDown().fontSize(14).font("Helvetica-Bold").text("Aceites de termos");
    doc.fontSize(10).font("Helvetica");
    if (!user.termAccepts.length) doc.text("Nenhum aceite registrado.");
    for (const accept of user.termAccepts) {
      doc.moveDown(0.4).font("Helvetica-Bold").text(accept.term.title || `Termo ${accept.term.type}`);
      doc.font("Helvetica").text(`Versão ${accept.term.version} — aceito em ${accept.acceptedAt.toLocaleString("pt-BR")}`);
    }

    doc.moveDown().fontSize(14).font("Helvetica-Bold").text("Trocas");
    doc.fontSize(10).font("Helvetica");
    if (!user.redemptions.length) doc.text("Nenhuma troca registrada.");
    for (const redemption of user.redemptions) {
      doc.moveDown(0.4).font("Helvetica-Bold").text(redemption.product.name);
      doc.font("Helvetica").text(`Quantidade: ${redemption.quantity} | Total: ${redemption.totalPrice.toFixed(2)} EcoCoins | Status: ${redemption.status} | Data: ${redemption.createdAt.toLocaleString("pt-BR")}`);
    }

    doc.moveDown().fontSize(14).font("Helvetica-Bold").text("Movimentações EcoCoin");
    doc.fontSize(10).font("Helvetica");
    if (!user.ecoCoinTransactions.length) doc.text("Nenhuma movimentação registrada.");
    for (const transaction of user.ecoCoinTransactions) {
      doc.moveDown(0.4).text(`${transaction.createdAt.toLocaleString("pt-BR")} | ${transaction.type} | ${transaction.amount.toFixed(2)} | ${transaction.description || "Sem descrição"}`);
    }

    doc.moveDown().fontSize(14).font("Helvetica-Bold").text("Produtos administrados");
    doc.fontSize(10).font("Helvetica");
    if (!user.products.length) doc.text("Nenhum produto administrado.");
    for (const product of user.products) {
      doc.moveDown(0.4).font("Helvetica-Bold").text(product.name);
      doc.font("Helvetica").text(`Preço: ${product.price.toFixed(2)} EcoCoins | Estoque: ${product.quantity} | Ativo: ${product.active ? "Sim" : "Não"} | Criado em: ${product.createdAt.toLocaleString("pt-BR")}`);
      doc.text(product.description);
    }

    doc.end();
  });
}
