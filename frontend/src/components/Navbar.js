import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { logoutAction } from "@/lib/auth-actions";

export default async function Navbar() {
    const user = await getCurrentUser();

    return (
    <header className="border-b border-gray-200">
        <nav className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href="/" className="font-bold">BookIt</Link>

        <div className="flex items-center gap-4 text-sm">
            {user ? (
            <>     <Link href="/bookings">My bookings</Link>
                <span>Hi, {user.name}</span>
                <form action={logoutAction}>
                <button type="submit" className="underline">Log out</button>
                </form>
            </>
            ) : (
            <>
                <Link href="/login">Log in</Link>
                <Link href="/register">Register</Link>
            </>
            )}
        </div>
        </nav>
    </header>
    );
}