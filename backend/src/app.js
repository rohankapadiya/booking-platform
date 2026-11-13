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

app.use((req, res) => {
    res.status(404).json({ error: "route not found" });
});

app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "invalid JSON body" });
    }
    console.error(err);
    res.status(500).json({ error: "internal server error" });
});

export default app;