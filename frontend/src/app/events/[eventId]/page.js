"use client";
import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import { eventApi, seatApi, orderApi, errMsg } from "@/db/api";
import Poster from "@/components/Poster";

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
      .catch((e) => setError(e?.userMessage || errMsg(e)));
  }, [eventId, user, authLoading, router]);

  const grouped = useMemo(() => {
    const g = {};
    seats.forEach((s) => {
      g[s.section] ??= {};
      (g[s.section][s.rows] ??= []).push(s);
    });
    return g;
  }, [seats]);

  const sel = seats.filter((s) => selected.includes(s._id));
  const total = sel.reduce((a, s) => a + s.price, 0);
  const left = seats.filter((s) => s.Status === "AVAILABLE").length;
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
      setError(e?.userMessage || errMsg(e));
      setBooking(false);
    }
  };

  if (error && !event)
    return <p className="p-10 text-center text-rose-600">{error}</p>;
  if (!event)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="skeleton h-64 md:h-80" />
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="skeleton h-96" />
          <div className="skeleton h-72" />
        </div>
      </div>
    );
  const cancelled = event.Status === "CANCELLED";

  const Summary = ({ mobile }) => (
    <button
      onClick={book}
      disabled={!selected.length || booking || cancelled}
      className={`btn btn-grad ${mobile ? "h-12 px-6" : "w-full h-12"}`}
    >
      {booking
        ? "Holding..."
        : mobile
          ? "Continue →"
          : "Hold seats & continue →"}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 py-6 sm:py-8 pb-28 lg:pb-8 space-y-6">
      <Poster ev={event} className="h-56 sm:h-72 md:h-80 rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="absolute bottom-0 p-5 sm:p-8 text-white">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="pill bg-white/90 text-neutral-800">
              📍 {event.city}
            </span>
            <span className={`pill ${cancelled ? "pill-red" : "pill-green"}`}>
              {cancelled ? "Cancelled" : `${left} seats left`}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
            {event.name}
          </h1>
          <p className="mt-2 text-white/80 max-w-2xl line-clamp-2">
            {event.descrpition}
          </p>
        </div>
      </Poster>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <section className="glass p-4 sm:p-6">
          <h2 className="font-extrabold text-xl mb-4">Choose your seats</h2>
          <div className="max-w-md mx-auto mb-8">
            <div className="stage">STAGE</div>
          </div>

          {seats.length === 0 && (
            <p className="text-center text-neutral-500 py-8">
              The organizer has not added seats yet.
            </p>
          )}

          <div className="space-y-8 overflow-x-auto pb-2">
            {Object.entries(grouped).map(([section, rows]) => (
              <div key={section} className="w-fit mx-auto">
                <h3 className="font-bold mb-3 text-[#5b2be0]">
                  Section {section}
                </h3>
                {Object.entries(rows).map(([row, list]) => (
                  <div key={row} className="flex items-center gap-2 mb-3">
                    <span className="w-12 shrink-0 text-xs font-semibold text-neutral-400">
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

          <div className="mt-6 pt-5 border-t border-[var(--line)] flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-neutral-500">
            <span className="flex items-center gap-2">
              <i className="w-4 h-4 rounded border bg-white" />
              Available
            </span>
            <span className="flex items-center gap-2">
              <i className="w-4 h-4 rounded bg-[#5b2be0]" />
              Selected
            </span>
            <span className="flex items-center gap-2">
              <i className="w-4 h-4 rounded bg-amber-200" />
              Held
            </span>
            <span className="flex items-center gap-2">
              <i className="w-4 h-4 rounded bg-neutral-200" />
              Sold
            </span>
          </div>
        </section>

        {/* summary (desktop) */}
        <aside className="glass p-5 sm:p-6 lg:sticky lg:top-24 space-y-4">
          <h2 className="font-extrabold text-xl">Your selection</h2>
          {sel.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Tap a seat to add it here.
            </p>
          ) : (
            <ul className="max-h-56 overflow-y-auto divide-y divide-[var(--line)]">
              {sel.map((s) => (
                <li
                  key={s._id}
                  className="flex justify-between items-center py-2 text-sm"
                >
                  <span>
                    Sec {s.section} · Row {s.rows} · <b>Seat {s.number}</b>
                  </span>
                  <span className="font-semibold">₹{s.price}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between items-end pt-2 border-t border-[var(--line)]">
            <span className="text-sm text-neutral-500">
              {sel.length} seat{sel.length !== 1 && "s"}
            </span>
            <span className="grad-text text-3xl font-extrabold">₹{total}</span>
          </div>
          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="hidden lg:block">
            <Summary />
          </div>
          <p className="text-xs text-neutral-400">
            Seats are held for you when you continue. Pay on the next page.
          </p>
        </aside>
      </div>

      {/* mobile sticky bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-[var(--line)] px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-500">
            {sel.length} seat{sel.length !== 1 && "s"}
          </p>
          <p className="grad-text text-2xl font-extrabold leading-none">
            ₹{total}
          </p>
        </div>
        <Summary mobile />
      </div>
    </div>
  );
}
