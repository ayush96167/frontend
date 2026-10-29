import { useState } from "react";
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
import { applyToJob, type JobInput } from "@/lib/mock/api";
import { STUDENT_ID } from "@/lib/mock/api";
import type { Job, Resume, StudentProfile } from "@/lib/mock/types";

export function ApplicationModal({
  job,
  company,
  resumes,
  profile,
  open,
  onClose,
}: {
  job: Job;
  company?: Company;
  resumes: Resume[];
  profile: StudentProfile;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const defaultResume = resumes.find((r) => r.isDefault) ?? resumes[0];
  const [resumeId, setResumeId] = useState(defaultResume?.id ?? "");
  const [coverLetter, setCoverLetter] = useState("");

  const mutation = useMutation({
    mutationFn: (input: JobInput extends never ? never : Parameters<typeof applyToJob>[0]) =>
      applyToJob(input),
    onSuccess: () => {
      toast.success("Application submitted", {
        description: `You applied for ${job.title}. Track it in My applications.`,
      });
      queryClient.invalidateQueries();
      onClose();
    },
    onError: (error: Error) => {
      toast.error("Couldn't submit application", { description: error.message });
    },
  });

  const submit = () => {
    if (!resumeId) {
      toast.error("Add a resume first", { description: "Upload a resume in your portal, then apply." });
      return;
    }
    mutation.mutate({
      jobId: job.id,
      studentId: STUDENT_ID,
      studentName: `${profile.firstName} ${profile.lastName}`,
      studentEmail: "student@demo.com",
      resumeId,
      coverLetter: coverLetter.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply — {job.title}</DialogTitle>
          <DialogDescription>
            {company ? company.name : "HiLabs partner"} · {job.location}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {resumes.length === 0 ? (
            <p className="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning-foreground">
              You don't have a resume yet. Upload one in Resumes before applying.
            </p>
          ) : (
            <div className="space-y-1.5">
              <Label>Resume</Label>
              <Select value={resumeId} onValueChange={setResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a resume" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      v{resume.version} · {resume.fileName}
                      {resume.isDefault ? " (default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Cover letter</Label>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              placeholder="Why are you a great fit for this role?"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={mutation.isPending || resumes.length === 0}>
            {mutation.isPending ? "Submitting…" : "Submit application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
