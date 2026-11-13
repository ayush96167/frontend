"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { StudentPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
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

  return (
    <div>
      <PortalPageHeader
        title="My applications"
        description="Track interview stages, recruiter notes shared with you, and withdrawals."
      />

      {applications.isLoading ? (
        <div className="h-48 animate-pulse rounded-xl border bg-muted/40" />
      ) : (applications.data ?? []).length === 0 ? (
        <EmptyState
          title="No applications submitted yet"
          description="Apply to an open role and track its stage progression in real time."
          action={
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85"
            >
              Browse jobs
            </Link>
          }
        />
      ) : (
        <div
          tabIndex={0}
          role="region"
          aria-label="Student applications table"
          className="overflow-x-auto rounded-xl border bg-card"
        >
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Role
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Company
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Applied
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(applications.data ?? []).map((app) => (
                <tr key={app.id} className="hover:bg-accent/40">
                  <th scope="row" className="px-4 py-3 font-semibold">
                    <Link href={`/jobs/${app.job.id}`} className="hover:underline">
                      {app.job.title}
                    </Link>
                  </th>
                  <td className="px-4 py-3 text-muted-foreground">{app.job.companyName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(app.appliedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedId(app.id)}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={Boolean(selectedId)}
        onOpenChange={(open) => (open ? undefined : setSelectedId(null))}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail.data?.job.title ?? "Application details"}</DialogTitle>
            <DialogDescription>{detail.data?.job.companyName}</DialogDescription>
          </DialogHeader>

          {detail.isLoading ? (
            <div className="h-32 animate-pulse rounded-lg bg-muted/40" />
          ) : detail.data ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current stage</span>
                <StatusBadge status={detail.data.status} />
              </div>
              {detail.data.messageToCandidate ? (
                <div className="rounded-md bg-brand-soft p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                    Message from employer
                  </p>
                  <p className="mt-1 whitespace-pre-line">{detail.data.messageToCandidate}</p>
                </div>
              ) : null}
              {detail.data.coverLetter ? (
                <div>
                  <p className="font-semibold">Cover letter</p>
                  <p className="mt-1 whitespace-pre-line text-muted-foreground">
                    {detail.data.coverLetter}
                  </p>
                </div>
              ) : null}

              {!WITHDRAW_BLOCKED.has(detail.data.status) ? (
                <div className="space-y-3 border-t pt-4">
                  <p className="font-semibold">Withdraw application</p>
                  <div className="space-y-1.5">
                    <Label>Reason</Label>
                    <Select value={reason} onValueChange={(v) => setReason(v as typeof reason)}>
                      <SelectTrigger>
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
                    <Label htmlFor="withdraw-note">Optional note</Label>
                    <Textarea
                      id="withdraw-note"
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedId(null)}>
              Close
            </Button>
            {detail.data && !WITHDRAW_BLOCKED.has(detail.data.status) ? (
              <Button
                type="button"
                variant="destructive"
                disabled={withdraw.isPending}
                onClick={() => withdraw.mutate(detail.data!.id)}
              >
                {withdraw.isPending ? "Withdrawing…" : "Withdraw application"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
