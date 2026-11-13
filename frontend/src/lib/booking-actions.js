"use server";

import { redirect } from "next/navigation";
import { getToken } from "@/lib/session";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function bookSlotAction(prevState, formData) {
    const token = await getToken();
    if (!token) redirect("/login");

    let res;
    try {
    res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slotId: Number(formData.get("slotId")) }),
    });
    } catch {
    return { error: "Could not reach the server. Please try again." };
    }

    if (res.status === 401) redirect("/login");

    if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data.error || "Booking failed." };
    }

    redirect("/bookings");
}


export async function cancelBookingAction(formData) {
    const token = await getToken();
    if (!token) redirect("/login");

    const res = await fetch(
    `${API_URL}/api/bookings/${Number(formData.get("bookingId"))}/cancel`,
    { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.status === 401) redirect("/login");

    revalidatePath("/bookings");
}