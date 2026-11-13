"use client";

import Link from "next/link";
import { ArrowRight, Building2, ClipboardCheck, Mail } from "lucide-react";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { AdminPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  useAdminAllowlist,
  useAdminCompanies,
  useAdminCompanyInvitations,
} from "@/lib/api/queries";
import { formatDate } from "@/lib/format";

export default function AdminDashboardPage() {
  return (
    <RequireRole roles={["PORTAL_HR", "MASTER_ADMIN"]}>
      {(user) => (
        <AdminPortalShell user={user}>
          <AdminDashboardBody />
        </AdminPortalShell>
      )}
    </RequireRole>
  );
}

function AdminDashboardBody() {
  const companies = useAdminCompanies();
  const invitations = useAdminCompanyInvitations();
  const allowlist = useAdminAllowlist();

  const companyList = companies.data ?? [];
  const inReview = companyList.filter((c) => c.status === "IN_REVIEW");
  const activeCount = companyList.filter((c) => c.status === "ACTIVE").length;
  const pendingInvites = (invitations.data ?? []).filter((i) => i.status === "PENDING").length;
  const availableStudents = (allowlist.data ?? []).filter((s) => s.status === "AVAILABLE").length;

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Admin overview"
        description="Verify incoming companies, issue employer registration invites, and manage student eligibility."
        action={
          <Link
            href="/admin/companies"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85"
          >
            Manage companies <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Awaiting review</span>
            <Building2 className="h-4 w-4 text-warning" />
          </div>
          <p className="mt-3 text-3xl font-extrabold tabular-nums">{inReview.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Active employers</span>
            <Building2 className="h-4 w-4 text-brand" />
          </div>
          <p className="mt-3 text-3xl font-extrabold tabular-nums">{activeCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Pending company invites</span>
            <Mail className="h-4 w-4 text-brand" />
          </div>
          <p className="mt-3 text-3xl font-extrabold tabular-nums">{pendingInvites}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Available allowlist</span>
            <ClipboardCheck className="h-4 w-4 text-brand" />
          </div>
          <p className="mt-3 text-3xl font-extrabold tabular-nums">{availableStudents}</p>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Recent company submissions</h2>
          <Link
            href="/admin/companies"
            className="text-xs font-semibold text-brand hover:underline"
          >
            View all
          </Link>
        </div>
        {companyList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No companies registered yet.</p>
        ) : (
          <div className="divide-y">
            {companyList.slice(0, 6).map((c) => (
              <div
                key={c.companyId}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.adminEmail ?? "No admin email"} · Registered {formatDate(c.createdAt)}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
