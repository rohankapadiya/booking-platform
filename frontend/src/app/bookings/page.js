import { redirect } from "next/navigation";
import { getToken } from "@/lib/session";
import LocalTime from "@/components/LocalTime";
import { cancelBookingAction } from "@/lib/booking-actions";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function BookingsPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const res = await fetch(`${API_URL}/api/bookings/mine`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) redirect("/login");
  if (!res.ok) throw new Error("Failed to load bookings");

  const bookings = await res.json();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">My bookings</h1>

      {bookings.length === 0 && (
        <p className="mt-6 text-gray-500">You have no bookings yet.</p>
      )}

      <ul className="mt-6 space-y-3">
        {bookings.map((b) => (
          <li key={b.id} className="rounded border border-gray-200 p-4">
            <p className="font-semibold">{b.slot.service.name}</p>
            <p className="text-sm">
              <LocalTime iso={b.slot.startsAt} />
            </p>
            <p
              className={`text-xs ${b.status === "CANCELLED" ? "text-red-600" : "text-green-700"}`}
            >
              {b.status}
            </p>
            {b.status === "CONFIRMED" && (
              <form action={cancelBookingAction} className="mt-2">
                <input type="hidden" name="bookingId" value={b.id} />
                <button
                  type="submit"
                  className="text-sm text-red-600 underline"
                >
                  Cancel booking
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
