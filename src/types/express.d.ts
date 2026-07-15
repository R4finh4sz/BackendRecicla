import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        sessionId: string;
        role: Role;
        level: number;
      };
    }
  }
}

export {};
