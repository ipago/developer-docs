import Link from "next/link";

// Light, Stripe-style documentation hub. Uses the same light Fumadocs palette + brand fonts as
// the docs (see app/global.css). No dark styling: the docs are always light.

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M3 9 4.5 4.5A1 1 0 0 1 5.5 4h13a1 1 0 0 1 1 .5L21 9" />
      <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <path d="M3 9a2.5 2.5 0 0 0 4.5 1.5A2.5 2.5 0 0 0 12 11a2.5 2.5 0 0 0 4.5-.5A2.5 2.5 0 0 0 21 9" />
      <path d="M9 20v-5h6v5" />
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="m8 8-4 4 4 4" /><path d="m16 8 4 4-4 4" /><path d="m13.5 6-3 12" />
    </svg>
  );
}
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const modules = [
  {
    href: "/creators/welcome",
    icon: <StoreIcon />,
    eyebrow: "For creators & sellers",
    title: "Creator guides",
    body: "Launch your store, add products, set pricing, and get paid. Step by step, no code required.",
    cta: "Start selling",
    accent: "#7C5CFF",
  },
  {
    href: "/dev",
    icon: <CodeIcon />,
    eyebrow: "For developers",
    title: "Developer docs",
    body: "Read your catalog, confirm delivery, and react to events with the API, storefront endpoints, and webhooks.",
    cta: "Start building",
    accent: "#E2492E",
  },
];

const popular = [
  { href: "/dev/quick-start", title: "Quick start", desc: "From an API key to your first authenticated request." },
  { href: "/dev/developer-api/authentication", title: "Authentication", desc: "API keys, test and live modes, and scopes." },
  { href: "/dev/checkout/overview", title: "Checkout", desc: "Embed the hosted, tax-inclusive checkout." },
  { href: "/dev/webhooks/overview", title: "Webhooks", desc: "Subscribe to sales, refunds, and disputes." },
  { href: "/creators/getting-started", title: "Get verified", desc: "Identity and project verification to go live." },
  { href: "/creators/pricing", title: "Pricing & fees", desc: "How platform and gateway fees work." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--fd-background))] text-[hsl(var(--fd-foreground))]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[hsl(var(--fd-border))]">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-[#E2492E]/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-10 h-64 w-64 rounded-full bg-[#7C5CFF]/[0.06] blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center sm:py-24">
          <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--fd-muted-foreground))]">
            iPago Documentation
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Everything you need to sell and build on iPago
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[hsl(var(--fd-muted-foreground))]">
            iPago is your Merchant of Record. We handle payments, tax, and payouts. These docs cover
            running your store and integrating the API, webhooks, and storefront.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dev/quick-start"
              className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--fd-primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--fd-primary-foreground))] transition-opacity hover:opacity-90"
            >
              Quick start <Arrow />
            </Link>
            <Link
              href="/creators/welcome"
              className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--fd-border))] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[hsl(var(--fd-muted))]"
            >
              Creator guides
            </Link>
          </div>
        </div>
      </section>

      {/* Module split */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group relative flex flex-col rounded-2xl border border-[hsl(var(--fd-border))] bg-[hsl(var(--fd-card))] p-7 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-24px_rgba(20,20,40,0.28)]"
            >
              <span
                className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${m.accent}14`, color: m.accent }}
              >
                {m.icon}
              </span>
              <p className="text-xs font-medium uppercase tracking-widest text-[hsl(var(--fd-muted-foreground))]">
                {m.eyebrow}
              </p>
              <h2 className="mt-1 text-xl font-bold">{m.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[hsl(var(--fd-muted-foreground))]">
                {m.body}
              </p>
              <span
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5"
                style={{ color: m.accent }}
              >
                {m.cta} <Arrow />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular topics */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-[hsl(var(--fd-muted-foreground))]">
          Popular topics
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group rounded-xl border border-[hsl(var(--fd-border))] bg-[hsl(var(--fd-card))] p-5 transition-colors hover:border-[hsl(var(--fd-primary))]/40 hover:bg-[hsl(var(--fd-muted))]"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{p.title}</span>
                <span className="text-[hsl(var(--fd-muted-foreground))] transition-transform group-hover:translate-x-0.5">
                  <Arrow />
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[hsl(var(--fd-muted-foreground))]">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
