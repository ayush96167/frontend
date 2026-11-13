import type { Metadata } from "next";
import { RegisterStudentPage } from "@/components/pages/register-student-page";

export const metadata: Metadata = {
  title: "Create your student account — HiLabs Careers",
  description: "Create a free HiLabs Careers account and apply to verified jobs in one click.",
  openGraph: {
    title: "Create your student account — HiLabs Careers",
    description: "Create a free HiLabs Careers account and apply to verified jobs in one click.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RegisterStudentRoutePage() {
  return <RegisterStudentPage />;
}
