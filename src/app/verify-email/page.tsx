import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyEmailPage } from "@/components/pages/verify-email-page";
import { FullPageLoader } from "@/components/shared/app-shell";

export const metadata: Metadata = {
  title: "Verify your email — HiLabs Careers",
  description: "Verify your email address to activate your HiLabs Careers account.",
  openGraph: {
    title: "Verify your email — HiLabs Careers",
    description: "Verify your email address to activate your HiLabs Careers account.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function VerifyEmailRoutePage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <VerifyEmailPage />
    </Suspense>
  );
}
