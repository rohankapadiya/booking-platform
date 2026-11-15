import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app, prisma, resetDb, registerUser } from "./helpers.js";

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe("auth", () => {
  it("registers a user and returns a token without the password hash", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "asha@example.com",
        password: "password123",
        name: "Asha",
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe("asha@example.com");
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects a duplicate email with 409", async () => {
    await registerUser("asha@example.com");
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "asha@example.com",
        password: "password123",
        name: "Asha",
      });

    expect(res.status).toBe(409);
  });

  it("does not let a client register itself as ADMIN", async () => {
    const { user } = await registerUser("sneaky@example.com", "ADMIN");
    expect(user.role).toBe("CUSTOMER");
  });

  it("logs in with the right password and rejects the wrong one", async () => {
    await registerUser("asha@example.com");

    const ok = await request(app)
      .post("/api/auth/login")
      .send({ email: "asha@example.com", password: "password123" });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTruthy();

    const bad = await request(app)
      .post("/api/auth/login")
      .send({ email: "asha@example.com", password: "wrong-password" });
    expect(bad.status).toBe(401);
  });

  it("protects service creation by login and role", async () => {
    const { token: customerToken } = await registerUser("customer@example.com");
    const body = { name: "Haircut", durationMinutes: 30, price: 25 };

    const anonymous = await request(app).post("/api/services").send(body);
    expect(anonymous.status).toBe(401);

    const asCustomer = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${customerToken}`)
      .send(body);
    expect(asCustomer.status).toBe(403);
  });
});
