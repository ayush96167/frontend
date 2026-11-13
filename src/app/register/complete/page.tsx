import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterCompletePage } from "@/components/pages/register-complete-page";
import { FullPageLoader } from "@/components/shared/app-shell";

export const metadata: Metadata = {
  title: "Complete student registration — HiLabs Careers",
  description: "Set your password and activate your allowlisted HiLabs student account.",
};

export default function RegisterCompleteRoutePage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <RegisterCompletePage />
    </Suspense>
  );
}
