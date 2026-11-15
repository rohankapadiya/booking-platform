import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import {
  app,
  prisma,
  resetDb,
  registerUser,
  createServiceWithSlot,
} from "./helpers.js";

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

const book = (token, slotId) =>
  request(app)
    .post("/api/bookings")
    .set("Authorization", `Bearer ${token}`)
    .send({ slotId });

describe("bookings", () => {
  it("lets a customer book a slot, which then disappears from available slots", async () => {
    const provider = await registerUser("provider@example.com", "PROVIDER");
    const customer = await registerUser("customer@example.com");
    const { service, slot } = await createServiceWithSlot(provider.token);

    const res = await book(customer.token, slot.id);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("CONFIRMED");

    const slots = await request(app).get(`/api/services/${service.id}/slots`);
    expect(slots.body).toHaveLength(0);
  });

  it("returns 409 when a second customer books the same slot", async () => {
    const provider = await registerUser("provider@example.com", "PROVIDER");
    const first = await registerUser("one@example.com");
    const second = await registerUser("two@example.com");
    const { slot } = await createServiceWithSlot(provider.token);

    expect((await book(first.token, slot.id)).status).toBe(201);
    expect((await book(second.token, slot.id)).status).toBe(409);
  });

  it("lets only one of several simultaneous bookings succeed", async () => {
    const provider = await registerUser("provider@example.com", "PROVIDER");
    const customers = await Promise.all([
      registerUser("a@example.com"),
      registerUser("b@example.com"),
      registerUser("c@example.com"),
    ]);
    const { slot } = await createServiceWithSlot(provider.token);

    const results = await Promise.all(
      customers.map((c) => book(c.token, slot.id)),
    );
    const statuses = results.map((r) => r.status);

    expect(statuses.filter((s) => s === 201)).toHaveLength(1);
    expect(statuses.filter((s) => s === 409)).toHaveLength(2);
  });

  it("frees the slot again after a booking is cancelled", async () => {
    const provider = await registerUser("provider@example.com", "PROVIDER");
    const first = await registerUser("one@example.com");
    const second = await registerUser("two@example.com");
    const { slot } = await createServiceWithSlot(provider.token);

    const booking = await book(first.token, slot.id);
    const cancel = await request(app)
      .patch(`/api/bookings/${booking.body.id}/cancel`)
      .set("Authorization", `Bearer ${first.token}`);
    expect(cancel.status).toBe(200);

    expect((await book(second.token, slot.id)).status).toBe(201);
  });

  it("does not let a customer cancel someone else's booking", async () => {
    const provider = await registerUser("provider@example.com", "PROVIDER");
    const owner = await registerUser("owner@example.com");
    const other = await registerUser("other@example.com");
    const { slot } = await createServiceWithSlot(provider.token);

    const booking = await book(owner.token, slot.id);
    const res = await request(app)
      .patch(`/api/bookings/${booking.body.id}/cancel`)
      .set("Authorization", `Bearer ${other.token}`);
    expect(res.status).toBe(403);
  });

  it("does not let a provider book a slot", async () => {
    const provider = await registerUser("provider@example.com", "PROVIDER");
    const { slot } = await createServiceWithSlot(provider.token);

    expect((await book(provider.token, slot.id)).status).toBe(403);
  });
});
