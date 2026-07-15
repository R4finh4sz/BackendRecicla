import { Role } from "@prisma/client";
import { RegisterInput } from "@/types/register.types";
import { RegisterResult } from "@/types/auth.types";
import { createUserWithRole } from "@/services/Auth/register/register.service";

export function registerUser(input: RegisterInput): Promise<RegisterResult> {
  return createUserWithRole(input, Role.USER);
}
