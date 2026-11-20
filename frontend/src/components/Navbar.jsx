"use client";
import Link from "next/link";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";

export default function Navbar() {
  const { user, logout } = useContext(UserContext);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="navbar bg-neutral-500 shadow-sm px-4">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          TicketShows
        </Link>
      </div>
      <div className="flex gap-2 items-center">
        {user ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-sm bg-white text-stone-900 border-none"
            >
              {user.username || "Account"}
            </div>
            <ul
              tabIndex={-1}
              className="menu menu-sm dropdown-content bg-white text-stone-800 rounded-box z-10 mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link href="/orders">My orders</Link>
              </li>
              <li>
                <Link href="/dashboard">Organizer dashboard</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        ) : (
          <Link
            href="/login"
            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
