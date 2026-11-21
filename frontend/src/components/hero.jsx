"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "@/context/AuthProvider";
import { eventApi, errMsg } from "@/db/api";

const TINTS = [
  ["#fb7185", "#fb923c"],
  ["#7c3aed", "#d946ef"],
  ["#06b6d4", "#2563eb"],
  ["#10b981", "#14b8a6"],
  ["#f59e0b", "#ec4899"],
  ["#6366f1", "#38bdf8"],
];
const bg = (i) =>
  `linear-gradient(135deg, ${TINTS[i % TINTS.length][0]}, ${TINTS[i % TINTS.length][1]})`;

function Poster({ ev, i, className = "" }) {
  return (
    <div
      className={`grid place-items-center text-white font-black ${className}`}
      style={{ background: bg(i) }}
    >
      <span className="text-7xl drop-shadow">
        {ev.name?.[0]?.toUpperCase()}
      </span>
    </div>
  );
}

export default function Hero() {
  const { user, loading: authLoading } = useContext(UserContext);
  const q = (useSearchParams().get("q") || "").toLowerCase();
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [city, setCity] = useState("");
  const [slide, setSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    eventApi
      .get("/getAllEvent", { params: { page, limit: 12 } })
      .then((r) => {
        setEvents(r.data.data.event);
        setPages(r.data.data.pages || 1);
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [page, user, authLoading]);

  const cities = useMemo(
    () => [...new Set(events.map((e) => e.city))],
    [events],
  );
  const shown = events.filter(
    (e) =>
      (!city || e.city === city) &&
      (!q || `${e.name} ${e.city}`.toLowerCase().includes(q)),
  );
  const slides = events.slice(0, 5);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const cur = slides[slide % (slides.length || 1)];
  const go = (d) => setSlide((s) => (s + d + slides.length) % slides.length);

  return (
    <>
      {/* HERO CAROUSEL */}
      <section
        className="relative overflow-hidden"
        style={{
          background: cur
            ? `linear-gradient(90deg, ${TINTS[slide % 6][0]}22, #fff 70%)`
            : "#f5f3ff",
        }}
      >
        <div className="max-w-7xl mx-auto px-16 py-14 grid md:grid-cols-2 gap-10 items-center min-h-[420px]">
          {cur ? (
            <>
              <div key={cur._id} className="poster-in">
                <p className="font-semibold text-neutral-600">📍 {cur.city}</p>
                <h1 className="mt-3 text-5xl md:text-6xl font-black leading-tight">
                  {cur.name}
                </h1>
                <p className="mt-4 text-lg text-neutral-600 line-clamp-2 max-w-md">
                  {cur.descrpition}
                </p>
                <Link
                  href={`/events/${cur._id}`}
                  className="mt-8 inline-flex items-center px-10 h-16 rounded-2xl bg-neutral-900 text-white text-xl font-bold hover:bg-neutral-700 transition"
                >
                  Book tickets
                </Link>
              </div>
              <div
                key={cur._id + "p"}
                className="poster-in hidden md:flex justify-end"
              >
                <Poster
                  ev={cur}
                  i={slide}
                  className="w-80 h-[22rem] rounded-2xl shadow-2xl"
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-2 text-center">
              <h1 className="text-5xl font-black">Find your next plan</h1>
              <p className="mt-3 text-neutral-600">
                {user || authLoading ? (
                  "No events yet."
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="underline font-bold text-[#5b2be0]"
                    >
                      Log in
                    </Link>{" "}
                    to browse events and book seats.
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl px-2"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl px-2"
              aria-label="Next"
            >
              ›
            </button>
            <div className="flex justify-center gap-2 pb-5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === slide ? "w-8 bg-neutral-900" : "w-2 bg-neutral-300"}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* EVENTS GRID */}
      <section className="max-w-7xl mx-auto px-5 py-10">
        <h2 className="text-2xl font-extrabold mb-4">
          {q ? `Results for “${q}”` : "All events"}
        </h2>

        {cities.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {["", ...cities].map((c) => (
              <button
                key={c || "all"}
                onClick={() => setCity(c)}
                className={`px-4 py-1.5 rounded-full border text-sm font-semibold ${city === c ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-300 hover:bg-neutral-50"}`}
              >
                {c || "All cities"}
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-rose-600">{error}</p>}
        {loading && user && (
          <p className="text-neutral-500">Loading events...</p>
        )}
        {user && !loading && shown.length === 0 && (
          <p className="text-neutral-500">No events found.</p>
        )}

        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((ev) => {
            const i = events.indexOf(ev);
            return (
              <Link
                key={ev._id}
                href={`/events/${ev._id}`}
                className="tilt block"
              >
                <Poster ev={ev} i={i} className="aspect-[4/5] rounded-2xl" />
                <h3 className="mt-3 font-bold text-lg leading-snug line-clamp-1">
                  {ev.name}
                </h3>
                <p className="text-sm text-neutral-500">📍 {ev.city}</p>
                {ev.Status === "CANCELLED" && (
                  <span className="text-xs font-bold text-rose-600">
                    CANCELLED
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {pages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              className="btn btn-sm btn-soft"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              «
            </button>
            <span className="font-semibold">
              Page {page} / {pages}
            </span>
            <button
              className="btn btn-sm btn-soft"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              »
            </button>
          </div>
        )}
      </section>
    </>
  );
}
