"use client";

import Link from "next/link";
import { ArrowRight, Bell, Bookmark, Briefcase, FileText } from "lucide-react";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { StudentPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Progress } from "@/components/ui/progress";
import {
  useSavedJobs,
  useStudentApplications,
  useStudentCompletion,
  useStudentResumes,
  useUnreadNotificationCount,
} from "@/lib/api/queries";
import { formatDate } from "@/lib/format";

export default function StudentDashboardPage() {
  return (
    <RequireRole roles={["STUDENT"]}>
      {(user) => (
        <StudentPortalShell user={user}>
          <StudentDashboardBody />
        </StudentPortalShell>
      )}
    </RequireRole>
  );
}

function StudentDashboardBody() {
  const completion = useStudentCompletion();
  const applications = useStudentApplications();
  const saved = useSavedJobs();
  const resumes = useStudentResumes();
  const unread = useUnreadNotificationCount();

  const pct = completion.data?.percentage ?? 0;

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Student dashboard"
        description="Track profile readiness, recent applications, and saved roles."
        action={
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85"
          >
            Browse open jobs <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <section className="rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Profile completion</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {completion.data
                ? `Status: ${completion.data.label.replaceAll("_", " ")} · Apply threshold ${completion.data.thresholds.apply}%`
                : "Calculating readiness…"}
            </p>
          </div>
          <span className="text-2xl font-extrabold tabular-nums">{pct}%</span>
        </div>
        <Progress value={pct} className="mt-3 h-2.5" aria-label="Profile completion percentage" />
        {(completion.data?.missingSections?.length ?? 0) > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Missing: {completion.data?.missingSections.join(", ")}</span>
            <Link href="/student/profile" className="font-semibold text-brand hover:underline">
              Complete profile
            </Link>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          href="/student/applications"
          icon={<Briefcase className="h-4 w-4 text-brand" />}
          label="Applications"
          value={applications.data?.length ?? 0}
        />
        <MetricCard
          href="/student/saved"
          icon={<Bookmark className="h-4 w-4 text-brand" />}
          label="Saved jobs"
          value={saved.data?.length ?? 0}
        />
        <MetricCard
          href="/student/resumes"
          icon={<FileText className="h-4 w-4 text-brand" />}
          label="Resumes"
          value={resumes.data?.length ?? 0}
        />
        <MetricCard
          href="/student/notifications"
          icon={<Bell className="h-4 w-4 text-brand" />}
          label="Unread alerts"
          value={unread.data ?? 0}
        />
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Recent applications</h2>
          <Link
            href="/student/applications"
            className="text-xs font-semibold text-brand hover:underline"
          >
            View all
          </Link>
        </div>

        {applications.isLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-muted/40" />
        ) : (applications.data ?? []).length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="When you apply for roles on HiLabs Careers, your progress updates will appear here."
            action={
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold hover:bg-accent"
              >
                Explore open jobs
              </Link>
            }
          />
        ) : (
          <div className="divide-y">
            {(applications.data ?? []).slice(0, 5).map((app) => (
              <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <Link href={`/jobs/${app.job.id}`} className="font-semibold hover:underline">
                    {app.job.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {app.job.companyName} · Applied {formatDate(app.appliedAt)}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Link href={href} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-extrabold tabular-nums">{value}</p>
    </Link>
  );
}
