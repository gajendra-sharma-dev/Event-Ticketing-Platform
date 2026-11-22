"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import { orderApi, ticketApi, errMsg } from "@/db/api";

const STEPS = ["Seats held", "Payment", "Tickets"];

export default function OrderPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useContext(UserContext);
  const [order, setOrder] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await orderApi.get(`/getOrder/${orderId}`);
      setOrder(r.data.data);
      if (r.data.data.Status === "PAID") {
        const t = await ticketApi.get(`/getTicketByOrderId/${orderId}`);
        setTickets(t.data.data);
      }
    } catch (e) {
      setError(e?.userMessage || errMsg(e));
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
      setError(e?.userMessage || errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  const pay = () => act(() => orderApi.patch(`/payOrder/${orderId}`));
  const cancel = () => act(() => orderApi.patch(`/cancelOrder/${orderId}`));
  const requestRefund = () =>
    act(async () => {
      await orderApi.patch(`/requestRefund/${orderId}`, { reason });
      setReason("");
    });
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
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="skeleton h-16" />
        <div className="skeleton h-80" />
      </div>
    );

  const pending = order.Status === "PANDDING";
  const paid = order.Status === "PAID";
  const done = pending ? 1 : paid ? (tickets.length ? 3 : 2) : 0;
  const used = tickets.some((t) => t.checkedInAt);
  const rr = order.refundRequest?.status;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 py-8 space-y-6">
      {(pending || paid) && (
        <ol className="flex items-center">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center flex-1 last:flex-none">
              <span
                className={`w-9 h-9 shrink-0 rounded-full grid place-items-center text-sm font-bold ${i < done ? "bg-[#5b2be0] text-white" : i === done ? "bg-violet-100 text-[#5b2be0] ring-2 ring-[#5b2be0]" : "bg-neutral-100 text-neutral-400"}`}
              >
                {i < done ? "✓" : i + 1}
              </span>
              <span
                className={`ml-2 text-xs sm:text-sm font-semibold ${i <= done ? "text-neutral-800" : "text-neutral-400"}`}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className={`flex-1 h-0.5 mx-2 sm:mx-3 ${i < done ? "bg-[#5b2be0]" : "bg-neutral-200"}`}
                />
              )}
            </li>
          ))}
        </ol>
      )}

      {!pending && !paid && (
        <div
          className={`rounded-2xl px-5 py-4 font-semibold ${order.Status === "REFUNDED" ? "bg-sky-50 text-sky-700" : "bg-rose-50 text-rose-700"}`}
        >
          {order.Status === "REFUNDED"
            ? "↩ This order was refunded. Your seats were released."
            : "✕ This order was cancelled."}
        </div>
      )}

      <div className="glass overflow-hidden">
        <div
          className="p-5 sm:p-6 text-white flex justify-between items-start gap-3"
          style={{
            background: "linear-gradient(135deg,#5b2be0,#c026d3 70%,#ff5a7a)",
          }}
        >
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              {order.eventId?.name}
            </h1>
            <p className="opacity-90 mt-1">📍 {order.eventId?.city}</p>
          </div>
          <span className="pill bg-white/25 text-white shrink-0">
            {pending ? "PENDING" : order.Status}
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <ul className="divide-y divide-[var(--line)]">
            {order.seats.map((s) => (
              <li key={s._id} className="flex justify-between py-2.5 text-sm">
                <span>
                  💺 Section {s.section} · Row {s.rows} · Seat {s.number}
                </span>
                <b>₹{s.price}</b>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-end border-t border-[var(--line)] pt-4">
            <span className="text-neutral-500">Total</span>
            <span className="grad-text text-3xl sm:text-4xl font-extrabold">
              ₹{order.totelAmmout}
            </span>
          </div>
          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {pending && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={pay}
                disabled={busy}
                className="btn btn-grad h-12 col-span-2 sm:col-span-1"
              >
                {busy ? "Working..." : `Pay ₹${order.totelAmmout}`}
              </button>
              <button
                onClick={cancel}
                disabled={busy}
                className="btn btn-soft h-12 col-span-2 sm:col-span-1"
              >
                Cancel order
              </button>
            </div>
          )}
          {paid && tickets.length === 0 && (
            <button
              onClick={issue}
              disabled={busy}
              className="btn btn-grad w-full h-12"
            >
              {busy ? "Working..." : "🎟 Get my tickets"}
            </button>
          )}

          {paid &&
            !used &&
            (rr === "REQUESTED" ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm">
                <p className="font-bold text-amber-700">
                  ⏳ Refund requested, waiting for the organizer
                </p>
                <p className="text-neutral-600 mt-1">
                  Your reason: {order.refundRequest.reason}
                </p>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                <p className="text-sm font-bold">Need a refund?</p>
                {rr === "REJECTED" && (
                  <p className="text-sm text-rose-600 font-semibold">
                    Your last request was rejected. You can ask again.
                  </p>
                )}
                <textarea
                  className="field"
                  rows={2}
                  placeholder="Why do you want a refund?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <button
                  onClick={requestRefund}
                  disabled={busy || !reason.trim()}
                  className="btn btn-soft w-full h-11 text-rose-600"
                >
                  ↩ Request refund
                </button>
              </div>
            ))}
        </div>
      </div>

      {tickets.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold">
            Your <span className="grad-text">tickets</span>
          </h2>
          {tickets.map((t) => (
            <div key={t._id} className="stub flex flex-col sm:flex-row">
              <div className="flex-1 p-5">
                <p className="text-[10px] font-extrabold tracking-[.25em] text-[#5b2be0]">
                  ADMIT ONE
                </p>
                <p className="font-extrabold text-xl mt-1">
                  {order.eventId?.name}
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  Section {t.seatId?.section} · Row {t.seatId?.rows} · Seat{" "}
                  {t.seatId?.number}
                </p>
                {t.checkedInAt && (
                  <span className="pill pill-green mt-3">✓ Checked in</span>
                )}
              </div>
              <div className="border-t-2 sm:border-t-0 sm:border-l-2 border-dashed border-[var(--line)] p-5 grid place-items-center sm:w-52">
                <p className="text-[10px] font-bold text-neutral-400 mb-1">
                  TICKET CODE
                </p>
                <p className="font-mono font-bold text-[#5b2be0] text-sm break-all text-center">
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
