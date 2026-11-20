"use client";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/AuthProvider";
import { eventApi, errMsg } from "@/db/api";

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
    } // event routes require login
    setLoading(true);
    eventApi
      .get("/getAllEvent", { params: { page, limit: 9 } })
      .then((res) => {
        setEvents(res.data.data.event);
        setPages(res.data.data.pages || 1);
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [page, user, authLoading]);

  return (
    <>
      <div className="text-center">
        <span className="text-rotate text-5xl md:text-7xl font-bold duration-6000 mt-8">
          <span className="justify-items-center">
            <span>MOVIES</span>
            <span>CONCERTS</span>
            <span className="font-bold italic px-2 text-red-500">
              COMEDY ▶︎▶︎
            </span>
            <span>SPORTS</span>
            <span className="font-bold italic px-2 text-red-500">
              LIVE SHOWS ▶︎▶︎
            </span>
          </span>
        </span>
      </div>

      <section className="max-w-7xl mx-auto p-6 my-4">
        {!user && !authLoading && (
          <p className="text-center text-stone-600">
            <Link
              href="/login"
              className="text-red-500 font-semibold underline"
            >
              Log in
            </Link>{" "}
            to browse events and book seats.
          </p>
        )}
        {error && <p className="text-red-600 text-center">{error}</p>}
        {loading && user && (
          <p className="text-center text-stone-500">Loading events...</p>
        )}
        {user && !loading && events.length === 0 && (
          <p className="text-center text-stone-500">
            No events yet. Create one from the organizer dashboard.
          </p>
        )}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="card bg-white text-stone-800 border border-stone-200 shadow-md hover:shadow-xl transition overflow-hidden"
            >
              <figure className="h-32 bg-gradient-to-br from-red-500 via-orange-500 to-amber-400" />
              <div className="card-body">
                <h2 className="card-title">{ev.name}</h2>
                <p className="text-sm text-stone-500">{ev.city}</p>
                <p className="text-stone-600 line-clamp-2">{ev.descrpition}</p>
                <div className="card-actions justify-between items-center">
                  <span
                    className={`badge ${ev.Status === "CANCELLED" ? "badge-error" : "badge-success"}`}
                  >
                    {ev.Status}
                  </span>
                  <Link
                    href={`/events/${ev._id}`}
                    className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none"
                  >
                    Book seats
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pages > 1 && (
          <div className="join flex justify-center mt-8">
            <button
              className="join-item btn"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              «
            </button>
            <button className="join-item btn">
              Page {page} of {pages}
            </button>
            <button
              className="join-item btn"
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
