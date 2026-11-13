"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { StudentPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStudentApplication, withdrawApplication } from "@/lib/api/endpoints";
import { useStudentApplications } from "@/lib/api/queries";
import type { StudentApplication } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

export default function StudentApplicationsPage() {
  return (
    <RequireRole roles={["STUDENT"]}>
      {(user) => (
        <StudentPortalShell user={user}>
          <StudentApplicationsBody />
        </StudentPortalShell>
      )}
    </RequireRole>
  );
}

const WITHDRAW_BLOCKED = new Set(["WITHDRAWN", "HIRED", "REJECTED"]);

function StudentApplicationsBody() {
  const queryClient = useQueryClient();
  const applications = useStudentApplications();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState<
    "OFFER_DECLINED" | "ACCEPTED_OTHER_OFFER" | "NOT_INTERESTED" | "OTHER"
  >("NOT_INTERESTED");
  const [note, setNote] = useState("");

  const detail = useQuery({
    queryKey: ["student", "application", selectedId],
    queryFn: async () => (await getStudentApplication(selectedId!)).data,
    enabled: Boolean(selectedId),
  });

  const withdraw = useMutation({
    mutationFn: (id: string) =>
      withdrawApplication(id, { reason, ...(note.trim() ? { note: note.trim() } : {}) }),
    onSuccess: () => {
      toast.success("Application withdrawn");
      queryClient.invalidateQueries({ queryKey: ["student", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setSelectedId(null);
      setNote("");
    },
    onError: (err: Error) => toast.error("Failed to withdraw", { description: err.message }),
  });

  const columns: Column<StudentApplication>[] = [
    {
      id: "title",
      header: "Role / Opportunity",
      cell: (app) => (
        <div>
          <Link
            href={`/jobs/${app.job.id}`}
            className="font-semibold text-foreground hover:text-brand hover:underline"
          >
            {app.job.title}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">{app.job.companyName}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Current Stage",
      cell: (app) => <StatusBadge status={app.status} />,
    },
    {
      id: "appliedAt",
      header: "Applied On",
      cell: (app) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDate(app.appliedAt)}
        </span>
      ),
    },
    {
      id: "action",
      header: "Action",
      className: "text-right",
      headerClassName: "text-right",
      cell: (app) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSelectedId(app.id)}
          className="dt-btn text-xs"
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="My Applications"
        description="Track interview stages, employer feedback, and active hiring pipelines."
      />

      <DataTable
        columns={columns}
        data={applications.data ?? []}
        keyExtractor={(app) => app.id}
        isLoading={applications.isLoading}
        caption="Student job applications"
        emptyState={
          <EmptyState
            title="No applications submitted yet"
            description="Explore open roles at verified partner companies and submit your application."
            action={
              <Link
                href="/jobs"
                className="dt-btn inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85"
              >
                Browse Open Jobs <ArrowRight className="size-4" />
              </Link>
            }
          />
        }
      />

      {/* Application Stage Detail & Withdrawal Modal */}
      <Dialog
        open={Boolean(selectedId)}
        onOpenChange={(open) => (open ? undefined : setSelectedId(null))}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {detail.data?.job.title ?? "Application Details"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {detail.data?.job.companyName}
            </DialogDescription>
          </DialogHeader>

          {detail.isLoading ? (
            <div className="h-40 animate-pulse rounded-xl bg-muted/40" />
          ) : detail.data ? (
            <div className="space-y-5 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-muted/30 p-3.5 border border-border/70">
                <span className="font-medium text-muted-foreground">Hiring Stage</span>
                <StatusBadge status={detail.data.status} />
              </div>

              {/* Stage Progression Timeline */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hiring Pipeline Steps
                </p>
                <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  {["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED"].map(
                    (stageStep, idx) => {
                      const isCurrent = detail.data?.status === stageStep;
                      return (
                        <div key={stageStep} className="flex items-center gap-1">
                          <span
                            className={
                              isCurrent
                                ? "rounded-md bg-brand px-1.5 py-0.5 font-bold text-white"
                                : "text-muted-foreground/70"
                            }
                          >
                            {stageStep}
                          </span>
                          {idx < 5 && <span className="opacity-40">→</span>}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {detail.data.messageToCandidate ? (
                <div className="rounded-xl border border-brand/20 bg-brand-soft/40 p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                    Note from Recruiter
                  </p>
                  <p className="mt-1 whitespace-pre-line text-xs text-foreground">
                    {detail.data.messageToCandidate}
                  </p>
                </div>
              ) : null}

              {detail.data.coverLetter ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Cover Letter
                  </p>
                  <p className="mt-1 whitespace-pre-line text-xs text-foreground bg-muted/20 p-3 rounded-lg border border-border/60">
                    {detail.data.coverLetter}
                  </p>
                </div>
              ) : null}

              {/* Withdrawal Section with PRD Invariants */}
              {!WITHDRAW_BLOCKED.has(detail.data.status) ? (
                <div className="space-y-3.5 border-t border-border/70 pt-4">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="size-4 shrink-0" />
                    <p className="text-xs font-semibold">
                      Need to withdraw? You can reapply after 90 days.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="withdraw-reason" className="text-xs font-semibold">
                      Reason for Withdrawal
                    </Label>
                    <Select value={reason} onValueChange={(v) => setReason(v as typeof reason)}>
                      <SelectTrigger id="withdraw-reason" className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NOT_INTERESTED">No longer interested</SelectItem>
                        <SelectItem value="ACCEPTED_OTHER_OFFER">Accepted another offer</SelectItem>
                        <SelectItem value="OFFER_DECLINED">Declining offer</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="withdraw-note" className="text-xs font-semibold">
                      Optional Note to Recruiter
                    </Label>
                    <Textarea
                      id="withdraw-note"
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Share additional context for the hiring team..."
                      className="text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>This application is closed ({detail.data.status.toLowerCase()}).</span>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedId(null)}
              className="dt-btn text-xs"
            >
              Close
            </Button>
            {detail.data && !WITHDRAW_BLOCKED.has(detail.data.status) ? (
              <Button
                type="button"
                variant="destructive"
                disabled={withdraw.isPending}
                onClick={() => withdraw.mutate(detail.data!.id)}
                className="dt-btn text-xs font-semibold"
              >
                {withdraw.isPending ? "Withdrawing…" : "Withdraw Application"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
