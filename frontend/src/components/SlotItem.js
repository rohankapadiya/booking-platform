"use client";

import { useActionState } from "react";
import { bookSlotAction } from "@/lib/booking-actions";
import LocalTime from "@/components/LocalTime";

export default function SlotItem({ slot, canBook }) {
    const [state, formAction, pending] = useActionState(bookSlotAction, null);

    return (
    <li className="flex items-center justify-between rounded border border-gray-200 p-3">
        <div>
        <LocalTime iso={slot.startsAt} />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        </div>

        {canBook && (
        <form action={formAction}>
            <input type="hidden" name="slotId" value={slot.id} />
            <button type="submit" disabled={pending}
            className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50">
            {pending ? "Booking..." : "Book"}
            </button>
        </form>
        )}
    </li>
    );
}