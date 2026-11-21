"use client";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import { orderApi, errMsg } from "@/db/api";

const FILTERS = ["", "PANDDING", "PAID", "CANCELLED", "REFUNDED"];
const label = (s) => (s === "PANDDING" ? "PENDING" : s);

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
      .then((res) => {
        setOrders(res.data.data.orders);
        setPages(res.data.data.pages || 1);
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [page, status, user, authLoading, router]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">My orders</h1>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f || "all"}
            onClick={() => {
              setStatus(f);
              setPage(1);
            }}
            className={`btn btn-sm ${status === f ? "bg-red-500 text-white border-none" : "bg-white"}`}
          >
            {f ? label(f) : "ALL"}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="text-stone-500">Loading...</p>}
      {!loading && orders.length === 0 && (
        <p className="text-stone-500">
          No orders here yet.{" "}
          <Link href="/" className="text-red-500 underline">
            Find an event
          </Link>
        </p>
      )}

      {orders.map((o) => (
        <Link
          key={o._id}
          href={`/orders/${o._id}`}
          className="block bg-white border border-stone-200 rounded-xl p-4 hover:shadow-md transition"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">{o.eventId?.name || "Event"}</p>
              <p className="text-sm text-stone-500">
                {o.eventId?.city} · {new Date(o.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">₹{o.totelAmmout}</p>
              <span className="badge badge-outline">{label(o.Status)}</span>
            </div>
          </div>
        </Link>
      ))}

      {pages > 1 && (
        <div className="join">
          <button
            className="join-item btn"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            «
          </button>
          <button className="join-item btn">
            Page {page} of {pages}
          </button>
          <button
            className="join-item btn"
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
