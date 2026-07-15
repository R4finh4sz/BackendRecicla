import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CreateTermDto } from "@/dto/terms/create-term.dto";
import { UpdateTermDto } from "@/dto/terms/update-term.dto";

export class TermNotFoundError extends Error {}
export class CurrentTermNotFoundError extends Error {}
export class TermAlreadyAcceptedError extends Error {}

type TermTypeValue = "USER" | "ADMIN";

export interface TermEntity {
  id: string;
  documentId: string;
  title: string | null;
  text: string;
  type: TermTypeValue;
  version: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TermAcceptWithTermEntity {
  id: string;
  userId: string;
  termId: string;
  accepted: boolean;
  acceptedAt: Date;
  term: TermEntity;
}

function normalizeNullableText(value?: string) {
  const normalized = value?.trim().toLowerCase();
  return normalized || null;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function termTypeForRole(role: Role): TermTypeValue {
  return role === Role.USER ? "USER" : "ADMIN";
}

async function getNextVersion(type: TermTypeValue, tx: Prisma.TransactionClient) {
  const latest = await tx.term.findFirst({
    where: { type },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  return (latest?.version ?? 0) + 1;
}

async function createNewVersion(
  data: {
    title?: string;
    text: string;
    type: TermTypeValue;
  },
  tx: Prisma.TransactionClient
): Promise<TermEntity> {
  const version = await getNextVersion(data.type, tx);

  await tx.termAccept.updateMany({
    where: {
      term: {
        type: data.type,
      },
      accepted: true,
    },
    data: { accepted: false },
  });

  await tx.term.updateMany({
    where: {
      type: data.type,
      active: true,
    },
    data: { active: false },
  });

  return tx.term.create({
    data: {
      title: normalizeNullableText(data.title),
      text: normalizeText(data.text),
      type: data.type,
      version,
      active: true,
    },
  });
}

export async function createTerm(input: CreateTermDto): Promise<TermEntity> {
  return prisma.$transaction((tx) => createNewVersion(input, tx));
}

export async function updateTerm(documentId: string, input: UpdateTermDto): Promise<TermEntity> {
  return prisma.$transaction(async (tx) => {
    const existingTerm = await tx.term.findUnique({
      where: { documentId },
      select: { type: true },
    });

    if (!existingTerm) {
      throw new TermNotFoundError("Termo não encontrado");
    }

    return createNewVersion(
      {
        title: input.title,
        text: input.text,
        type: existingTerm.type,
      },
      tx
    );
  });
}

export function listTerms(): Promise<TermEntity[]> {
  return prisma.term.findMany({
    orderBy: [
      { type: "asc" },
      { version: "desc" },
    ],
  });
}

export async function getTermByDocumentId(documentId: string): Promise<TermEntity> {
  const term = await prisma.term.findUnique({
    where: { documentId },
  });

  if (!term) {
    throw new TermNotFoundError("Termo não encontrado");
  }

  return term;
}

export async function getCurrentTermByRole(role: Role): Promise<TermEntity> {
  const type = termTypeForRole(role);
  const term = await prisma.term.findFirst({
    where: {
      type,
      active: true,
    },
    orderBy: { version: "desc" },
  });

  if (!term) {
    throw new CurrentTermNotFoundError("Termo vigente não encontrado");
  }

  return term;
}

export async function getTermStatus(userId: string, role: Role) {
  const currentTerm = await getCurrentTermByRole(role);
  const latestAccepted = await prisma.termAccept.findFirst({
    where: {
      userId,
      term: {
        type: currentTerm.type,
      },
    },
    include: {
      term: {
        select: {
          version: true,
          documentId: true,
        },
      },
    },
    orderBy: {
      acceptedAt: "desc",
    },
  });

  return {
    accepted: latestAccepted?.termId === currentTerm.id && latestAccepted.accepted,
    currentVersion: currentTerm.version,
    acceptedVersion: latestAccepted?.term.version ?? null,
  };
}

export async function acceptCurrentTerm(
  userId: string,
  role: Role
): Promise<TermAcceptWithTermEntity> {
  const currentTerm = await getCurrentTermByRole(role);

  try {
    return await prisma.termAccept.create({
      data: {
        userId,
        termId: currentTerm.id,
        accepted: true,
      },
      include: {
        term: true,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new TermAlreadyAcceptedError("Termo vigente já aceito");
    }

    throw err;
  }
}
