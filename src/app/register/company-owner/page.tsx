import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterCompanyOwnerPage } from "@/components/pages/register-company-owner-page";
import { FullPageLoader } from "@/components/shared/app-shell";

export const metadata: Metadata = {
  title: "Register your company — HiLabs Careers",
  description:
    "Register your company on HiLabs Careers, get verified, and start hiring student talent.",
  openGraph: {
    title: "Register your company — HiLabs Careers",
    description:
      "Register your company on HiLabs Careers, get verified, and start hiring student talent.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RegisterCompanyOwnerRoutePage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <RegisterCompanyOwnerPage />
    </Suspense>
  );
}
