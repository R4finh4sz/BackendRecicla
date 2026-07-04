import { Role } from "@prisma/client";

export const ROLE_LEVEL: Record<Role, number> = {
  USER: 1,
  ADMIN: 2,
  MASTER: 3,
};

export function roleLevel(role: Role): number {
  return ROLE_LEVEL[role];
}
