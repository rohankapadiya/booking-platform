import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import CreateServiceForm from "@/components/CreateServiceForm";
import AddSlotForm from "@/components/AddSlotForm";
import LocalTime from "@/components/LocalTime";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    if (user.role !== "PROVIDER" && user.role !== "ADMIN") redirect("/");

    const res = await fetch(`${API_URL}/api/services`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load services");
    const allServices = await res.json();
    const myServices = allServices.filter((s) => s.provider.id === user.id);

    const slotLists = await Promise.all(
    myServices.map((s) =>
        fetch(`${API_URL}/api/services/${s.id}/slots`, { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : []
        )
    )
    );

    return (
    <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-3xl font-bold">Provider dashboard</h1>

        <h2 className="mt-8 text-xl font-semibold">New service</h2>
        <div className="mt-3"><CreateServiceForm /></div>

        <h2 className="mt-10 text-xl font-semibold">Your services</h2>
        {myServices.length === 0 && (
        <p className="mt-3 text-gray-500">You have not created any services yet.</p>
        )}

        <ul className="mt-4 space-y-4">
        {myServices.map((service, i) => (
            <li key={service.id} className="rounded border border-gray-200 p-4">
            <Link href={`/services/${service.id}`} className="text-lg font-semibold hover:underline">
                {service.name}
            </Link>
            <p className="text-sm text-gray-600">
                {service.durationMinutes} min · {Number(service.price).toFixed(2)}
            </p>

            <p className="mt-3 text-sm font-medium">Open slots ({slotLists[i].length})</p>
            <ul className="mt-1 space-y-1 text-sm">
                {slotLists[i].map((slot) => (
                <li key={slot.id}><LocalTime iso={slot.startsAt} /></li>
                ))}
            </ul>

            <AddSlotForm serviceId={service.id} />
            </li>
        ))}
        </ul>
    </main>
    );
}