"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/auth-actions";

export default function LoginPage() {
    const [state, formAction, pending] = useActionState(loginAction, null);

    return (
    <main className="mx-auto max-w-sm p-6">
        <h1 className="text-2xl font-bold">Log in</h1>

        <form action={formAction} className="mt-6 space-y-4">
        <input name="email" type="email" required placeholder="Email"
            className="w-full rounded border border-gray-300 p-2" />
        <input name="password" type="password" required placeholder="Password"
            className="w-full rounded border border-gray-300 p-2" />

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button type="submit" disabled={pending}
            className="w-full rounded bg-black p-2 text-white disabled:opacity-50">
            {pending ? "Logging in..." : "Log in"}
        </button>
        </form>

        <p className="mt-4 text-sm">
        No account? <Link href="/register" className="underline">Register</Link>
        </p>
    </main>
    );
}