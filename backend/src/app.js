import { prisma } from "./db.js";

import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/health/db", async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ database: "ok" });
});

export default app;