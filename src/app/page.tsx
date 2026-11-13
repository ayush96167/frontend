import type { Metadata } from "next";
import { LandingPage } from "@/components/pages/landing-page";

export const metadata: Metadata = {
  title: "HiLabs Careers — Verified Campus Jobs & One-Click Hiring",
  description:
    "Search open roles at domain-verified companies, apply in one click with your saved resume, and track every application stage.",
  openGraph: {
    title: "HiLabs Careers — Verified Campus Jobs & One-Click Hiring",
    description:
      "Every company is verified before posting. Search open roles, apply with one saved resume, and track every application.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
