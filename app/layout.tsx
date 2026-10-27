import "./global.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Hanken_Grotesk, Geist, Geist_Mono } from "next/font/google";

const DOCS_URL = "https://docs.ipago.io";
const DOCS_DESCRIPTION = "Developer and creator documentation for iPago. iPago Sp. z o.o. resells game licences: guides, API reference, and webstore setup.";

export const metadata: Metadata = {
  metadataBase: new URL(DOCS_URL),
  title: { default: "iPago Documentation", template: "%s | iPago Docs" },
  description: DOCS_DESCRIPTION,
  applicationName: "iPago Documentation",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "iPago Documentation", title: "iPago Documentation", description: DOCS_DESCRIPTION, url: DOCS_URL, locale: "en_US" },
  twitter: { card: "summary", title: "iPago Documentation", description: DOCS_DESCRIPTION },
  robots: { index: true, follow: true },
};

// Brand-consistent with the marketing site: Hanken Grotesk for headings, Geist for body,
// Geist Mono for code. The docs are always light, so no theme class is toggled.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${hanken.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <body className="flex flex-col min-h-screen">{children}</body>
    </html>
  );
}
