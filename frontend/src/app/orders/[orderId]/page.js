"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import { orderApi, ticketApi, errMsg } from "@/db/api";

export default function OrderPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useContext(UserContext);
  const [order, setOrder] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await orderApi.get(`/getOrder/${orderId}`);
      setOrder(r.data.data);
      if (r.data.data.Status === "PAID") {
        const t = await ticketApi.get(`/getTicketByOrderId/${orderId}`);
        setTickets(t.data.data);
      }
    } catch (e) {
      setError(errMsg(e));
    }
  }, [orderId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.push("/login");
    load();
  }, [authLoading, user, router, load]);

  const act = async (fn) => {
    setError("");
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  const pay = () => act(() => orderApi.patch(`/payOrder/${orderId}`));
  const cancel = () => act(() => orderApi.patch(`/cancelOrder/${orderId}`));
  const issue = () =>
    act(() =>
      ticketApi.post("/createTicket", {
        eventId: order.eventId._id,
        orderId,
        seatId: order.seats.map((s) => s._id),
      }),
    );

  if (error && !order)
    return <p className="p-10 text-center text-rose-600">{error}</p>;
  if (!order)
    return <p className="p-10 text-center text-slate-500">Loading...</p>;
  const pending = order.Status === "PANDDING",
    paid = order.Status === "PAID";

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="glass overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-rose-500 text-white p-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black">{order.eventId?.name}</h1>
            <p className="opacity-90">📍 {order.eventId?.city}</p>
          </div>
          <span className="badge border-0 bg-white/25 text-white font-bold">
            {pending ? "PENDING" : order.Status}
          </span>
        </div>
        <div className="p-6 space-y-3">
          <ul className="divide-y divide-violet-100">
            {order.seats.map((s) => (
              <li key={s._id} className="flex justify-between py-2 text-sm">
                <span>
                  💺 Section {s.section} · Row {s.rows} · Seat {s.number}
                </span>
                <b>₹{s.price}</b>
              </li>
            ))}
          </ul>
          <p className="text-right text-lg">
            Total{" "}
            <span className="grad-text font-black text-3xl">
              ₹{order.totelAmmout}
            </span>
          </p>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {pending && (
            <div className="flex gap-3">
              <button
                onClick={pay}
                disabled={busy}
                className="btn btn-grad flex-1 rounded-xl"
              >
                {busy ? "Working..." : `Pay ₹${order.totelAmmout}`}
              </button>
              <button
                onClick={cancel}
                disabled={busy}
                className="btn btn-soft flex-1 rounded-xl"
              >
                Cancel
              </button>
            </div>
          )}
          {paid && tickets.length === 0 && (
            <button
              onClick={issue}
              disabled={busy}
              className="btn btn-grad w-full rounded-xl"
            >
              {busy ? "Working..." : "🎟 Get my tickets"}
            </button>
          )}
        </div>
      </div>

      {tickets.length > 0 && (
        <div className="space-y-5 scene">
          <h2 className="text-2xl font-black">
            Your <span className="grad-text">tickets</span>
          </h2>
          {tickets.map((t) => (
            <div key={t._id} className="tilt stub flex">
              <div className="flex-1 p-5">
                <p className="text-xs font-bold tracking-widest text-violet-500">
                  ADMIT ONE
                </p>
                <p className="font-black text-lg">{order.eventId?.name}</p>
                <p className="text-sm text-slate-500">
                  Section {t.seatId?.section} · Row {t.seatId?.rows} · Seat{" "}
                  {t.seatId?.number}
                </p>
                {t.checkedInAt && (
                  <span className="badge border-0 bg-emerald-100 text-emerald-700 mt-2">
                    Checked in
                  </span>
                )}
              </div>
              <div className="border-l-2 border-dashed border-violet-200 p-5 grid place-items-center max-w-[11rem]">
                <p className="font-mono font-bold text-rose-500 text-xs break-all text-center">
                  {t.code}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
