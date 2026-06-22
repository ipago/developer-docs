import Link from "next/link";

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M3 9 4.5 4.5A1 1 0 0 1 5.5 4h13a1 1 0 0 1 1 .5L21 9" />
      <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <path d="M3 9a2.5 2.5 0 0 0 4.5 1.5A2.5 2.5 0 0 0 12 11a2.5 2.5 0 0 0 4.5-.5A2.5 2.5 0 0 0 21 9" />
      <path d="M9 20v-5h6v5" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m13.5 6-3 12" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const tiles = [
  {
    href: "/creators",
    icon: <StoreIcon />,
    eyebrow: "For creators & sellers",
    title: "Creators",
    body: "Launch your store, add your products, and start getting paid, with step-by-step guides and no code required.",
    cta: "Start selling",
    accent: "#8B7CFF",
  },
  {
    href: "/dev",
    icon: <CodeIcon />,
    eyebrow: "For developers",
    title: "Developers",
    body: "Bring 2Pay into your own site, app, or game, and automate everything with our APIs and webhooks.",
    cta: "Start building",
    accent: "#FF6A4D",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-[#0b0d0f] text-white overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/3 -translate-x-1/2 h-96 w-[40rem] rounded-full bg-[#8B7CFF]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/3 h-96 w-[40rem] rounded-full bg-[#FF6A4D]/10 blur-3xl" />

      <div className="relative text-center mb-12">
        <p className="text-sm font-bold tracking-wide text-white/50 mb-4">
          2Pay <span className="text-white/30">/</span> Documentation
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Get started with 2Pay
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Whether you&apos;re setting up your first store or building a custom
          integration, you&apos;re in the right place.
        </p>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05]"
          >
            <span
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ boxShadow: `0 0 0 1px ${t.accent}66, 0 20px 60px -20px ${t.accent}55` }}
            />
            <span
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: `${t.accent}22`, color: t.accent }}
            >
              {t.icon}
            </span>
            <p className="relative text-xs uppercase tracking-widest text-white/40 mb-1.5">
              {t.eyebrow}
            </p>
            <h2 className="relative text-2xl font-bold mb-2">{t.title}</h2>
            <p className="relative text-white/60 text-sm leading-relaxed mb-6 flex-1">
              {t.body}
            </p>
            <span
              className="relative inline-flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all"
              style={{ color: t.accent }}
            >
              {t.cta}
              <ArrowIcon />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
