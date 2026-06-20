import Link from "next/link";
import { auth } from "@/auth";
import { Avatar } from "@/components/Avatar";
import { signOutAction } from "@/app/actions/auth";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-gray-900"
        >
          🚗 GlamorousCarRental
        </Link>

        {user ? (
          <nav className="flex items-center gap-3 text-sm sm:gap-5">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Cars
            </Link>
            <Link
              href="/reservations"
              className="text-gray-600 hover:text-gray-900"
            >
              Reservations
            </Link>
            <Link href="/profile" aria-label="Profile">
              <Avatar
                name={user.name ?? "User"}
                email={user.email ?? ""}
                size={32}
              />
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 transition hover:bg-gray-50"
              >
                Sign out
              </button>
            </form>
          </nav>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
