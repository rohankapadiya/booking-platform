import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/db.js";

if (!process.env.DATABASE_URL?.includes("_test")) {
  throw new Error(
    "Refusing to run: DATABASE_URL must point at a *_test database",
  );
}

export { app, prisma };

export async function resetDb() {
  await prisma.$executeRaw`TRUNCATE TABLE "bookings", "slots", "services", "users" RESTART IDENTITY CASCADE`;
}

export async function registerUser(email, role = "CUSTOMER") {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, password: "password123", name: email.split("@")[0], role });
  return { token: res.body.token, user: res.body.user };
}

export async function createServiceWithSlot(providerToken) {
  const auth = { Authorization: `Bearer ${providerToken}` };

  const serviceRes = await request(app).post("/api/services").set(auth).send({
    name: "Haircut",
    description: "30 min cut",
    durationMinutes: 30,
    price: 25,
  });

  const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const slotRes = await request(app)
    .post(`/api/services/${serviceRes.body.id}/slots`)
    .set(auth)
    .send({ startsAt });

  return { service: serviceRes.body, slot: slotRes.body };
}
