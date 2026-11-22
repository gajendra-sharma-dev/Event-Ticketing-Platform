// two-column layout shared by login and signup
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="max-w-5xl mx-auto px-5 py-10 md:py-16 grid md:grid-cols-2 gap-8 items-stretch">
      <div
        className="hidden md:flex flex-col justify-between rounded-[2rem] p-10 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg,#5b2be0,#c026d3 60%,#ff5a7a)",
        }}
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -left-10 bottom-10 w-44 h-44 rounded-full bg-white/10" />
        <p className="relative text-2xl font-extrabold lowercase">
          ticketshows
        </p>
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight">
            Your seat is
            <br />
            waiting for you.
          </h2>
          <p className="mt-3 text-white/80">
            Book concerts, comedy and live shows with a real seat map.
          </p>
        </div>
        <p className="relative text-sm text-white/70">
          💺 Choose seats · ⚡ Instant tickets
        </p>
      </div>
      <div className="glass p-8 md:p-10 flex flex-col justify-center">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
