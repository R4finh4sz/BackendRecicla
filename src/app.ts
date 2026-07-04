import express from "express";
import cors from "cors";
import authRoutes from "@/routes/auth.routes";
import { authMiddleware, requireLevel } from "@/middlewares/auth.middleware";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get("/admin/ping", authMiddleware, requireLevel(2), (req, res) => {
  res.json({ message: "Acesso administrativo liberado" });
});

app.get("/master/ping", authMiddleware, requireLevel(3), (req, res) => {
  res.json({ message: "Acesso master liberado" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
