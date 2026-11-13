import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterCompanyOwnerPage } from "@/components/pages/register-company-owner-page";
import { FullPageLoader } from "@/components/shared/app-shell";

export const metadata: Metadata = {
  title: "Register your company — HiLabs Careers",
  description: "Onboard your company onto HiLabs Careers with your private invitation link.",
};

export default function CompanyRegisterRoutePage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <RegisterCompanyOwnerPage />
    </Suspense>
  );
}
