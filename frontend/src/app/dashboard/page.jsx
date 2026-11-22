"use client";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import { eventApi, seatApi, ticketApi, orderApi, errMsg } from "@/db/api";
import Poster from "@/components/Poster";

const TABS = [
  ["events", "🎪 Events"],
  ["seats", "💺 Seats"],
  ["sales", "🎫 Sales & refunds"],
  ["checkin", "✅ Check-in"],
];
const empty = { name: "", city: "", descrpition: "", Status: "PENDDING" };
const msgOf = (e) => e?.userMessage || errMsg(e);

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(UserContext);
  const [tab, setTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [seatForm, setSeatForm] = useState({
    eventId: "",
    section: "",
    rows: "",
    from: 1,
    to: 10,
    price: 500,
  });
  const [code, setCode] = useState("");
  const [tEvent, setTEvent] = useState("");
  const [tickets, setTickets] = useState([]);
  const [busy, setBusy] = useState(false);

  const say = (type, text) => setMsg({ type, text });
  const preview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ""),
    [imageFile],
  );

  useEffect(() => {
    if (!msg.text) return;
    const t = setTimeout(() => setMsg({ type: "", text: "" }), 4500);
    return () => clearTimeout(t);
  }, [msg]);

  const load = useCallback(async () => {
    try {
      const r = await eventApi.get("/getAllEvent", { params: { limit: 100 } });
      const uid = String(user?._id || user?.user?._id || "");
      setEvents(r.data.data.event.filter((e) => String(e.user) === uid));
      const rq = await orderApi.get("/refundRequests");
      setReqs(rq.data.data);
    } catch (e) {
      say("error", msgOf(e));
    }
  }, [user]);

  const loadTickets = useCallback(async (id) => {
    if (!id) return setTickets([]);
    try {
      const r = await ticketApi.get(`/getTicketByEvent/${id}`, {
        params: { limit: 50 },
      });
      setTickets(r.data.data.tickets);
    } catch (e) {
      say("error", msgOf(e));
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.push("/login");
    load();
  }, [authLoading, user, router, load]);
  useEffect(() => {
    loadTickets(tEvent);
  }, [tEvent, loadTickets]);

  const run = async (fn, ok) => {
    setBusy(true);
    try {
      await fn();
      say("ok", ok);
      await load();
    } catch (e) {
      say("error", msgOf(e));
    } finally {
      setBusy(false);
    }
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return setImageFile(null);
    if (!f.type.startsWith("image/")) {
      say("error", "Please choose an image file.");
      e.target.value = "";
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      say("error", "Image must be under 5 MB.");
      e.target.value = "";
      return;
    }
    setImageFile(f);
  };

  const createEvent = (e) => {
    e.preventDefault();
    run(async () => {
      if (imageFile) {
        // image chosen: send as FormData (backend needs multer on this route)
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        fd.append("image", imageFile);
        await eventApi.post("/createEvent", fd);
      } else {
        // no image: plain JSON, works with the backend as it is today
        await eventApi.post("/createEvent", form);
      }
      setForm(empty);
      setImageFile(null);
      setFileKey((k) => k + 1);
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

  const seatCount =
    Math.max(0, Number(seatForm.to) - Number(seatForm.from) + 1) || 0;
  const addSeats = (e) => {
    e.preventDefault();
    const { eventId, section, rows, from, to, price } = seatForm;
    if (!eventId) return say("error", "Choose an event first.");
    if (seatCount < 1)
      return say("error", "Last seat must be at least the first seat.");
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
  const approve = (id) =>
    confirm(
      "Approve and refund this order? Tickets are deleted and seats are released.",
    ) && run(() => orderApi.patch(`/refundOrder/${id}`), "Refund done ↩️");
  const reject = (id) =>
    run(() => orderApi.patch(`/rejectRefund/${id}`), "Request rejected.");
  const refund = (id) =>
    confirm("Refund this whole order?") &&
    run(async () => {
      await orderApi.patch(`/refundOrder/${id}`);
      await loadTickets(tEvent);
    }, "Order refunded ↩️");

  const byOrder = tickets.reduce((g, t) => {
    (g[t.orderId] ||= []).push(t);
    return g;
  }, {});
  const set = (setter) => (e) =>
    setter((p) => ({ ...p, [e.target.name]: e.target.value }));
  const stats = [
    ["Your events", events.length, "🎪"],
    ["Refund requests", reqs.length, "📩"],
    ["Cancelled", events.filter((e) => e.Status === "CANCELLED").length, "🚫"],
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-8 space-y-6">
      {msg.text && (
        <div
          className={`fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 poster-in rounded-2xl px-5 py-3 shadow-xl font-semibold text-sm ${msg.type === "ok" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
        >
          {msg.text}
        </div>
      )}

      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Organizer <span className="grad-text">dashboard</span>
        </h1>
        <p className="text-neutral-500 mt-1">
          Create events, add seats, check in guests and handle refunds.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map(([l, v, i]) => (
          <div key={l} className="glass p-4 sm:p-5">
            <p className="text-xl sm:text-2xl">{i}</p>
            <p className="text-2xl sm:text-3xl font-extrabold mt-1">{v}</p>
            <p className="text-xs sm:text-sm text-neutral-500">{l}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold border transition ${tab === k ? "bg-[#14121f] text-white border-[#14121f]" : "bg-white border-[var(--line)] hover:border-violet-300"}`}
          >
            {l}
            {k === "sales" && reqs.length > 0 && (
              <span className="ml-2 pill bg-rose-500 text-white">
                {reqs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <div className="grid lg:grid-cols-5 gap-6 items-start">
          <form
            onSubmit={createEvent}
            className="glass p-5 sm:p-6 space-y-3 lg:col-span-2"
          >
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
              rows={3}
              name="descrpition"
              placeholder="Description"
              value={form.descrpition}
              onChange={set(setForm)}
              required
            />
            <div>
              <label className="text-sm font-semibold">
                Event image (optional)
              </label>
              <input
                key={fileKey}
                type="file"
                accept="image/*"
                onChange={onFile}
                className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#14121f] file:px-4 file:py-2 file:text-white"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-3 h-40 w-full object-cover rounded-xl"
                />
              )}
            </div>
            <button disabled={busy} className="btn btn-grad w-full h-12">
              {busy ? "Saving..." : "Create event"}
            </button>
          </form>

          <section className="lg:col-span-3 space-y-3">
            <h2 className="font-extrabold text-lg">Your events</h2>
            {events.length === 0 && (
              <div className="glass p-8 text-center text-neutral-500">
                You have not created any events yet.
              </div>
            )}
            {events.map((ev) => (
              <div
                key={ev._id}
                className="glass p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <Poster
                    ev={ev}
                    letter="text-2xl"
                    className="w-16 h-16 rounded-xl shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{ev.name}</p>
                    <p className="text-sm text-neutral-500 truncate">
                      📍 {ev.city}
                    </p>
                    <span
                      className={`pill mt-1 ${ev.Status === "CANCELLED" ? "pill-red" : "pill-green"}`}
                    >
                      {ev.Status}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/events/${ev._id}`}
                    className="btn btn-sm btn-soft"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => toggleCancel(ev)}
                    className="btn btn-sm btn-soft"
                  >
                    {ev.Status === "CANCELLED" ? "Reactivate" : "Cancel"}
                  </button>
                  <button
                    onClick={() => del(ev._id)}
                    className="btn btn-sm btn-soft text-rose-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === "seats" && (
        <form
          onSubmit={addSeats}
          className="glass p-5 sm:p-6 space-y-4 max-w-2xl"
        >
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
            placeholder="Price per seat (₹)"
            value={seatForm.price}
            onChange={set(setSeatForm)}
          />
          <p className="text-sm text-neutral-500 bg-violet-50 rounded-xl px-4 py-3">
            This will create <b>{seatCount}</b> seat{seatCount !== 1 && "s"} in
            Section <b>{seatForm.section || "?"}</b>, Row{" "}
            <b>{seatForm.rows || "?"}</b>.
          </p>
          <button disabled={busy} className="btn btn-grad w-full h-12">
            {busy ? "Adding..." : "Add seats"}
          </button>
        </form>
      )}

      {tab === "sales" && (
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <section className="glass p-5 sm:p-6 space-y-4">
            <h2 className="font-extrabold text-lg">📩 Refund requests</h2>
            {reqs.length === 0 && (
              <p className="text-sm text-neutral-500">
                No pending refund requests.
              </p>
            )}
            {reqs.map((o) => (
              <div
                key={o._id}
                className="rounded-2xl border border-[var(--line)] p-4 space-y-3"
              >
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold truncate">
                      {o.eventId?.name} · {o.seats?.length} seat(s)
                    </p>
                    <p className="text-sm text-neutral-500 truncate">
                      {o.customer?.username} ({o.customer?.email})
                    </p>
                  </div>
                  <p className="grad-text font-extrabold text-xl shrink-0">
                    ₹{o.totelAmmout}
                  </p>
                </div>
                <p className="text-sm bg-amber-50 border border-amber-200 rounded-xl p-3">
                  “{o.refundRequest?.reason}”
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(o._id)}
                    disabled={busy}
                    className="btn btn-sm btn-grad flex-1"
                  >
                    Approve & refund
                  </button>
                  <button
                    onClick={() => reject(o._id)}
                    disabled={busy}
                    className="btn btn-sm btn-soft text-rose-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="glass p-5 sm:p-6 space-y-4">
            <h2 className="font-extrabold text-lg">🎫 Sold tickets</h2>
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
              <p className="text-sm text-neutral-500">
                No tickets issued for this event yet.
              </p>
            )}
            {Object.entries(byOrder).map(([orderId, list]) => {
              const used = list.some((t) => t.checkedInAt);
              return (
                <div
                  key={orderId}
                  className="rounded-2xl border border-[var(--line)] p-4 space-y-2"
                >
                  <div className="flex justify-between items-center gap-3">
                    <p className="text-xs text-neutral-400 font-mono truncate">
                      Order {orderId.slice(-8)}
                    </p>
                    <button
                      onClick={() => refund(orderId)}
                      disabled={used || busy}
                      title={used ? "Has checked-in tickets" : ""}
                      className="btn btn-sm btn-soft text-rose-600"
                    >
                      ↩ Refund
                    </button>
                  </div>
                  {list.map((t) => (
                    <div
                      key={t._id}
                      className="flex justify-between text-sm gap-3"
                    >
                      <span>
                        Sec {t.seatId?.section} · Row {t.seatId?.rows} · Seat{" "}
                        {t.seatId?.number}
                      </span>
                      <span className="font-mono text-xs text-neutral-500">
                        {t.code.slice(0, 8)}… {t.checkedInAt ? "✅" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </section>
        </div>
      )}

      {tab === "checkin" && (
        <form
          onSubmit={checkIn}
          className="glass p-5 sm:p-6 space-y-4 max-w-xl"
        >
          <h2 className="font-extrabold text-lg">✅ Check in a ticket</h2>
          <p className="text-sm text-neutral-500">
            Enter the code shown on the guest’s ticket.
          </p>
          <input
            className="field font-mono"
            placeholder="Ticket code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button disabled={busy} className="btn btn-grad w-full h-12">
            {busy ? "Checking..." : "Check in"}
          </button>
        </form>
      )}
    </div>
  );
}
