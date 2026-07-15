import { Prisma, Role } from "@prisma/client";
import { roleLevel } from "@/config/roles";
import { prisma } from "@/lib/prisma";
import { RegisterInput } from "@/types/register.types";
import { RegisterResult } from "@/types/auth.types";
import { hashPassword } from "../password/password.service";
import { createSearchHash, encryptSensitiveData } from "../data-protection/data-protection.service";

export class UserAlreadyExistsError extends Error {}

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
  const emailHash = createSearchHash(normalizedEmail);
  const cpfHash = createSearchHash(normalizedCpf);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { emailHash },
        { cpfHash },
      ],
    },
    select: { emailHash: true, cpfHash: true },
  });

  if (existingUser) {
    const message =
      existingUser.emailHash === emailHash
        ? "E-mail já cadastrado"
        : "CPF já cadastrado";

    throw new UserAlreadyExistsError(message);
  }

  const hashedPassword = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        name: encryptSensitiveData(normalizeText(name)),
        cpf: encryptSensitiveData(normalizedCpf),
        cpfHash,
        birthDate: encryptSensitiveData(birthDate.toISOString()),
        phone: encryptSensitiveData(phone.replace(/\D/g, "")),
        cep: encryptSensitiveData(cep.replace(/\D/g, "")),
        address: encryptSensitiveData(normalizeText(address)),
        city: encryptSensitiveData(normalizeText(city)),
        state: encryptSensitiveData(normalizeText(state)),
        profilePhoto: profilePhoto ? encryptSensitiveData(normalizeText(profilePhoto)) : null,
        termsAccepted,
        email: encryptSensitiveData(normalizedEmail),
        emailHash,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    return {
      user: {
        ...user,
        name: normalizeText(name),
        email: normalizedEmail,
        level: roleLevel(user.role),
      },
    };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const fields = Array.isArray(err.meta?.target) ? err.meta.target : [];
      const message = fields.includes("cpfHash") ? "CPF já cadastrado" : "E-mail já cadastrado";

      throw new UserAlreadyExistsError(message);
    }

    throw err;
  }
}
