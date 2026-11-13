"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { CompanyPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  addApplicationNote,
  getFileDownloadUrl,
  listApplicationNotes,
  transitionCompanyApplication,
} from "@/lib/api/endpoints";
import { useCompanyApplication, useCompanyApplications } from "@/lib/api/queries";
import { formatDate } from "@/lib/format";

export default function CompanyApplicationsPage() {
  const { companyId } = useParams<{ companyId: string }>();

  return (
    <RequireRole roles={["COMPANY_USER"]} companyId={companyId}>
      {(user) => (
        <CompanyPortalShell user={user} companyId={companyId}>
          <CompanyApplicationsBody companyId={companyId} />
        </CompanyPortalShell>
      )}
    </RequireRole>
  );
}

type TargetStage = "UNDER_REVIEW" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "HIRED" | "REJECTED";
type RejectReason =
  | "SKILLS_MISMATCH"
  | "EXPERIENCE_MISMATCH"
  | "POSITION_FILLED"
  | "INTERVIEW_NOT_CLEARED"
  | "NO_SHOW"
  | "OTHER";

function CompanyApplicationsBody({ companyId }: { companyId: string }) {
  const [queryText, setQueryText] = useState("");
  const [qualificationFilter, setQualificationFilter] = useState<string>("ALL");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const applications = useCompanyApplications(companyId, {
    ...(queryText.trim() ? { query: queryText.trim() } : {}),
    ...(qualificationFilter !== "ALL"
      ? { qualification: qualificationFilter as "QUALIFIED" | "NOT_QUALIFIED" }
      : {}),
  });

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Applicants"
        description="Screen candidate qualification checks, review resumes, add recruiter notes, and update pipeline stages."
      />

      <search>
        <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label htmlFor="app-search" className="mb-1 block text-xs">
              Search candidate or job title
            </Label>
            <Input
              id="app-search"
              type="search"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Candidate name or job title…"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Qualification</Label>
            <Select value={qualificationFilter} onValueChange={setQualificationFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All candidates</SelectItem>
                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                <SelectItem value="NOT_QUALIFIED">Not qualified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </search>

      {applications.isLoading ? (
        <div className="h-44 animate-pulse rounded-xl border bg-muted/40" />
      ) : (applications.data ?? []).length === 0 ? (
        <EmptyState
          title="No matching applicants"
          description="Try clearing your search or check back as students apply to your published listings."
        />
      ) : (
        <div
          tabIndex={0}
          role="region"
          aria-label="Company applicants table"
          className="overflow-x-auto rounded-xl border bg-card"
        >
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Candidate
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Role
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Fit
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Stage
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Applied
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Review
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(applications.data ?? []).map((app) => (
                <tr key={app.id} className="hover:bg-accent/40">
                  <th scope="row" className="px-4 py-3">
                    <p className="font-semibold">{app.student.name}</p>
                    {app.student.headline ? (
                      <p className="text-xs font-normal text-muted-foreground">
                        {app.student.headline}
                      </p>
                    ) : null}
                  </th>
                  <td className="px-4 py-3 text-muted-foreground">{app.jobTitle}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.qualification.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.stage} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(app.appliedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedAppId(app.id)}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedAppId ? (
        <ApplicationReviewDialog
          companyId={companyId}
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
        />
      ) : null}
    </div>
  );
}

function ApplicationReviewDialog({
  companyId,
  applicationId,
  onClose,
}: {
  companyId: string;
  applicationId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const detailQuery = useCompanyApplication(companyId, applicationId);
  const notesQuery = useQuery({
    queryKey: ["company", companyId, "application", applicationId, "notes"],
    queryFn: async () => (await listApplicationNotes(companyId, applicationId)).data,
  });

  const [nextStage, setNextStage] = useState<TargetStage>("SHORTLISTED");
  const [reasonCode, setReasonCode] = useState<RejectReason>("SKILLS_MISMATCH");
  const [messageToCandidate, setMessageToCandidate] = useState("");
  const [noteBody, setNoteBody] = useState("");

  const transitionMutation = useMutation({
    mutationFn: () => {
      const etag = detailQuery.data?.etag ?? "";
      return transitionCompanyApplication(
        companyId,
        applicationId,
        {
          toStage: nextStage,
          ...(nextStage === "REJECTED" ? { reasonCode } : {}),
          ...(messageToCandidate.trim() ? { messageToCandidate: messageToCandidate.trim() } : {}),
          notify: true,
        },
        etag,
      );
    },
    onSuccess: () => {
      toast.success("Application stage updated");
      queryClient.invalidateQueries({ queryKey: ["company", companyId, "applications"] });
      queryClient.invalidateQueries({
        queryKey: ["company", companyId, "application", applicationId],
      });
      setMessageToCandidate("");
    },
    onError: (err: Error) => toast.error("Stage update failed", { description: err.message }),
  });

  const addNoteMutation = useMutation({
    mutationFn: () => addApplicationNote(companyId, applicationId, noteBody.trim()),
    onSuccess: () => {
      toast.success("Note added");
      setNoteBody("");
      queryClient.invalidateQueries({
        queryKey: ["company", companyId, "application", applicationId, "notes"],
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const downloadResume = async (fileId: string) => {
    try {
      const { data } = await getFileDownloadUrl(fileId);
      window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const detail = detailQuery.data?.data;

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{detail?.jobTitle ?? "Applicant review"}</DialogTitle>
          <DialogDescription>{detail?.companyName}</DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading || !detail ? (
          <div className="h-44 animate-pulse rounded-lg bg-muted/40" />
        ) : (
          <div className="space-y-6 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary/40 p-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={detail.stage} />
                <StatusBadge status={detail.qualification.status} />
              </div>
              {detail.resume ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => downloadResume(detail.resume!.fileId)}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> {detail.resume.filename}
                </Button>
              ) : null}
            </div>

            {detail.contactVisible && detail.contact ? (
              <div className="rounded-lg border p-3 text-xs text-muted-foreground">
                Contact: {detail.contact.email ?? "No email"} · {detail.contact.phone ?? "No phone"}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Contact details unlock once a candidate is shortlisted or further in the pipeline.
              </p>
            )}

            {detail.coverLetter ? (
              <div>
                <p className="font-semibold">Cover letter</p>
                <p className="mt-1 whitespace-pre-line text-muted-foreground">
                  {detail.coverLetter}
                </p>
              </div>
            ) : null}

            <div className="space-y-3 rounded-lg border p-4">
              <p className="font-semibold">Advance or reject stage</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1 block text-xs">Target stage</Label>
                  <Select value={nextStage} onValueChange={(v) => setNextStage(v as TargetStage)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
                      <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                      <SelectItem value="INTERVIEW">Interview</SelectItem>
                      <SelectItem value="OFFERED">Offered</SelectItem>
                      <SelectItem value="HIRED">Hired</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {nextStage === "REJECTED" ? (
                  <div>
                    <Label className="mb-1 block text-xs">Rejection reason</Label>
                    <Select
                      value={reasonCode}
                      onValueChange={(v) => setReasonCode(v as RejectReason)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SKILLS_MISMATCH">Skills mismatch</SelectItem>
                        <SelectItem value="EXPERIENCE_MISMATCH">Experience mismatch</SelectItem>
                        <SelectItem value="POSITION_FILLED">Position filled</SelectItem>
                        <SelectItem value="INTERVIEW_NOT_CLEARED">Interview not cleared</SelectItem>
                        <SelectItem value="NO_SHOW">No show</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
              <Textarea
                rows={2}
                value={messageToCandidate}
                onChange={(e) => setMessageToCandidate(e.target.value)}
                placeholder="Optional message sent to candidate…"
              />
              <Button
                type="button"
                size="sm"
                disabled={transitionMutation.isPending}
                onClick={() => transitionMutation.mutate()}
              >
                {transitionMutation.isPending ? "Updating…" : "Apply stage update"}
              </Button>
            </div>

            <div className="space-y-3 border-t pt-4">
              <p className="font-semibold">Internal team notes</p>
              {(notesQuery.data ?? []).map((n) => (
                <div key={n.id} className="rounded-lg border px-3 py-2 text-xs">
                  <p>{n.body}</p>
                  <p className="mt-1 text-muted-foreground">
                    {n.createdBy.name ?? "Recruiter"} · {formatDate(n.createdAt)}
                  </p>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Add internal review note…"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!noteBody.trim() || addNoteMutation.isPending}
                  onClick={() => addNoteMutation.mutate()}
                >
                  Save note
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
