import { Suspense } from "react";
import type { Metadata } from "next";
import { JobsBrowsePage } from "@/components/pages/jobs-browse-page";
import { FullPageLoader } from "@/components/shared/app-shell";

export const metadata: Metadata = {
  title: "Browse open jobs — HiLabs Careers",
  description:
    "Explore verified internships and full-time roles posted by HiLabs employer partners.",
};

export default function JobsRoutePage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <JobsBrowsePage />
    </Suspense>
  );
}
