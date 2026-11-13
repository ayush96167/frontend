import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DM_Mono, Instrument_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "HiLabs Careers — Verified Campus Jobs & One-Click Hiring",
  description:
    "HiLabs Careers connects allowlisted students with domain-verified employers. Search open roles, apply in one click with your saved resume, and track every stage.",
  authors: [{ name: "HiLabs" }],
  openGraph: {
    title: "HiLabs Careers — Verified Campus Jobs & One-Click Hiring",
    description:
      "Every company passes domain verification before posting. Search open roles, apply with one saved resume, and track applications live.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${dmMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
