import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";
import { roleLevel } from "@/config/roles";
import { prisma } from "@/lib/prisma";
import { RegisterInput } from "@/types/register.types";
import { RegisterResult } from "@/types/auth.types";

export class UserAlreadyExistsError extends Error {}

const PASSWORD_SALT_ROUNDS = 10;

export async function createUserWithRole(
  { name, email, password }: RegisterInput,
  role: Role
): Promise<RegisterResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new UserAlreadyExistsError("E-mail ja cadastrado");
  }

  const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
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
      throw new UserAlreadyExistsError("E-mail ja cadastrado");
    }

    throw err;
  }
}
