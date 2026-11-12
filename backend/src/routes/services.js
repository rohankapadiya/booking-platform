import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
    const services = await prisma.service.findMany({
    include: { provider: { select: { id: true, name: true } } },
    orderBy: { id: "desc" },
    });
    res.json(services);
});

router.get("/:id", async (req, res) => {
    const service = await prisma.service.findUnique({
    where: { id: Number(req.params.id) },
    include: { provider: { select: { id: true, name: true } } },
    });
    if (!service) {
    return res.status(404).json({ error: "service not found" });
    }
    res.json(service);
});

router.post("/", requireAuth, requireRole("PROVIDER", "ADMIN"), async (req, res) => {
    const { name, description } = req.body;
    const durationMinutes = Number(req.body.durationMinutes);
    const price = Number(req.body.price);

    if (!name || !Number.isInteger(durationMinutes) || durationMinutes <= 0 || !(price >= 0)) {
    return res.status(400).json({
        error: "name, a positive integer durationMinutes and a non-negative price are required",
    });
    }

    const service = await prisma.service.create({
    data: { providerId: req.user.id, name, description, durationMinutes, price },
    });
    res.status(201).json(service);
});

export default router;