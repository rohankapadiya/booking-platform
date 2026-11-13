import { prisma } from "./db.js";
import authRoutes from "./routes/auth.js";
import express from "express";
import cors from "cors";
import serviceRoutes from "./routes/services.js";
import bookingRoutes from "./routes/bookings.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/health/db", async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ database: "ok" });
});

export default app;