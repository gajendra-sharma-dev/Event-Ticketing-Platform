"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import { eventApi, seatApi, ticketApi, errMsg } from "@/db/api";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(UserContext);
  const [events, setEvents] = useState([]);
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
          <select
            className="field"
            name="Status"
            value={form.Status}
            onChange={set(setForm)}
          >
            <option value="PENDDING">PENDDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
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
