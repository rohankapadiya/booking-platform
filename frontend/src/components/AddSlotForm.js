"use client";

import { useState, useActionState } from "react";
import { addSlotAction } from "@/lib/provider-actions";

export default function AddSlotForm({ serviceId }) {
    const [state, formAction, pending] = useActionState(addSlotAction, null);
    const [local, setLocal] = useState("");

    const startsAt = local ? new Date(local).toISOString() : "";

    return (
    <form action={formAction} className="mt-3 flex flex-wrap items-center gap-2">
        <input type="hidden" name="serviceId" value={serviceId} />
        <input type="hidden" name="startsAt" value={startsAt} />
        <input type="datetime-local" required value={local}
        onChange={(e) => setLocal(e.target.value)}
        className="rounded border border-gray-300 p-1 text-sm" />
        <button type="submit" disabled={pending}
        className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50">
        {pending ? "Adding..." : "Add slot"}
        </button>
        {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
        {state?.success && <span className="text-sm text-green-700">Slot added.</span>}
    </form>
    );
}