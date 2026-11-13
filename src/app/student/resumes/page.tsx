"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileUp, RefreshCw, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { StudentPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  attachResume,
  deleteResume,
  getFileDownloadUrl,
  getResumeParse,
  setCurrentResume,
  uploadFileToR2,
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
  const fileRef = useRef<HTMLInputElement | null>(null);
  const resumes = useStudentResumes();
  const [parsePreview, setParsePreview] = useState<ResumeParseDetail | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileId = await uploadFileToR2(file, "RESUME");
      return attachResume(fileId);
    },
    onSuccess: () => {
      toast.success("Resume uploaded and queued for parsing");
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
    onError: (err: Error) => {
      toast.error("Resume upload failed", { description: err.message });
    },
  });

  const makeCurrentMutation = useMutation({
    mutationFn: (resumeId: string) => setCurrentResume(resumeId),
    onSuccess: () => {
      toast.success("Current resume updated");
      queryClient.invalidateQueries({ queryKey: ["student", "resumes"] });
    },
    onError: (err: Error) => toast.error((err as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (resumeId: string) => deleteResume(resumeId),
    onSuccess: () => {
      toast.success("Resume deleted");
      queryClient.invalidateQueries({ queryKey: ["student", "resumes"] });
    },
    onError: (err: Error) => toast.error((err as Error).message),
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
    <div className="space-y-6">
      <PortalPageHeader
        title="Resumes"
        description="Upload PDF or DOCX versions (max 5). Your current resume is selected by default when applying."
        action={
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadMutation.mutate(file);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              disabled={uploadMutation.isPending}
              onClick={() => fileRef.current?.click()}
            >
              <FileUp className="mr-1.5 h-4 w-4" />
              {uploadMutation.isPending ? "Uploading…" : "Upload resume"}
            </Button>
          </div>
        }
      />

      {resumes.isLoading ? (
        <div className="h-40 animate-pulse rounded-xl border bg-muted/40" />
      ) : (resumes.data ?? []).length === 0 ? (
        <EmptyState
          title="No resumes uploaded"
          description="Upload a PDF or DOCX resume to unlock one-click applications and automated skill parsing."
          action={
            <Button type="button" onClick={() => fileRef.current?.click()}>
              Upload first resume
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {(resumes.data ?? []).map((resume) => (
            <div
              key={resume.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">
                    v{resume.versionNumber} · {resume.filename}
                  </span>
                  {resume.isCurrent ? (
                    <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
                      Current
                    </span>
                  ) : null}
                  <StatusBadge status={resume.parseStatus} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Uploaded {formatDate(resume.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(resume.fileId)}
                >
                  <Download className="mr-1 h-3.5 w-3.5" /> Download
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inspectParse(resume.id)}
                >
                  <RefreshCw className="mr-1 h-3.5 w-3.5" /> Parse status
                </Button>
                {!resume.isCurrent ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={makeCurrentMutation.isPending}
                      onClick={() => makeCurrentMutation.mutate(resume.id)}
                    >
                      <Star className="mr-1 h-3.5 w-3.5" /> Set current
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(resume.id)}
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

      {parsePreview ? (
        <section className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">Parse inspection ({parsePreview.status})</h2>
            <Button type="button" variant="ghost" size="sm" onClick={() => setParsePreview(null)}>
              Close
            </Button>
          </div>
          {parsePreview.errorCode ? (
            <p className="mt-2 text-xs text-destructive">Error: {parsePreview.errorCode}</p>
          ) : null}
          <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-secondary/40 p-3 text-xs">
            {JSON.stringify(parsePreview.parsedData ?? { status: parsePreview.status }, null, 2)}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
