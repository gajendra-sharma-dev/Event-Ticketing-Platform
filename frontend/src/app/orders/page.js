"use client";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import { orderApi, errMsg } from "@/db/api";

const FILTERS = ["", "PANDDING", "PAID", "CANCELLED", "REFUNDED"];
const label = (s) => (s === "PANDDING" ? "PENDING" : s);
const color = {
  PANDDING: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-600",
  REFUNDED: "bg-sky-100 text-sky-700",
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
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [page, status, user, authLoading, router]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5">
      <h1 className="text-4xl font-black">
        My <span className="grad-text">orders</span>
      </h1>
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f || "all"}
            onClick={() => {
              setStatus(f);
              setPage(1);
            }}
            className={`btn btn-sm rounded-full ${status === f ? "btn-grad" : "btn-soft"}`}
          >
            {f ? label(f) : "ALL"}
          </button>
        ))}
      </div>
      {error && <p className="text-rose-600">{error}</p>}
      {loading && <p className="text-slate-500">Loading...</p>}
      {!loading && orders.length === 0 && (
        <div className="glass p-8 text-center text-slate-500">
          No orders yet.{" "}
          <Link href="/" className="text-violet-600 font-bold underline">
            Find an event
          </Link>
        </div>
      )}

      <div className="scene space-y-4">
        {orders.map((o) => (
          <Link
            key={o._id}
            href={`/orders/${o._id}`}
            className="tilt glass flex justify-between items-center p-5"
          >
            <div>
              <p className="font-bold text-lg">{o.eventId?.name || "Event"}</p>
              <p className="text-sm text-slate-500">
                📍 {o.eventId?.city} · {new Date(o.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="grad-text font-black text-2xl">₹{o.totelAmmout}</p>
              <span className={`badge border-0 ${color[o.Status]}`}>
                {label(o.Status)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center gap-3">
          <button
            className="btn btn-sm btn-soft"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            «
          </button>
          <span className="font-semibold">
            Page {page} / {pages}
          </span>
          <button
            className="btn btn-sm btn-soft"
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
          >
            »
          </button>
        </div>
      )}
    </div>
  );
}
