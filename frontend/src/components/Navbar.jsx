"use client";
import Link from "next/link";
import { useContext, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";

export default function Navbar() {
  const { user, logout } = useContext(UserContext);
  const router = useRouter();
  const path = usePathname();
  const [q, setQ] = useState("");

  const search = (e) => {
    e.preventDefault();
    router.push(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/");
  };
  const out = async () => {
    await logout();
    router.push("/");
  };
  const tab = (href) =>
    `px-1 py-3 font-semibold border-b-2 transition ${path === href ? "border-[#5b2be0] text-[#5b2be0]" : "border-transparent hover:text-[#5b2be0]"}`;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-5 h-[72px] flex items-center gap-5">
        <Link href="/" className="text-3xl font-black tracking-tight lowercase">
          ticket<span className="text-[#5b2be0]">shows</span>
        </Link>

        <form
          onSubmit={search}
          className="flex-1 max-w-2xl ml-auto flex items-center rounded-full border border-neutral-300 bg-white overflow-hidden focus-within:border-[#5b2be0]"
        >
          <span className="px-4 text-sm font-semibold text-[#5b2be0] bg-violet-50 h-11 grid place-items-center border-r border-neutral-200">
            Events
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for events or cities..."
            className="flex-1 h-11 px-4 outline-none bg-transparent"
          />
          <button className="px-4 text-neutral-500" aria-label="Search">
            🔍
          </button>
        </form>

        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-sm font-semibold">
              {user.username || user.user?.username}
            </span>
            <button
              onClick={out}
              className="px-5 h-11 rounded-full border border-neutral-300 font-semibold hover:bg-neutral-50"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-5 h-11 rounded-full border border-neutral-300 font-semibold hover:bg-neutral-50 inline-flex items-center gap-2"
          >
            <span>👤</span> Login
          </Link>
        )}
      </div>

      <nav className="max-w-7xl mx-auto px-5 flex gap-8 text-[15px]">
        <Link href="/" className={tab("/")}>
          Events
        </Link>
        {user && (
          <Link href="/orders" className={tab("/orders")}>
            My orders
          </Link>
        )}
      </nav>
    </header>
  );
}
