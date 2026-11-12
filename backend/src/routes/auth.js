import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

const router = Router();

function signToken(user) {
    return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
    );
}

function publicUser(user) {
    return { id: user.id, email: user.email, name: user.name, role: user.role };
}

router.post("/register", async (req, res) => {
    const { password, name, role } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password || !name) {
    return res.status(400).json({ error: "email, password and name are required" });
    }
    if (password.length < 8) {
    return res.status(400).json({ error: "password must be at least 8 characters" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
    return res.status(409).json({ error: "email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
    data: {
        email,
        passwordHash,
        name,
        role: role === "PROVIDER" ? "PROVIDER" : "CUSTOMER",
    },
    });

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const valid = user && (await bcrypt.compare(password, user.passwordHash));
    if (!valid) {
    return res.status(401).json({ error: "invalid email or password" });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
});

export default router;