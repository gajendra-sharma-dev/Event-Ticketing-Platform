"use client";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import { orderApi, errMsg } from "@/db/api";
import Poster from "@/components/Poster";

const FILTERS = ["", "PANDDING", "PAID", "CANCELLED", "REFUNDED"];
const label = (s) => (s === "PANDDING" ? "PENDING" : s);
const pill = {
  PANDDING: "pill-amber",
  PAID: "pill-green",
  CANCELLED: "pill-red",
  REFUNDED: "pill-blue",
};

export default function MyOrders() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.push("/login");
    setLoading(true);
    orderApi
      .get("/getMyOrder", {
        params: { page, limit: 10, status: status || undefined },
      })
      .then((r) => {
        setOrders(r.data.data.orders);
        setPages(r.data.data.pages || 1);
      })
      .catch((e) => setError(e?.userMessage || errMsg(e)))
      .finally(() => setLoading(false));
  }, [page, status, user, authLoading, router]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-8 space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          My <span className="grad-text">orders</span>
        </h1>
        <p className="text-neutral-500 mt-1">
          Track your bookings, tickets and refunds.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f || "all"}
            onClick={() => {
              setStatus(f);
              setPage(1);
            }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition ${status === f ? "bg-[#14121f] text-white border-[#14121f]" : "bg-white border-[var(--line)] hover:border-violet-300"}`}
          >
            {f ? label(f) : "All"}
          </button>
        ))}
      </div>

      {error && <p className="text-rose-600">{error}</p>}
      {loading &&
        [...Array(3)].map((_, i) => <div key={i} className="skeleton h-28" />)}
      {!loading && orders.length === 0 && (
        <div className="glass p-10 text-center">
          <p className="text-5xl mb-3">🎫</p>
          <p className="font-bold text-lg">No orders yet</p>
          <Link href="/" className="btn btn-grad mt-4 px-8">
            Find an event
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((o) => (
          <Link
            key={o._id}
            href={`/orders/${o._id}`}
            className="tilt glass flex items-center gap-4 p-4"
          >
            <Poster
              ev={o.eventId || { name: "E" }}
              letter="text-3xl"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-lg truncate">
                {o.eventId?.name || "Event"}
              </p>
              <p className="text-sm text-neutral-500 truncate">
                📍 {o.eventId?.city} ·{" "}
                {new Date(o.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {o.seats?.length || 0} seat(s)
              </p>
            </div>
            <div className="text-right shrink-0 space-y-1.5">
              <p className="grad-text font-extrabold text-xl">
                ₹{o.totelAmmout}
              </p>
              <span className={`pill ${pill[o.Status]}`}>
                {label(o.Status)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button
            className="btn btn-sm btn-soft"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            « Prev
          </button>
          <span className="text-sm font-semibold">
            Page {page} of {pages}
          </span>
          <button
            className="btn btn-sm btn-soft"
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
          >
            Next »
          </button>
        </div>
      )}
    </div>
  );
}
