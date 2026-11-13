"use client";

import Link from "next/link";
import { ArrowRight, Bell, Bookmark, Briefcase, FileText } from "lucide-react";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { StudentPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ProfileCompletenessWidget } from "@/components/shared/profile-completeness-widget";
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

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Student Dashboard"
        description="Track profile readiness, recent applications, and saved roles."
        action={
          <Link
            href="/jobs"
            className="dt-btn inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-xs hover:bg-foreground/90 focus:outline-hidden focus:ring-2 focus:ring-brand focus:ring-offset-2"
          >
            Browse Open Jobs <ArrowRight className="size-4" />
          </Link>
        }
      />

      {/* Profile Completeness & Actionable Milestone Checklist (PRD Section 4) */}
      <ProfileCompletenessWidget completion={completion.data} isLoading={completion.isLoading} />

      {/* Metrics Row */}
      <section aria-label="Key Metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          href="/student/applications"
          icon={<Briefcase className="size-4 text-brand" />}
          label="Applications"
          value={applications.data?.length ?? 0}
        />
        <MetricCard
          href="/student/saved"
          icon={<Bookmark className="size-4 text-brand" />}
          label="Saved Jobs"
          value={saved.data?.length ?? 0}
        />
        <MetricCard
          href="/student/resumes"
          icon={<FileText className="size-4 text-brand" />}
          label="Active Resumes"
          value={resumes.data?.length ?? 0}
        />
        <MetricCard
          href="/student/notifications"
          icon={<Bell className="size-4 text-brand" />}
          label="Unread Alerts"
          value={unread.data ?? 0}
        />
      </section>

      {/* Recent Applications Pipeline */}
      <section className="dt-card rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Recent Applications
            </h2>
            <p className="text-xs text-muted-foreground">
              Keep track of your interview stages and offers.
            </p>
          </div>
          <Link
            href="/student/applications"
            className="text-xs font-semibold text-brand hover:underline"
          >
            View All Applications →
          </Link>
        </div>

        {applications.isLoading ? (
          <div className="h-32 animate-pulse rounded-xl bg-muted/40" />
        ) : (applications.data ?? []).length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="When you apply for roles on HiLabs Careers, your real-time stage progress will appear here."
            action={
              <Link
                href="/jobs"
                className="dt-btn inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
              >
                Explore Open Jobs
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-border/60">
            {(applications.data ?? []).slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3.5 transition-colors hover:bg-muted/20"
              >
                <div>
                  <Link
                    href={`/jobs/${app.job.id}`}
                    className="font-semibold text-foreground hover:underline"
                  >
                    {app.job.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
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
    <Link
      href={href}
      className="dt-card group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-150 hover:border-brand/40 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
          {label}
        </span>
        <div className="flex size-7 items-center justify-center rounded-lg bg-brand-soft/50 group-hover:bg-brand-soft">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
    </Link>
  );
}
