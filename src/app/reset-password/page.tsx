import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordPage } from "@/components/pages/reset-password-page";
import { FullPageLoader } from "@/components/shared/app-shell";

export const metadata: Metadata = {
  title: "Reset password — HiLabs Careers",
  description: "Request a password reset link or choose a new password.",
};

export default function ResetPasswordRoutePage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
