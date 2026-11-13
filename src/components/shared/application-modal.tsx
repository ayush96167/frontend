"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { applyToJob } from "@/lib/api/endpoints";
import type { Job, ResumeItem } from "@/lib/api/types";

export function ApplicationModal({
  job,
  resumes,
  open,
  onClose,
}: {
  job: Job;
  resumes: ResumeItem[];
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const defaultResume = resumes.find((r) => r.isCurrent) ?? resumes[0];
  const [resumeId, setResumeId] = useState(defaultResume?.id ?? "");
  const [coverLetter, setCoverLetter] = useState("");

  const activeResumeId = resumeId || defaultResume?.id || "";

  const mutation = useMutation({
    mutationFn: () =>
      applyToJob(job.id, {
        ...(activeResumeId ? { resumeId: activeResumeId } : {}),
        ...(coverLetter.trim() ? { coverLetter: coverLetter.trim() } : {}),
      }),
    onSuccess: () => {
      toast.success("Application submitted", {
        description: `You applied for ${job.title}. Track it in My applications.`,
      });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", job.id] });
      queryClient.invalidateQueries({ queryKey: ["student", "applications"] });
      onClose();
    },
    onError: (error: Error) => {
      toast.error("Couldn't submit application", { description: error.message });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply — {job.title}</DialogTitle>
          <DialogDescription>
            {job.company?.name ?? "Verified HiLabs partner"} · {job.locations.join(", ") || "India"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {resumes.length === 0 ? (
            <div className="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning-foreground">
              You don&apos;t have a resume uploaded yet.{" "}
              <Link href="/student/resumes" className="font-semibold underline">
                Upload a resume
              </Link>{" "}
              before applying.
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Resume version</Label>
              <Select value={activeResumeId} onValueChange={setResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a resume" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      v{resume.versionNumber} · {resume.filename}
                      {resume.isCurrent ? " (current)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="coverLetter">Cover letter (optional)</Label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              placeholder="Why are you a great fit for this role?"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || resumes.length === 0}
          >
            {mutation.isPending ? "Submitting…" : "Submit application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
