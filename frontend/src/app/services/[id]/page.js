import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import SlotItem from "@/components/SlotItem";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function ServicePage({ params }) {
    const { id } = await params;
    if (!/^\d+$/.test(id)) notFound();

    const [serviceRes, slotsRes, user] = await Promise.all([
    fetch(`${API_URL}/api/services/${id}`, { cache: "no-store" }),
    fetch(`${API_URL}/api/services/${id}/slots`, { cache: "no-store" }),
    getCurrentUser(),
    ]);

    if (serviceRes.status === 404) notFound();
    if (!serviceRes.ok || !slotsRes.ok) throw new Error("Failed to load service");

    const service = await serviceRes.json();
    const slots = await slotsRes.json();

    return (
    <main className="mx-auto max-w-2xl p-6">
        <Link href="/" className="text-sm underline">&larr; All services</Link>

        <h1 className="mt-4 text-3xl font-bold">{service.name}</h1>
        <p className="mt-1 text-gray-600">{service.description}</p>
        <p className="mt-2 text-sm">
        {service.durationMinutes} min · {Number(service.price).toFixed(2)} · by {service.provider.name}
        </p>

        <h2 className="mt-8 text-xl font-semibold">Available times</h2>

        {!user && (
        <p className="mt-2 text-sm">
            <Link href="/login" className="underline">Log in</Link> to book a time.
        </p>
        )}

        {slots.length === 0 ? (
        <p className="mt-4 text-gray-500">No available times right now.</p>
        ) : (
        <ul className="mt-4 space-y-2">
            {slots.map((slot) => (
            <SlotItem key={slot.id} slot={slot} canBook={user?.role === "CUSTOMER"} />
            ))}
        </ul>
        )}
    </main>
    );
}