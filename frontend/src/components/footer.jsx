import Link from "next/link";

export default function Footer() {
  const h = "font-bold mb-4 text-sm";
  const a =
    "block text-sm text-neutral-500 hover:text-[#5b2be0] mb-2.5 transition";
  return (
    <footer className="mt-16 bg-[#14121f] text-white">
      <div className="max-w-7xl mx-auto px-5 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-2xl font-extrabold lowercase tracking-tight">
            ticket<span className="text-violet-400">shows</span>
          </p>
          <p className="mt-3 text-sm text-neutral-400 max-w-xs">
            Concerts, comedy, sports and live shows. Choose your exact seat and
            walk in with a ticket in your pocket.
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
            <span className="px-4 py-2 rounded-xl bg-white/10 text-sm font-semibold">
              {" "}
              App Store
            </span>
            <span className="px-4 py-2 rounded-xl bg-white/10 text-sm font-semibold">
              ▶ Google Play
            </span>
          </div>
        </div>
      </div>
      <p className="border-t border-white/10 text-center text-xs text-neutral-500 py-5">
        © {new Date().getFullYear()} TicketShows. All rights reserved.
      </p>
    </footer>
  );
}
