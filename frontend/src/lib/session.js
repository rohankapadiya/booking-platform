import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get("token")?.value;
}

export async function getCurrentUser() {
    const token = await getToken();
    if (!token) return null;

    try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
    return res.ok ? await res.json() : null;
    } catch {
    return null;
    }
}