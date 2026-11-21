"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import { eventApi, seatApi, orderApi, errMsg } from "@/db/api";

const seatStyle = {
  AVAILABLE: "bg-white border-stone-300 hover:border-red-500",
  HELD: "bg-amber-200 border-amber-300 cursor-not-allowed",
  SOLD: "bg-stone-300 border-stone-300 text-stone-500 cursor-not-allowed",
};

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

  // group seats: section -> row -> seats
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
    .reduce((sum, s) => sum + s.price, 0);

  const toggle = (seat) => {
    if (seat.Status !== "AVAILABLE") return;
    setSelected((prev) =>
      prev.includes(seat._id)
        ? prev.filter((id) => id !== seat._id)
        : [...prev, seat._id],
    );
  };

  const book = async () => {
    setError("");
    try {
      setBooking(true);
      const res = await orderApi.post("/createOrder", {
        eventId,
        seatId: selected,
      });
      router.push(`/orders/${res.data.data._id}`);
    } catch (e) {
      setError(errMsg(e));
      setBooking(false);
    }
  };

  if (error && !event)
    return <p className="p-8 text-center text-red-600">{error}</p>;
  if (!event)
    return <p className="p-8 text-center text-stone-500">Loading...</p>;

  const cancelled = event.Status === "CANCELLED";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <p className="text-stone-500">{event.city}</p>
        <p className="mt-2 text-stone-700">{event.descrpition}</p>
        {cancelled && (
          <p className="mt-2 text-red-600 font-semibold">
            This event is cancelled.
          </p>
        )}
      </header>

      <div className="flex gap-4 text-sm">
        <span>
          <i className="inline-block w-4 h-4 border bg-white align-middle mr-1" />
          Available
        </span>
        <span>
          <i className="inline-block w-4 h-4 bg-red-500 align-middle mr-1" />
          Selected
        </span>
        <span>
          <i className="inline-block w-4 h-4 bg-amber-200 align-middle mr-1" />
          Held
        </span>
        <span>
          <i className="inline-block w-4 h-4 bg-stone-300 align-middle mr-1" />
          Sold
        </span>
      </div>

      {seats.length === 0 && (
        <p className="text-stone-500">The organizer has not added seats yet.</p>
      )}

      <div className="space-y-6 overflow-x-auto">
        {Object.entries(grouped).map(([section, rows]) => (
          <div key={section}>
            <h2 className="font-semibold mb-2">Section {section}</h2>
            {Object.entries(rows).map(([row, list]) => (
              <div key={row} className="flex items-center gap-2 mb-2">
                <span className="w-14 shrink-0 text-sm text-stone-500">
                  Row {row}
                </span>
                {list.map((seat) => (
                  <button
                    key={seat._id}
                    type="button"
                    title={`₹${seat.price}`}
                    disabled={seat.Status !== "AVAILABLE" || cancelled}
                    onClick={() => toggle(seat)}
                    className={`w-9 h-9 shrink-0 rounded border text-xs font-medium transition ${
                      selected.includes(seat._id)
                        ? "bg-red-500 border-red-500 text-white"
                        : seatStyle[seat.Status]
                    }`}
                  >
                    {seat.number}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white border border-stone-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <p>
          {selected.length} seat{selected.length !== 1 && "s"} selected ·{" "}
          <b>₹{total}</b>
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={book}
          disabled={selected.length === 0 || booking || cancelled}
          className="btn bg-red-500 hover:bg-red-600 text-white border-none disabled:opacity-60"
        >
          {booking ? "Holding seats..." : "Hold seats and continue"}
        </button>
      </div>
    </div>
  );
}
