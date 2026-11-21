import Link from "next/link";

export default function Footer() {
  const h = "font-bold mb-3";
  const a = "block text-neutral-600 hover:text-[#5b2be0] mb-2";
  return (
    <footer className="mt-10 border-t border-neutral-200 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-5 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <p className="text-3xl font-black lowercase tracking-tight">
            ticket<span className="text-[#5b2be0]">shows</span>
          </p>
          <p className="mt-3 text-neutral-500 max-w-xs">
            The best of concerts, comedy, sports and live shows. Pick your exact
            seat and go.
          </p>
        </div>
        <div>
          <p className={h}>Help</p>
          <a className={a} href="mailto:support@ticketshows.com">
            Contact Us
          </a>
          <a className={a}>Terms of Service</a>
          <a className={a}>Privacy Policy</a>
        </div>
        <div>
          <p className={h}>Quick Links</p>
          <Link className={a} href="/dashboard">
            List your events
          </Link>
          <Link className={a} href="/orders">
            My orders
          </Link>
          <Link className={a} href="/">
            Browse events
          </Link>
        </div>
        <div>
          <p className={h}>Download App</p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-4 py-2 rounded-lg bg-neutral-900 text-white font-semibold">
              {" "}
              App Store
            </span>
            <span className="px-4 py-2 rounded-lg bg-neutral-900 text-white font-semibold">
              ▶ Google Play
            </span>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-neutral-400 pb-6">
        © {new Date().getFullYear()} TicketShows
      </p>
    </footer>
  );
}
