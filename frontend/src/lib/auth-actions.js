"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function authenticate(path, body) {
    let res;
    try {
    res = await fetch(`${API_URL}/api/auth/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    } catch {
    return { error: "Could not reach the server. Please try again." };
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
    return { error: data.error || "Something went wrong." };
    }

    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    });
}

export async function loginAction(prevState, formData) {
    const result = await authenticate("login", {
    email: formData.get("email"),
    password: formData.get("password"),
    });
    if (result?.error) return result;
    redirect("/");
}

export async function registerAction(prevState, formData) {
    const result = await authenticate("register", {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    });
    if (result?.error) return result;
    redirect("/");
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    redirect("/");
}