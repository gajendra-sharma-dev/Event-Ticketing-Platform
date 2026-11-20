"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import { eventApi, seatApi, ticketApi, errMsg } from "@/db/api";

const field =
  "w-full px-3 py-2 rounded-lg bg-stone-100 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500";
const btn = "btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    name: "",
    city: "",
    descrpition: "",
    Status: "ACTIVE",
  });
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
      const res = await eventApi.get("/getAllEvent", {
        params: { limit: 100 },
      });
      // backend lists every event, so keep only the ones I own
      setEvents(res.data.data.event.filter((e) => e.user === user?._id));
    } catch (e) {
      say("error", errMsg(e));
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.push("/login");
    load();
  }, [authLoading, user, router, load]);

  const run = async (fn, okText) => {
    say("", "");
    try {
      await fn();
      say("ok", okText);
      await load();
    } catch (e) {
      say("error", errMsg(e));
    }
  };

  const createEvent = (e) => {
    e.preventDefault();
    run(async () => {
      await eventApi.post("/createEvent", form);
      setForm({ name: "", city: "", descrpition: "", Status: "ACTIVE" });
    }, "Event created.");
  };

  const toggleCancel = (ev) =>
    run(
      () =>
        eventApi.patch(`/updateEvent/${ev._id}`, {
          name: ev.name,
          city: ev.city,
          descrpition: ev.descrpition,
          Status: ev.Status === "CANCELLED" ? "ACTIVE" : "CANCELLED",
        }),
      "Event updated.",
    );

  const deleteEvent = (id) => {
    if (confirm("Delete this event?"))
      run(() => eventApi.delete(`/deleteEvent/${id}`), "Event deleted.");
  };

  const addSeats = (e) => {
    e.preventDefault();
    const { eventId, section, rows, from, to, price } = seatForm;
    if (!eventId) return say("error", "Choose an event first.");
    const seats = [];
    for (let n = Number(from); n <= Number(to); n++) {
      seats.push({ section, rows, number: n, price: Number(price) });
    }
    run(
      () => seatApi.post("/createSeat", { eventId, seats }),
      `${seats.length} seats added.`,
    );
  };

  const checkIn = (e) => {
    e.preventDefault();
    run(async () => {
      await ticketApi.patch("/checkedIn", { code });
      setCode("");
    }, "Ticket checked in.");
  };

  const set = (setter) => (e) =>
    setter((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Organizer dashboard</h1>
      {msg.text && (
        <p
          className={`text-sm ${msg.type === "ok" ? "text-green-700" : "text-red-600"}`}
        >
          {msg.text}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <form
          onSubmit={createEvent}
          className="bg-white border border-stone-200 rounded-xl p-5 space-y-3"
        >
          <h2 className="font-semibold">Create event</h2>
          <input
            className={field}
            name="name"
            placeholder="Event name"
            value={form.name}
            onChange={set(setForm)}
            required
          />
          <input
            className={field}
            name="city"
            placeholder="City"
            value={form.city}
            onChange={set(setForm)}
            required
          />
          <textarea
            className={field}
            name="descrpition"
            placeholder="Description"
            value={form.descrpition}
            onChange={set(setForm)}
            required
          />
          <select
            className={field}
            name="Status"
            value={form.Status}
            onChange={set(setForm)}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <button className={btn}>Create event</button>
        </form>

        <form
          onSubmit={addSeats}
          className="bg-white border border-stone-200 rounded-xl p-5 space-y-3"
        >
          <h2 className="font-semibold">Add seats</h2>
          <select
            className={field}
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
              className={field}
              name="section"
              placeholder="Section (A)"
              value={seatForm.section}
              onChange={set(setSeatForm)}
              required
            />
            <input
              className={field}
              name="rows"
              placeholder="Row (1)"
              value={seatForm.rows}
              onChange={set(setSeatForm)}
              required
            />
            <input
              className={field}
              type="number"
              min="1"
              name="from"
              placeholder="First seat no."
              value={seatForm.from}
              onChange={set(setSeatForm)}
            />
            <input
              className={field}
              type="number"
              min="1"
              name="to"
              placeholder="Last seat no."
              value={seatForm.to}
              onChange={set(setSeatForm)}
            />
          </div>
          <input
            className={field}
            type="number"
            min="0"
            name="price"
            placeholder="Price per seat"
            value={seatForm.price}
            onChange={set(setSeatForm)}
          />
          <button className={btn}>Add seats</button>
        </form>
      </div>

      <form
        onSubmit={checkIn}
        className="bg-white border border-stone-200 rounded-xl p-5 flex gap-3 items-end"
      >
        <div className="flex-1">
          <h2 className="font-semibold mb-2">Check in a ticket</h2>
          <input
            className={field}
            placeholder="Ticket code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <button className={btn}>Check in</button>
      </form>

      <section className="space-y-3">
        <h2 className="font-semibold">Your events</h2>
        {events.length === 0 && (
          <p className="text-stone-500">You have not created any events yet.</p>
        )}
        {events.map((ev) => (
          <div
            key={ev._id}
            className="bg-white border border-stone-200 rounded-xl p-4 flex flex-wrap justify-between items-center gap-3"
          >
            <div>
              <p className="font-semibold">{ev.name}</p>
              <p className="text-sm text-stone-500">
                {ev.city} · {ev.Status}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/events/${ev._id}`} className="btn btn-sm bg-white">
                View
              </Link>
              <button
                onClick={() => toggleCancel(ev)}
                className="btn btn-sm bg-white"
              >
                {ev.Status === "CANCELLED" ? "Reactivate" : "Cancel event"}
              </button>
              <button
                onClick={() => deleteEvent(ev._id)}
                className="btn btn-sm bg-white text-red-600"
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
