import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "missing token" });
    }

    try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
    } catch {
    res.status(401).json({ error: "invalid or expired token" });
    }
}

export function requireRole(...roles) {
    return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "forbidden" });
    }
    next();
    };
}