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


router.get("/:id/slots", async (req, res) => {
    const slots = await prisma.slot.findMany({
    where: {
        serviceId: Number(req.params.id),
        startsAt: { gt: new Date() },
        bookings: { none: { status: "CONFIRMED" } },
    },
    orderBy: { startsAt: "asc" },
    });
    res.json(slots);
});

router.post("/:id/slots", requireAuth, requireRole("PROVIDER", "ADMIN"), async (req, res) => {
    const serviceId = Number(req.params.id);
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
    return res.status(404).json({ error: "service not found" });
    }
    if (req.user.role !== "ADMIN" && service.providerId !== req.user.id) {
    return res.status(403).json({ error: "you can only add slots to your own services" });
    }

    const startsAt = new Date(req.body?.startsAt);
    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) {
    return res.status(400).json({ error: "startsAt must be a valid future date-time" });
    }

    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60 * 1000);
    const slot = await prisma.slot.create({ data: { serviceId, startsAt, endsAt } });
    res.status(201).json(slot);
});
export default router;