"use client";
import Link from "next/link";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";

export default function Navbar() {
  const { user, logout } = useContext(UserContext);
  const router = useRouter();
  const out = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 px-4 pt-3">
      <nav className="glass max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold text-xl"
        >
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-violet-600 grid place-items-center text-white rotate-6">
            🎟
          </span>
          <span className="grad-text">TicketShows</span>
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold">
          {user ? (
            <>
              <Link href="/orders" className="btn btn-sm btn-soft">
                My orders
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-sm btn-soft hidden sm:inline-flex"
              >
                Dashboard
              </Link>
              <span className="hidden md:inline px-3 text-violet-700">
                Hi, {user.username}
              </span>
              <button onClick={out} className="btn btn-sm btn-grad">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-sm btn-grad">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
