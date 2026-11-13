import { Suspense } from "react";
import type { Metadata } from "next";
import { AccountActivationPage } from "@/components/pages/account-activation-page";
import { FullPageLoader } from "@/components/shared/app-shell";

export const metadata: Metadata = {
  title: "Activate your account — HiLabs Careers",
  description: "Set your password and activate your invited portal account.",
};

export default function AccountActivationRoutePage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <AccountActivationPage />
    </Suspense>
  );
}
