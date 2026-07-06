import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";
import { roleLevel } from "@/config/roles";
import { prisma } from "@/lib/prisma";
import { RegisterInput } from "@/types/register.types";
import { RegisterResult } from "@/types/auth.types";

export class UserAlreadyExistsError extends Error {}

const PASSWORD_SALT_ROUNDS = 10;

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export async function createUserWithRole(
  {
    name,
    cpf,
    birthDate,
    phone,
    cep,
    address,
    city,
    state,
    profilePhoto,
    termsAccepted,
    email,
    password,
  }: RegisterInput,
  role: Role
): Promise<RegisterResult> {
  const normalizedEmail = normalizeText(email);
  const normalizedCpf = cpf.replace(/\D/g, "");

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedEmail },
        { cpf: normalizedCpf },
      ],
    },
    select: { email: true, cpf: true },
  });

  if (existingUser) {
    const message =
      existingUser.email === normalizedEmail
        ? "E-mail ja cadastrado"
        : "CPF ja cadastrado";

    throw new UserAlreadyExistsError(message);
  }

  const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        name: normalizeText(name),
        cpf: normalizedCpf,
        birthDate,
        phone: phone.replace(/\D/g, ""),
        cep: cep.replace(/\D/g, ""),
        address: normalizeText(address),
        city: normalizeText(city),
        state: normalizeText(state),
        profilePhoto: profilePhoto ? normalizeText(profilePhoto) : null,
        termsAccepted,
        email: normalizedEmail,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return {
      user: {
        ...user,
        level: roleLevel(user.role),
      },
    };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const fields = Array.isArray(err.meta?.target) ? err.meta.target : [];
      const message = fields.includes("cpf") ? "CPF ja cadastrado" : "E-mail ja cadastrado";

      throw new UserAlreadyExistsError(message);
    }

    throw err;
  }
}
