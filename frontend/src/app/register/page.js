"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/auth-actions";

export default function RegisterPage() {
    const [state, formAction, pending] = useActionState(registerAction, null);

    return (
    <main className="mx-auto max-w-sm p-6">
        <h1 className="text-2xl font-bold">Create an account</h1>

        <form action={formAction} className="mt-6 space-y-4">
        <input name="name" required placeholder="Full name"
            className="w-full rounded border border-gray-300 p-2" />
        <input name="email" type="email" required placeholder="Email"
            className="w-full rounded border border-gray-300 p-2" />
        <input name="password" type="password" required minLength={8}
            placeholder="Password (min 8 characters)"
            className="w-full rounded border border-gray-300 p-2" />
        <select name="role" defaultValue="CUSTOMER"
            className="w-full rounded border border-gray-300 p-2">
            <option value="CUSTOMER">I want to book services</option>
            <option value="PROVIDER">I want to offer services</option>
        </select>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button type="submit" disabled={pending}
            className="w-full rounded bg-black p-2 text-white disabled:opacity-50">
            {pending ? "Creating account..." : "Register"}
        </button>
        </form>

        <p className="mt-4 text-sm">
        Already registered? <Link href="/login" className="underline">Log in</Link>
        </p>
    </main>
    );
}