import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import { authConfig } from "@/config/env";
import { AuthTokenPayload } from "@/types/auth.types";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token nao informado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, authConfig.jwtSecret) as AuthTokenPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      level: payload.level,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalido ou expirado" });
  }
}

export function requireLevel(minLevel: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Nao autenticado" });
    }

    if (req.user.level < minLevel) {
      return res.status(403).json({ message: "Acesso negado para o seu perfil" });
    }

    return next();
  };
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Nao autenticado" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acesso negado para o seu perfil" });
    }

    return next();
  };
}
