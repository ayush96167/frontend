"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { CompanyPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { JobForm } from "@/components/shared/job-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  closeCompanyJob,
  createCompanyJob,
  deleteDraftJob,
  publishCompanyJob,
  type CreateCompanyJobPayload,
} from "@/lib/api/endpoints";
import { useCompanyJobs } from "@/lib/api/queries";
import { employmentTypeLabels, formatDate, workModeLabels } from "@/lib/format";

export default function CompanyJobsPage() {
  const { companyId } = useParams<{ companyId: string }>();

  return (
    <RequireRole roles={["COMPANY_USER"]} companyId={companyId}>
      {(user) => (
        <CompanyPortalShell user={user} companyId={companyId}>
          <CompanyJobsBody companyId={companyId} />
        </CompanyPortalShell>
      )}
    </RequireRole>
  );
}

function CompanyJobsBody({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const jobs = useCompanyJobs(companyId);
  const [createOpen, setCreateOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: (payload: CreateCompanyJobPayload) => createCompanyJob(companyId, payload),
    onSuccess: () => {
      toast.success("Job draft created", { description: "Publish it whenever you're ready." });
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["company", companyId, "jobs"] });
    },
    onError: (err: Error) => toast.error("Couldn't create job", { description: err.message }),
  });

  const publishMutation = useMutation({
    mutationFn: (jobId: string) => publishCompanyJob(companyId, jobId),
    onSuccess: () => {
      toast.success("Job published");
      queryClient.invalidateQueries({ queryKey: ["company", companyId, "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err: Error) => toast.error("Failed to publish", { description: err.message }),
  });

  const closeMutation = useMutation({
    mutationFn: (jobId: string) => closeCompanyJob(companyId, jobId),
    onSuccess: () => {
      toast.success("Job closed");
      queryClient.invalidateQueries({ queryKey: ["company", companyId, "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err: Error) => toast.error("Failed to close", { description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => deleteDraftJob(companyId, jobId),
    onSuccess: () => {
      toast.success("Draft deleted");
      queryClient.invalidateQueries({ queryKey: ["company", companyId, "jobs"] });
    },
    onError: (err: Error) => toast.error("Failed to delete", { description: err.message }),
  });

  return (
    <div>
      <PortalPageHeader
        title="Company jobs"
        description="Create role drafts, publish open listings, and monitor applicant volume."
        action={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Create job
          </Button>
        }
      />

      {jobs.isLoading ? (
        <div className="h-44 animate-pulse rounded-xl border bg-muted/40" />
      ) : (jobs.data ?? []).length === 0 ? (
        <EmptyState
          title="No jobs posted yet"
          description="Create your first draft job posting to begin hiring HiLabs candidates."
          action={
            <Button type="button" onClick={() => setCreateOpen(true)}>
              Create job posting
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {(jobs.data ?? []).map((job) => (
            <div
              key={job.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold">{job.title}</span>
                  <StatusBadge status={job.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {job.locations.join(", ") || "India"}
                  {job.employmentType ? ` · ${employmentTypeLabels[job.employmentType]}` : ""}
                  {job.workMode ? ` · ${workModeLabels[job.workMode]}` : ""}
                  {` · ${job.applicationCount} applicant(s)`}
                  {job.applicationDeadline
                    ? ` · Deadline ${formatDate(job.applicationDeadline)}`
                    : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {job.status === "PUBLISHED" ? (
                  <>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                    >
                      View public page
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={closeMutation.isPending}
                      onClick={() => closeMutation.mutate(job.id)}
                    >
                      Close job
                    </Button>
                  </>
                ) : null}
                {job.status === "DRAFT" ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      disabled={publishMutation.isPending}
                      onClick={() => publishMutation.mutate(job.id)}
                    >
                      Publish
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(job.id)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create job posting</DialogTitle>
            <DialogDescription>
              Draft a role listing. You can publish it immediately once created.
            </DialogDescription>
          </DialogHeader>
          <JobForm
            submitLabel="Create draft"
            pending={createMutation.isPending}
            onSubmit={(payload) => createMutation.mutate(payload)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
