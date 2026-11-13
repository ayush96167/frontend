import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginPage } from "@/components/pages/login-page";
import { FullPageLoader } from "@/components/shared/app-shell";

export const metadata: Metadata = {
  title: "Sign in — HiLabs Careers",
  description: "Sign in to HiLabs Careers to manage applications and job postings.",
  openGraph: {
    title: "Sign in — HiLabs Careers",
    description: "Sign in to HiLabs Careers to manage applications and job postings.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function LoginRoutePage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <LoginPage />
    </Suspense>
  );
}
