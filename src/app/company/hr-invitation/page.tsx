import { Suspense } from "react";
import type { Metadata } from "next";
import { HrInvitationPage } from "@/components/pages/hr-invitation-page";
import { FullPageLoader } from "@/components/shared/app-shell";

export const metadata: Metadata = {
  title: "Accept HR invitation — HiLabs Careers",
  description: "Accept your company recruiter invitation and join your team on HiLabs Careers.",
};

export default function HrInvitationRoutePage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <HrInvitationPage />
    </Suspense>
  );
}
