"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadFileToR2, attachResume } from "@/lib/api/endpoints";
import { toast } from "sonner";

export interface ResumeUploadZoneProps {
  onSuccess?: (() => void) | undefined;
  className?: string | undefined;
}

type UploadPhase =
  "idle" | "requesting" | "uploading" | "scanning" | "attaching" | "success" | "error";

export function ResumeUploadZone({ onSuccess, className }: ResumeUploadZoneProps) {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processUpload = async (file: File) => {
    // Validate file size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit. Please upload a smaller PDF or DOCX file.");
      return;
    }

    try {
      setFileName(file.name);
      setErrorMessage(null);
      setPhase("requesting");
      setProgress(15);

      // Phase 1: Initialize upload and PUT directly to Cloudflare R2
      setPhase("uploading");
      setProgress(40);
      const fileId = await uploadFileToR2(file, "RESUME");

      // Phase 2: Attach resume version to student profile
      setPhase("attaching");
      setProgress(85);
      await attachResume(fileId);

      setProgress(100);
      setPhase("success");
      toast.success("Resume uploaded and verified successfully!");
      if (onSuccess) {
        onSuccess();
      }

      // Reset back to idle after brief delay
      setTimeout(() => {
        setPhase("idle");
        setProgress(0);
        setFileName("");
      }, 2500);
    } catch (err: unknown) {
      setPhase("error");
      const msg = err instanceof Error ? err.message : "Failed to upload resume";
      setErrorMessage(msg);
      toast.error("Upload failed", { description: msg });
    }
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      {phase === "idle" ? (
        <IdleDropzoneArea onFileSelected={(file) => void processUpload(file)} />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              {phase === "success" ? (
                <CheckCircle2 className="size-5 text-success" />
              ) : phase === "error" ? (
                <AlertTriangle className="size-5 text-destructive" />
              ) : (
                <Loader2 className="size-5 animate-spin text-brand" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {phase === "requesting" && "Requesting secure storage url..."}
                {phase === "uploading" && "Transferring file to Cloudflare R2 storage..."}
                {phase === "scanning" && "Running antivirus scan..."}
                {phase === "attaching" && "Linking resume to profile..."}
                {phase === "success" && "Uploaded and verified as clean!"}
                {phase === "error" && (errorMessage ?? "An error occurred during upload")}
              </p>
            </div>
            {phase === "error" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setPhase("idle");
                  setProgress(0);
                }}
                className="dt-btn text-xs"
              >
                Try Again
              </Button>
            )}
          </div>

          <Progress value={progress} className="mt-4 h-2 rounded-full" />
        </div>
      )}
    </div>
  );
}

function IdleDropzoneArea({ onFileSelected }: { onFileSelected: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelected(file);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      tabIndex={0}
      role="button"
      aria-label="Upload Resume Dropzone"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-brand focus:ring-offset-2",
        isDragOver
          ? "border-brand bg-brand-soft/30 scale-[1.01]"
          : "border-border hover:border-brand/40 hover:bg-muted/30",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file) {
              onFileSelected(file);
            }
          }
        }}
      />
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-transform duration-200 group-hover:scale-110 group-hover:bg-brand-soft group-hover:text-brand">
        <UploadCloud className="size-6" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">
        Click to upload or drag & drop resume
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        PDF or DOCX (max 10MB) · Direct secure Cloudflare R2 upload with virus check
      </p>
    </div>
  );
}
