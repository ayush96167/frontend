"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, RefreshCw, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { StudentPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ResumeUploadZone } from "@/components/shared/resume-upload-zone";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  deleteResume,
  getFileDownloadUrl,
  getResumeParse,
  setCurrentResume,
} from "@/lib/api/endpoints";
import { useStudentResumes } from "@/lib/api/queries";
import type { ResumeParseDetail } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

export default function StudentResumesPage() {
  return (
    <RequireRole roles={["STUDENT"]}>
      {(user) => (
        <StudentPortalShell user={user}>
          <StudentResumesBody />
        </StudentPortalShell>
      )}
    </RequireRole>
  );
}

function StudentResumesBody() {
  const queryClient = useQueryClient();
  const resumes = useStudentResumes();
  const [parsePreview, setParsePreview] = useState<ResumeParseDetail | null>(null);
  const [deleteResumeId, setDeleteResumeId] = useState<string | null>(null);

  const makeCurrentMutation = useMutation({
    mutationFn: (resumeId: string) => setCurrentResume(resumeId),
    onSuccess: () => {
      toast.success("Default resume updated");
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (resumeId: string) => deleteResume(resumeId),
    onSuccess: () => {
      toast.success("Resume deleted");
      setDeleteResumeId(null);
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setDeleteResumeId(null);
    },
  });

  const handleDownload = async (fileId: string) => {
    try {
      const { data } = await getFileDownloadUrl(fileId);
      window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error("Couldn't open resume", { description: (err as Error).message });
    }
  };

  const inspectParse = async (resumeId: string) => {
    try {
      const { data } = await getResumeParse(resumeId);
      setParsePreview(data);
      queryClient.invalidateQueries({ queryKey: ["student", "resumes"] });
    } catch (err) {
      toast.error("Couldn't fetch parse status", { description: (err as Error).message });
    }
  };

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Resume Vault"
        description="Upload PDF or DOCX versions. Your current resume is attached by default when applying."
      />

      {/* Two-Phase Upload Dropzone */}
      <section aria-label="Upload New Resume">
        <ResumeUploadZone
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["student"] });
          }}
        />
      </section>

      {/* Resumes List Table / Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Uploaded Versions ({resumes.data?.length ?? 0})
          </h2>
        </div>

        {resumes.isLoading ? (
          <div className="h-36 animate-pulse rounded-2xl bg-muted/40" />
        ) : (resumes.data ?? []).length === 0 ? (
          <EmptyState
            title="No resumes uploaded yet"
            description="Upload your resume above to complete your profile and start applying to partner companies."
          />
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-1">
            {(resumes.data ?? []).map((r) => (
              <div
                key={r.id}
                className="dt-card flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs transition-shadow sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{r.filename}</p>
                      {r.isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
                          <Star className="size-3 fill-brand" /> Default Resume
                        </span>
                      )}
                      <StatusBadge status={r.parseStatus} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Version #{r.versionNumber} · Uploaded {formatDate(r.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                  {!r.isCurrent && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={makeCurrentMutation.isPending}
                      onClick={() => makeCurrentMutation.mutate(r.id)}
                      className="dt-btn text-xs"
                    >
                      Set as Default
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void inspectParse(r.id)}
                    className="dt-btn text-xs"
                  >
                    <RefreshCw className="mr-1 size-3" /> Parse Status
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleDownload(r.fileId)}
                    className="dt-btn text-xs"
                  >
                    <Download className="mr-1 size-3" /> Download
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteResumeId(r.id)}
                    className="dt-btn text-destructive hover:bg-destructive-soft hover:text-destructive"
                    aria-label={`Delete ${r.filename}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Parse Preview Drawer / Dialog */}
      {parsePreview && (
        <section className="dt-card rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Resume Parser Inspection</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setParsePreview(null)}
              className="text-xs"
            >
              Close
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <StatusBadge status={parsePreview.status} />
            <span className="text-xs text-muted-foreground">
              Parser version: {parsePreview.parserVersion ?? "v1.0"}
            </span>
          </div>
          {parsePreview.errorCode && (
            <p className="mt-2 text-xs text-destructive">Error: {parsePreview.errorCode}</p>
          )}
          <pre className="mt-3 max-h-60 overflow-auto rounded-xl bg-muted/40 p-4 text-xs font-mono text-foreground">
            {JSON.stringify(parsePreview.parsedData ?? {}, null, 2)}
          </pre>
        </section>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteResumeId !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteResumeId(null);
        }}
        title="Delete Resume Version?"
        description="Are you sure you want to remove this resume from your vault? It will no longer be available for new applications. Note: Resumes tied to applications actively under review cannot be deleted."
        confirmLabel="Delete Resume"
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (deleteResumeId) {
            await deleteMutation.mutateAsync(deleteResumeId);
          }
        }}
      />
    </div>
  );
}
