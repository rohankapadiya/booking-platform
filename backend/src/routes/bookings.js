import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.post("/", requireRole("CUSTOMER"), async (req, res) => {
    const slotId = Number(req.body?.slotId);
    if (!Number.isInteger(slotId)) {
    return res.status(400).json({ error: "slotId is required" });
    }

    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) {
    return res.status(404).json({ error: "slot not found" });
    }
    if (slot.startsAt <= new Date()) {
    return res.status(400).json({ error: "this slot is in the past" });
    }

    try {
    const booking = await prisma.booking.create({
        data: { slotId, customerId: req.user.id },
    });
    res.status(201).json(booking);
    } catch (err) {
    if (err.code === "P2002") {
        return res.status(409).json({ error: "this slot is already booked" });
    }
    throw err;
    }
});

router.get("/mine", async (req, res) => {
    const bookings = await prisma.booking.findMany({
    where: { customerId: req.user.id },
    include: {
        slot: {
        include: { service: { select: { id: true, name: true, price: true } } },
        },
    },
    orderBy: { createdAt: "desc" },
    });
    res.json(bookings);
});

router.patch("/:id/cancel", async (req, res) => {
    const booking = await prisma.booking.findUnique({
    where: { id: Number(req.params.id) },
    });
    if (!booking) {
    return res.status(404).json({ error: "booking not found" });
    }
    if (booking.customerId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "forbidden" });
    }
    if (booking.status === "CANCELLED") {
    return res.status(409).json({ error: "booking is already cancelled" });
    }

    const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
    });
    res.json(updated);
});

export default router;