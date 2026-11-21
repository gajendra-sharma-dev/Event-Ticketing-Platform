"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import { eventApi, seatApi, orderApi, errMsg } from "@/db/api";

export default function EventPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useContext(UserContext);
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return router.push("/login");
    Promise.all([
      eventApi.get(`/getEventById/${eventId}`),
      seatApi.get(`/getSeatByEvent/${eventId}`),
    ])
      .then(([e, s]) => {
        setEvent(e.data.data);
        setSeats(s.data.data.seats);
      })
      .catch((e) => setError(errMsg(e)));
  }, [eventId, user, authLoading, router]);

  const grouped = useMemo(() => {
    const g = {};
    seats.forEach((s) => {
      g[s.section] ??= {};
      (g[s.section][s.rows] ??= []).push(s);
    });
    return g;
  }, [seats]);

  const total = seats
    .filter((s) => selected.includes(s._id))
    .reduce((a, s) => a + s.price, 0);
  const toggle = (s) =>
    s.Status === "AVAILABLE" &&
    setSelected((p) =>
      p.includes(s._id) ? p.filter((i) => i !== s._id) : [...p, s._id],
    );

  const book = async () => {
    setError("");
    try {
      setBooking(true);
      const r = await orderApi.post("/createOrder", {
        eventId,
        seatId: selected,
      });
      router.push(`/orders/${r.data.data._id}`);
    } catch (e) {
      setError(errMsg(e));
      setBooking(false);
    }
  };

  if (error && !event)
    return <p className="p-10 text-center text-rose-600">{error}</p>;
  if (!event)
    return <p className="p-10 text-center text-slate-500">Loading...</p>;
  const cancelled = event.Status === "CANCELLED";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="glass overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-600" />
        <div className="p-6 -mt-2">
          <h1 className="text-3xl font-black">{event.name}</h1>
          <p className="text-violet-600 font-semibold">📍 {event.city}</p>
          <p className="mt-2 text-slate-600">{event.descrpition}</p>
          {cancelled && (
            <p className="mt-2 text-rose-600 font-bold">
              This event is cancelled.
            </p>
          )}
        </div>
      </header>

      <div className="glass p-6 space-y-6 scene">
        <div className="stage mx-auto w-3/4 max-w-md text-center text-white font-black tracking-[.4em] py-2 rounded-xl">
          STAGE
        </div>

        {seats.length === 0 && (
          <p className="text-center text-slate-500">
            The organizer has not added seats yet.
          </p>
        )}

        <div className="space-y-6 overflow-x-auto pb-2">
          {Object.entries(grouped).map(([section, rows]) => (
            <div key={section} className="w-fit mx-auto">
              <h2 className="font-bold mb-3 text-violet-700">
                Section {section}
              </h2>
              {Object.entries(rows).map(([row, list]) => (
                <div key={row} className="flex items-center gap-2 mb-3">
                  <span className="w-14 shrink-0 text-xs font-semibold text-slate-400">
                    Row {row}
                  </span>
                  {list.map((seat) => (
                    <button
                      key={seat._id}
                      type="button"
                      title={`₹${seat.price}`}
                      disabled={seat.Status !== "AVAILABLE" || cancelled}
                      onClick={() => toggle(seat)}
                      className={`seat ${selected.includes(seat._id) ? "sel" : seat.Status === "HELD" ? "held" : seat.Status === "SOLD" ? "sold" : ""}`}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-5 text-xs font-semibold text-slate-500">
          <span>⬜ Available</span>
          <span>🟥 Selected</span>
          <span>🟨 Held</span>
          <span>⬛ Sold</span>
        </div>
      </div>

      <div className="glass sticky bottom-4 p-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">
          {selected.length} seat{selected.length !== 1 && "s"} ·{" "}
          <span className="grad-text text-2xl font-black">₹{total}</span>
        </p>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          onClick={book}
          disabled={!selected.length || booking || cancelled}
          className="btn btn-grad rounded-xl"
        >
          {booking ? "Holding seats..." : "Hold seats & continue →"}
        </button>
      </div>
    </div>
  );
}
