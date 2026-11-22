"use client";
import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";

export default function Navbar() {
  const { user, logout } = useContext(UserContext);
  const router = useRouter();
  const path = usePathname();
  const [menu, setMenu] = useState(false); // mobile menu
  const [drop, setDrop] = useState(false); // profile dropdown
  const ref = useRef(null);
  const name = user?.username || user?.user?.username || "Account";

  useEffect(() => {
    setMenu(false);
    setDrop(false);
  }, [path]);
  useEffect(() => {
    const close = (e) =>
      ref.current && !ref.current.contains(e.target) && setDrop(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const out = async () => {
    await logout();
    setMenu(false);
    setDrop(false);
    router.push("/");
  };
  const tab = (href) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition ${path === href ? "bg-violet-100 text-[#5b2be0]" : "text-neutral-600 hover:bg-neutral-100"}`;
  const row =
    "block px-4 py-3 rounded-xl text-sm font-semibold hover:bg-violet-50";

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[var(--line)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 h-16 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold tracking-tight lowercase"
        >
          <span
            className="w-9 h-9 rounded-xl grid place-items-center text-white text-lg -rotate-6"
            style={{ background: "linear-gradient(135deg,#5b2be0,#ff5a7a)" }}
          >
            🎟
          </span>
          <span>
            ticket<span className="text-[#5b2be0]">shows</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          <Link href="/" className={tab("/")}>
            Events
          </Link>
          {user && (
            <Link href="/orders" className={tab("/orders")}>
              My orders
            </Link>
          )}
        </nav>

        {/* desktop right side */}
        <div className="ml-auto hidden md:flex items-center gap-2">
          {user ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setDrop((d) => !d)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-[var(--line)] hover:bg-violet-50"
              >
                <span className="w-8 h-8 rounded-full grid place-items-center bg-[#5b2be0] text-white font-bold">
                  {name[0]?.toUpperCase()}
                </span>
                <span className="text-sm font-semibold max-w-[8rem] truncate">
                  {name}
                </span>
                <span className="text-xs">▾</span>
              </button>
              {drop && (
                <div className="absolute right-0 mt-2 w-56 glass p-2 poster-in">
                  <Link href="/orders" className={row}>
                    🎫 My orders
                  </Link>
                  <Link href="/dashboard" className={row}>
                    🎪 List your events
                  </Link>
                  <button
                    onClick={out}
                    className={`${row} w-full text-left text-rose-600`}
                  >
                    ↩ Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-sm h-10 px-5 btn-soft">
                Login
              </Link>
              <Link href="/signup" className="btn btn-sm h-10 px-5 btn-grad">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* mobile burger */}
        <button
          onClick={() => setMenu((m) => !m)}
          aria-label="Menu"
          className="ml-auto md:hidden w-10 h-10 rounded-xl border border-[var(--line)] grid place-items-center text-xl"
        >
          {menu ? "✕" : "☰"}
        </button>
      </div>

      {/* mobile panel */}
      {menu && (
        <div className="md:hidden border-t border-[var(--line)] bg-white px-4 py-3 poster-in">
          {user && (
            <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
              Hi, {name}
            </p>
          )}
          <Link href="/" className={row}>
            🏠 Events
          </Link>
          {user ? (
            <>
              <Link href="/orders" className={row}>
                🎫 My orders
              </Link>
              <Link href="/dashboard" className={row}>
                🎪 List your events
              </Link>
              <button
                onClick={out}
                className={`${row} w-full text-left text-rose-600`}
              >
                ↩ Logout
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/login" className="btn btn-soft h-12">
                Login
              </Link>
              <Link href="/signup" className="btn btn-grad h-12">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
