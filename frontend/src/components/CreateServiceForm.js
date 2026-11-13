"use client";

import { useActionState } from "react";
import { createServiceAction } from "@/lib/provider-actions";

export default function CreateServiceForm() {
    const [state, formAction, pending] = useActionState(createServiceAction, null);

    return (
    <form action={formAction} className="space-y-3 rounded border border-gray-200 p-4">
        <input name="name" required placeholder="Service name"
        className="w-full rounded border border-gray-300 p-2" />
        <textarea name="description" placeholder="Description"
        className="w-full rounded border border-gray-300 p-2" />
        <div className="flex gap-3">
        <input name="durationMinutes" type="number" min="1" step="1" required
            placeholder="Duration (minutes)"
            className="w-full rounded border border-gray-300 p-2" />
        <input name="price" type="number" min="0" step="0.01" required
            placeholder="Price"
            className="w-full rounded border border-gray-300 p-2" />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-green-700">Service created.</p>}

        <button type="submit" disabled={pending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {pending ? "Creating..." : "Create service"}
        </button>
    </form>
    );
}