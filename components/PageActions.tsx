"use client";

import { useState } from "react";

// Stripe-style page actions shown under the title: copy the page's markdown for pasting into an
// LLM, or open the raw markdown. The markdown is passed in from the statically-rendered server
// page (no runtime fetch needed to copy).
export default function PageActions({
  markdown,
  mdHref,
}: {
  markdown: string;
  mdHref: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (insecure context or denied): fall back to opening the raw markdown.
      window.open(mdHref, "_blank", "noopener");
    }
  }

  const base =
    "inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-2.5 py-1.5 text-[13px] font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground";

  return (
    <div className="not-prose mb-8 flex flex-wrap items-center gap-2">
      <button type="button" onClick={copy} className={base} aria-live="polite">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {copied ? (
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <>
              <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M5 15V5a2 2 0 0 1 2-2h10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
        {copied ? "Copied" : "Copy for LLM"}
      </button>
      <a href={mdHref} className={base} target="_blank" rel="noopener noreferrer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 5h16M4 12h16M4 19h10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        View as markdown
      </a>
    </div>
  );
}
