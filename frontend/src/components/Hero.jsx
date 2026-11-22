"use client";
import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "@/context/AuthProvider";
import { eventApi, errMsg } from "@/db/api";
import Poster from "@/components/Poster";

const PERKS = [
  ["💺", "Pick your exact seat"],
  ["⚡", "Tickets in seconds"],
  ["↩", "Easy refund requests"],
];

export default function Hero() {
  const { user, loading: authLoading } = useContext(UserContext);
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
      .catch((e) => setError(e?.userMessage || errMsg(e)))
      .finally(() => setLoading(false));
  }, [page, user, authLoading]);

  const cities = useMemo(
    () => [...new Set(events.map((e) => e.city))],
    [events],
  );
  const shown = events.filter((e) => !city || e.city === city);
  const slides = events.slice(0, 5);
  const cur = slides.length ? slides[slide % slides.length] : null;
  const go = (d) => setSlide((s) => (s + d + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(55% 60% at 12% 15%, #ede9fe 0%, transparent 70%), radial-gradient(45% 50% at 92% 8%, #ffe4e6 0%, transparent 70%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-5 py-14 md:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="pill pill-violet">✨ Live shows near you</span>
            <h1 className="mt-5 text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.02]">
              Live moments,
              <br />
              <span className="grad-text">booked in seconds.</span>
            </h1>
            <p className="mt-5 text-lg text-neutral-600 max-w-md">
              Concerts, comedy, sports and more. Pick your exact seat on a live
              seat map and get your ticket instantly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#events" className="btn btn-grad h-14 px-8 text-base">
                Explore events
              </a>
              {!user && !authLoading && (
                <Link
                  href="/signup"
                  className="btn btn-soft h-14 px-8 text-base"
                >
                  Create account
                </Link>
              )}
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
              {PERKS.map(([i, t]) => (
                <span
                  key={t}
                  className="flex items-center gap-2 text-sm font-semibold text-neutral-600"
                >
                  <span className="w-8 h-8 rounded-lg bg-white border border-[var(--line)] grid place-items-center">
                    {i}
                  </span>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* featured event */}
          <div className="relative">
            {cur ? (
              <div key={cur._id} className="poster-in">
                <Poster
                  ev={cur}
                  i={slide}
                  className="h-80 sm:h-[26rem] rounded-[2rem] shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 p-7 text-white w-full">
                    <span className="pill bg-white/90 text-neutral-800">
                      📍 {cur.city}
                    </span>
                    <h2 className="mt-3 text-3xl md:text-4xl font-extrabold leading-tight">
                      {cur.name}
                    </h2>
                    <p className="mt-2 text-white/80 line-clamp-2 max-w-md">
                      {cur.descrpition}
                    </p>
                    <Link
                      href={`/events/${cur._id}`}
                      className="mt-5 inline-flex items-center h-12 px-7 rounded-2xl bg-white text-neutral-900 font-bold hover:bg-violet-100 transition"
                    >
                      Book tickets →
                    </Link>
                  </div>
                </Poster>
              </div>
            ) : (
              <div className="h-80 sm:h-[26rem] rounded-[2rem] border-2 border-dashed border-violet-200 bg-white/60 grid place-items-center text-center p-8">
                <div>
                  <p className="text-5xl mb-3">🎟</p>
                  <p className="font-bold text-xl">
                    {user ? "No events yet" : "Log in to see events"}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {user
                      ? "Organizers can add one from “List your events”."
                      : "Create a free account to start booking."}
                  </p>
                </div>
              </div>
            )}
            {slides.length > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${i === slide % slides.length ? "w-8 bg-[#5b2be0]" : "w-2 bg-neutral-300"}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => go(-1)}
                    className="w-10 h-10 rounded-full border border-[var(--line)] bg-white hover:bg-violet-50"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => go(1)}
                    className="w-10 h-10 rounded-full border border-[var(--line)] bg-white hover:bg-violet-50"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="events" className="max-w-7xl mx-auto px-5 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <h2 className="text-3xl font-extrabold tracking-tight">
            All <span className="grad-text">events</span>
          </h2>
          {cities.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {["", ...cities].map((c) => (
                <button
                  key={c || "all"}
                  onClick={() => setCity(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${city === c ? "bg-[#14121f] text-white border-[#14121f]" : "bg-white border-[var(--line)] hover:border-violet-300"}`}
                >
                  {c || "All cities"}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-rose-600 mb-4">{error}</p>}
        {!user && !authLoading && (
          <div className="glass p-10 text-center">
            <p className="font-bold text-lg">
              Log in to browse events and book seats
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/login" className="btn btn-grad px-8">
                Login
              </Link>
              <Link href="/signup" className="btn btn-soft px-8">
                Sign up
              </Link>
            </div>
          </div>
        )}
        {user && !loading && shown.length === 0 && (
          <div className="glass p-10 text-center text-neutral-500">
            No events found.
          </div>
        )}

        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {loading &&
            user &&
            [...Array(8)].map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-[4/5]" />
                <div className="skeleton h-5 mt-3 w-3/4" />
                <div className="skeleton h-4 mt-2 w-1/2" />
              </div>
            ))}
          {shown.map((ev) => (
            <Link
              key={ev._id}
              href={`/events/${ev._id}`}
              className="group zoom block"
            >
              <Poster
                ev={ev}
                className="aspect-[4/5] rounded-2xl shadow-sm group-hover:shadow-xl transition-shadow"
              >
                <span className="absolute left-3 top-3 pill bg-white/90 text-neutral-800">
                  📍 {ev.city}
                </span>
                {ev.Status === "CANCELLED" && (
                  <span className="absolute right-3 top-3 pill pill-red">
                    Cancelled
                  </span>
                )}
              </Poster>
              <h3 className="mt-3 font-bold text-lg line-clamp-1 group-hover:text-[#5b2be0] transition">
                {ev.name}
              </h3>
              <p className="text-sm text-neutral-500 line-clamp-1">
                {ev.descrpition}
              </p>
              <span className="mt-1 inline-block text-sm font-bold text-[#5b2be0]">
                Book seats →
              </span>
            </Link>
          ))}
        </div>

        {pages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              className="btn btn-sm btn-soft"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              « Prev
            </button>
            <span className="text-sm font-semibold">
              Page {page} of {pages}
            </span>
            <button
              className="btn btn-sm btn-soft"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              Next »
            </button>
          </div>
        )}
      </section>
    </>
  );
}
