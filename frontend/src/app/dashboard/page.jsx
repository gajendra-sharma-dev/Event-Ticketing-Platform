"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import { eventApi, seatApi, ticketApi, orderApi, errMsg } from "@/db/api";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const empty = { name: "", city: "", descrpition: "", Status: "PENDDING" };
  const [form, setForm] = useState(empty);
  const [seatForm, setSeatForm] = useState({
    eventId: "",
    section: "",
    rows: "",
    from: 1,
    to: 10,
    price: 500,
  });
  const [code, setCode] = useState("");

  const say = (type, text) => setMsg({ type, text });

  const load = useCallback(async () => {
    try {
      const r = await eventApi.get("/getAllEvent", { params: { limit: 100 } });
      const uid = String(user?._id || user?.user?._id || "");
      setEvents(r.data.data.event.filter((e) => String(e.user) === uid));
      const rq = await orderApi.get("/refundRequests");
      setReqs(rq.data.data);
    } catch (e) {
      say("error", errMsg(e));
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.push("/login");
    load();
  }, [authLoading, user, router, load]);

  const run = async (fn, ok) => {
    say("", "");
    try {
      await fn();
      say("ok", ok);
      await load();
    } catch (e) {
      say("error", errMsg(e));
    }
  };

  const approve = (id) =>
    confirm(
      "Approve and refund this order? Tickets are deleted and seats are released.",
    ) && run(() => orderApi.patch(`/refundOrder/${id}`), "Refund done ↩️");
  const reject = (id) =>
    run(() => orderApi.patch(`/rejectRefund/${id}`), "Request rejected.");
  const [tEvent, setTEvent] = useState("");
  const [tickets, setTickets] = useState([]);
  const loadTickets = useCallback(async (id) => {
    if (!id) return setTickets([]);
    try {
      const r = await ticketApi.get(`/getTicketByEvent/${id}`, {
        params: { limit: 50 },
      });
      setTickets(r.data.data.tickets);
    } catch (e) {
      say("error", errMsg(e));
    }
  }, []);
  useEffect(() => {
    loadTickets(tEvent);
  }, [tEvent, loadTickets]);
  const refund = (orderId) =>
    confirm(
      "Refund this whole order? Tickets are deleted and seats are released.",
    ) &&
    run(async () => {
      await orderApi.patch(`/refundOrder/${orderId}`);
      await loadTickets(tEvent);
    }, "Order refunded ↩️");
  const byOrder = tickets.reduce((g, t) => {
    (g[t.orderId] ||= []).push(t);
    return g;
  }, {});

  const createEvent = (e) => {
    e.preventDefault();
    run(async () => {
      await eventApi.post("/createEvent", form);
      setForm(empty);
    }, "Event created 🎉");
  };
  const toggleCancel = (ev) =>
    run(
      () =>
        eventApi.patch(`/updateEvent/${ev._id}`, {
          name: ev.name,
          city: ev.city,
          descrpition: ev.descrpition,
          Status: ev.Status === "CANCELLED" ? "PENDDING" : "CANCELLED",
        }),
      "Event updated.",
    );
  const del = (id) =>
    confirm("Delete this event?") &&
    run(() => eventApi.delete(`/deleteEvent/${id}`), "Event deleted.");
  const addSeats = (e) => {
    e.preventDefault();
    const { eventId, section, rows, from, to, price } = seatForm;
    if (!eventId) return say("error", "Choose an event first.");
    const seats = [];
    for (let n = Number(from); n <= Number(to); n++)
      seats.push({ section, rows, number: n, price: Number(price) });
    run(
      () => seatApi.post("/createSeat", { eventId, seats }),
      `${seats.length} seats added 💺`,
    );
  };
  const checkIn = (e) => {
    e.preventDefault();
    run(async () => {
      await ticketApi.patch("/checkedIn", { code });
      setCode("");
    }, "Ticket checked in ✅");
  };
  const set = (setter) => (e) =>
    setter((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-black">
        Organizer <span className="grad-text">dashboard</span>
      </h1>
      {msg.text && (
        <p
          className={`glass px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "text-emerald-600" : "text-rose-600"}`}
        >
          {msg.text}
        </p>
      )}

      <div className="scene grid md:grid-cols-2 gap-6">
        <form onSubmit={createEvent} className="tilt glass p-6 space-y-3">
          <h2 className="font-extrabold text-lg">✨ Create event</h2>
          <input
            className="field"
            name="name"
            placeholder="Event name"
            value={form.name}
            onChange={set(setForm)}
            required
          />
          <input
            className="field"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={set(setForm)}
            required
          />
          <textarea
            className="field"
            name="descrpition"
            placeholder="Description"
            value={form.descrpition}
            onChange={set(setForm)}
            required
          />
          <button className="btn btn-grad rounded-xl w-full">
            Create event
          </button>
        </form>

        <form onSubmit={addSeats} className="tilt glass p-6 space-y-3">
          <h2 className="font-extrabold text-lg">💺 Add seats</h2>
          <select
            className="field"
            name="eventId"
            value={seatForm.eventId}
            onChange={set(setSeatForm)}
            required
          >
            <option value="">Select event</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="field"
              name="section"
              placeholder="Section (A)"
              value={seatForm.section}
              onChange={set(setSeatForm)}
              required
            />
            <input
              className="field"
              name="rows"
              placeholder="Row (1)"
              value={seatForm.rows}
              onChange={set(setSeatForm)}
              required
            />
            <input
              className="field"
              type="number"
              min="1"
              name="from"
              placeholder="First seat"
              value={seatForm.from}
              onChange={set(setSeatForm)}
            />
            <input
              className="field"
              type="number"
              min="1"
              name="to"
              placeholder="Last seat"
              value={seatForm.to}
              onChange={set(setSeatForm)}
            />
          </div>
          <input
            className="field"
            type="number"
            min="0"
            name="price"
            placeholder="Price per seat"
            value={seatForm.price}
            onChange={set(setSeatForm)}
          />
          <button className="btn btn-grad rounded-xl w-full">Add seats</button>
        </form>
      </div>

      <form onSubmit={checkIn} className="glass p-6 flex gap-3 items-end">
        <div className="flex-1">
          <h2 className="font-extrabold text-lg mb-2">✅ Check in a ticket</h2>
          <input
            className="field"
            placeholder="Ticket code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-grad rounded-xl">Check in</button>
      </form>

      <section className="glass p-6 space-y-4">
        <h2 className="font-extrabold text-lg">
          📩 Refund requests{" "}
          {reqs.length > 0 && (
            <span className="badge border-0 bg-rose-500 text-white">
              {reqs.length}
            </span>
          )}
        </h2>
        {reqs.length === 0 && (
          <p className="text-slate-500 text-sm">No pending refund requests.</p>
        )}
        {reqs.map((o) => (
          <div
            key={o._id}
            className="bg-white/80 border border-violet-100 rounded-xl p-4 space-y-2"
          >
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-bold">
                  {o.eventId?.name} · {o.seats?.length} seat(s)
                </p>
                <p className="text-sm text-slate-500">
                  {o.customer?.username} ({o.customer?.email})
                </p>
              </div>
              <p className="grad-text font-black text-xl">₹{o.totelAmmout}</p>
            </div>
            <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
              “{o.refundRequest?.reason}”
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => approve(o._id)}
                className="btn btn-sm btn-grad rounded-lg"
              >
                Approve &amp; refund
              </button>
              <button
                onClick={() => reject(o._id)}
                className="btn btn-sm btn-soft rounded-lg text-rose-600"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="glass p-6 space-y-4">
        <h2 className="font-extrabold text-lg">
          🎫 Sold tickets &amp; refunds
        </h2>
        <select
          className="field"
          value={tEvent}
          onChange={(e) => setTEvent(e.target.value)}
        >
          <option value="">Select event</option>
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.name}
            </option>
          ))}
        </select>
        {tEvent && tickets.length === 0 && (
          <p className="text-slate-500 text-sm">
            No tickets issued for this event yet.
          </p>
        )}
        {Object.entries(byOrder).map(([orderId, list]) => {
          const used = list.some((t) => t.checkedInAt);
          return (
            <div
              key={orderId}
              className="bg-white/80 border border-violet-100 rounded-xl p-4 space-y-2"
            >
              <div className="flex justify-between items-center gap-3">
                <p className="text-xs text-slate-500 font-mono break-all">
                  Order {orderId}
                </p>
                <button
                  onClick={() => refund(orderId)}
                  disabled={used}
                  title={used ? "Has checked-in tickets" : ""}
                  className="btn btn-sm btn-soft rounded-lg text-rose-600"
                >
                  ↩ Refund order
                </button>
              </div>
              {list.map((t) => (
                <div key={t._id} className="flex justify-between text-sm">
                  <span>
                    Section {t.seatId?.section} · Row {t.seatId?.rows} · Seat{" "}
                    {t.seatId?.number}
                  </span>
                  <span className="font-mono text-xs">
                    {t.code.slice(0, 8)}… {t.checkedInAt ? "✅ in" : ""}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="font-extrabold text-lg">Your events</h2>
        {events.length === 0 && (
          <div className="glass p-6 text-slate-500">
            You have not created any events yet.
          </div>
        )}
        {events.map((ev) => (
          <div
            key={ev._id}
            className="glass p-4 flex flex-wrap justify-between items-center gap-3"
          >
            <div>
              <p className="font-bold">{ev.name}</p>
              <p className="text-sm text-slate-500">
                📍 {ev.city} · {ev.Status}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/events/${ev._id}`}
                className="btn btn-sm btn-soft rounded-lg"
              >
                View
              </Link>
              <button
                onClick={() => toggleCancel(ev)}
                className="btn btn-sm btn-soft rounded-lg"
              >
                {ev.Status === "CANCELLED" ? "Reactivate" : "Cancel"}
              </button>
              <button
                onClick={() => del(ev._id)}
                className="btn btn-sm btn-soft rounded-lg text-rose-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
