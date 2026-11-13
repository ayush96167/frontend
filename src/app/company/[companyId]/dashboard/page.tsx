"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Briefcase, Users } from "lucide-react";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { CompanyPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useCompanyApplications, useCompanyJobs, useCompanyProfile } from "@/lib/api/queries";
import { formatDate } from "@/lib/format";

export default function CompanyDashboardPage() {
  const { companyId } = useParams<{ companyId: string }>();

  return (
    <RequireRole roles={["COMPANY_USER"]} companyId={companyId}>
      {(user) => (
        <CompanyPortalShell user={user} companyId={companyId}>
          <CompanyDashboardBody companyId={companyId} />
        </CompanyPortalShell>
      )}
    </RequireRole>
  );
}

function CompanyDashboardBody({ companyId }: { companyId: string }) {
  const profile = useCompanyProfile(companyId);
  const jobs = useCompanyJobs(companyId);
  const apps = useCompanyApplications(companyId);

  const company = profile.data?.data;
  const allJobs = jobs.data ?? [];
  const allApps = apps.data ?? [];
  const publishedCount = allJobs.filter((j) => j.status === "PUBLISHED").length;
  const draftCount = allJobs.filter((j) => j.status === "DRAFT").length;
  const activePipelineCount = allApps.filter(
    (a) => !["REJECTED", "WITHDRAWN", "HIRED"].includes(a.stage),
  ).length;

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title={company?.name ?? "Company dashboard"}
        description={
          company
            ? `${company.location ?? "India"} · Status: ${company.status}`
            : "Manage job postings, review applicants, and collaborate with your HR team."
        }
        action={
          <div className="flex flex-wrap items-center gap-3">
            {company ? <StatusBadge status={company.status} /> : null}
            <Link
              href={`/company/${companyId}/jobs`}
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85"
            >
              Manage jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        }
      />

      {company && company.status !== "ACTIVE" ? (
        <div className="rounded-xl border border-warning/30 bg-warning-soft px-5 py-4 text-sm text-warning-foreground">
          Your company status is <strong>{company.status}</strong>. Publishing live jobs requires an{" "}
          <strong>ACTIVE</strong> verification status from the HiLabs team.
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Published jobs</span>
            <Briefcase className="h-4 w-4 text-brand" />
          </div>
          <p className="mt-3 text-3xl font-extrabold tabular-nums">{publishedCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">{draftCount} draft(s)</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Total applications</span>
            <Users className="h-4 w-4 text-brand" />
          </div>
          <p className="mt-3 text-3xl font-extrabold tabular-nums">{allApps.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {activePipelineCount} in active stages
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Quick actions</div>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link
              href={`/company/${companyId}/applications`}
              className="font-semibold text-brand hover:underline"
            >
              Review candidate pipeline →
            </Link>
            <Link
              href={`/company/${companyId}/team`}
              className="font-semibold text-brand hover:underline"
            >
              Team &amp; HR invitations →
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Recent applicants</h2>
          <Link
            href={`/company/${companyId}/applications`}
            className="text-xs font-semibold text-brand hover:underline"
          >
            View all
          </Link>
        </div>

        {apps.isLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-muted/40" />
        ) : allApps.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Once you publish a role and students apply, candidates will show up here."
          />
        ) : (
          <div className="divide-y">
            {allApps.slice(0, 6).map((app) => (
              <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold">{app.student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {app.jobTitle} · Applied {formatDate(app.appliedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={app.qualification.status} />
                  <StatusBadge status={app.stage} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
