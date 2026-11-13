"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function postToApi(path, body) {
    const token = await getToken();
    if (!token) redirect("/login");

    let res;
    try {
    res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    } catch {
    return { error: "Could not reach the server. Please try again." };
    }

    if (res.status === 401) redirect("/login");

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || "Something went wrong." };
    return { success: true };
}

export async function createServiceAction(prevState, formData) {
    const result = await postToApi("/api/services", {
    name: formData.get("name"),
    description: formData.get("description"),
    durationMinutes: Number(formData.get("durationMinutes")),
    price: Number(formData.get("price")),
    });
    if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/");
    }
    return result;
}

export async function addSlotAction(prevState, formData) {
    const serviceId = Number(formData.get("serviceId"));
    const result = await postToApi(`/api/services/${serviceId}/slots`, {
    startsAt: formData.get("startsAt"),
    });
    if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath(`/services/${serviceId}`);
    }
    return result;
}