"use client";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/AuthProvider";
import { eventApi, errMsg } from "@/db/api";

const GRADS = [
  "from-rose-500 to-orange-400",
  "from-violet-600 to-fuchsia-500",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-400",
  "from-amber-400 to-pink-500",
  "from-indigo-500 to-sky-400",
];

export default function Hero() {
  const { user, loading: authLoading } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
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
      .get("/getAllEvent", { params: { page, limit: 9 } })
      .then((r) => {
        setEvents(r.data.data.event);
        setPages(r.data.data.pages || 1);
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [page, user, authLoading]);

  return (
    <>
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="badge border-0 bg-violet-100 text-violet-700 font-semibold mb-4">
            🔥 Live shows near you
          </span>
          <h1 className="text-5xl md:text-7xl font-black leading-[1.05]">
            Feel the <span className="grad-text">moment</span>,<br />
            book your seat.
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-md">
            Concerts, comedy, sports and more. Pick your exact seat on a live
            seat map and get your ticket in seconds.
          </p>
          <div className="mt-7 flex gap-3">
            <a href="#events" className="btn btn-grad btn-lg rounded-2xl">
              Explore events
            </a>
            {!user && (
              <Link href="/login" className="btn btn-lg btn-soft rounded-2xl">
                Login
              </Link>
            )}
          </div>
        </div>

        {/* 3D floating tickets */}
        <div className="scene h-80 md:h-96 grid place-items-center">
          <div className="ticket3d relative w-64 h-40">
            {GRADS.slice(0, 3).map((g, i) => (
              <div
                key={i}
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${g} text-white p-5 shadow-2xl flex flex-col justify-between`}
                style={{
                  transform: `translateZ(${i * 45 - 45}px) translateY(${i * -22}px)`,
                }}
              >
                <div className="flex justify-between text-xs font-bold tracking-widest opacity-90">
                  <span>ADMIT ONE</span>
                  <span>VIP</span>
                </div>
                <p className="text-2xl font-black">
                  {["CONCERT", "COMEDY", "SPORTS"][i]}
                </p>
                <div className="h-2 rounded bg-white/40" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="events" className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-extrabold mb-6">
          Trending <span className="grad-text">events</span>
        </h2>

        {!user && !authLoading && (
          <div className="glass p-8 text-center">
            <Link href="/login" className="font-bold text-violet-600 underline">
              Log in
            </Link>{" "}
            to browse events and book seats.
          </div>
        )}
        {error && <p className="text-rose-600">{error}</p>}
        {loading && user && <p className="text-slate-500">Loading events...</p>}
        {user && !loading && events.length === 0 && (
          <div className="glass p-8 text-center text-slate-500">
            No events yet. Create one from the dashboard.
          </div>
        )}

        <div className="scene grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev, i) => (
            <div key={ev._id} className="tilt glass overflow-hidden">
              <div
                className={`h-36 bg-gradient-to-br ${GRADS[i % GRADS.length]} grid place-items-center text-white text-6xl font-black`}
              >
                <span className="floaty drop-shadow-lg">
                  {ev.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-xl font-bold">{ev.name}</h3>
                <p className="text-sm text-violet-600 font-semibold">
                  📍 {ev.city}
                </p>
                <p className="text-slate-600 line-clamp-2 text-sm">
                  {ev.descrpition}
                </p>
                <div className="flex justify-between items-center pt-2">
                  <span
                    className={`badge border-0 ${ev.Status === "CANCELLED" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {ev.Status}
                  </span>
                  <Link
                    href={`/events/${ev._id}`}
                    className="btn btn-sm btn-grad rounded-xl"
                  >
                    Book seats →
                  </Link>
                </div>
              </div>
            </div>
          ))}
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
