"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/shared/site";
import { ApplicationModal } from "@/components/shared/application-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/api/auth";
import { useJob, useStudentResumes, useToggleSaveJob } from "@/lib/api/queries";
import { employmentTypeLabels, formatDate, formatSalary, workModeLabels } from "@/lib/format";

export default function JobDetailRoutePage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;
  const { user, ready } = useAuth();
  const jobQuery = useJob(jobId);
  const resumesQuery = useStudentResumes();
  const toggleSave = useToggleSaveJob();
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to open roles
        </Link>

        {!ready ? (
          <div className="h-64 animate-pulse rounded-xl border bg-muted/40" />
        ) : !user ? (
          <EmptyState
            title="Sign in to view this role"
            description="Sign in with your HiLabs Careers account to inspect job requirements and submit an application."
            action={
              <Link
                href={`/login?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`}
                className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85"
              >
                Sign in
              </Link>
            }
          />
        ) : jobQuery.isLoading ? (
          <div className="h-72 animate-pulse rounded-xl border bg-muted/40" />
        ) : jobQuery.isError || !jobQuery.data ? (
          <EmptyState
            title="Job listing unavailable"
            description={
              (jobQuery.error as Error)?.message ?? "This role may have closed or does not exist."
            }
            action={
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold hover:bg-accent"
              >
                Browse other roles
              </Link>
            }
          />
        ) : (
          (() => {
            const job = jobQuery.data;
            return (
              <div className="space-y-8">
                <section className="rounded-xl border bg-card p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={job.status} />
                        {job.applied ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                          </span>
                        ) : null}
                      </div>
                      <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                        {job.title}
                      </h1>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{job.company?.name ?? "Verified HiLabs partner"}</span>
                        {job.company?.industry ? <span>· {job.company.industry}</span> : null}
                      </p>
                    </div>

                    {user.role === "STUDENT" ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            toggleSave.mutate(
                              { jobId: job.id, save: !job.saved },
                              { onError: (err) => toast.error((err as Error).message) },
                            )
                          }
                          disabled={toggleSave.isPending}
                        >
                          {job.saved ? (
                            <>
                              <BookmarkCheck className="mr-1.5 h-4 w-4 text-brand" /> Saved
                            </>
                          ) : (
                            <>
                              <Bookmark className="mr-1.5 h-4 w-4" /> Save
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setApplyOpen(true)}
                          disabled={Boolean(job.applied) || job.status !== "PUBLISHED"}
                        >
                          {job.applied ? "Already applied" : "Apply now"}
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 grid gap-3 border-t pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{job.locations.join(", ") || "India"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>
                        {employmentTypeLabels[job.employmentType]} · {workModeLabels[job.workMode]}
                      </span>
                    </div>
                    <div className="font-medium">
                      {job.salary?.visible
                        ? formatSalary(
                            job.salary.min,
                            job.salary.max,
                            job.salary.currency ?? "INR",
                            job.salary.period,
                          )
                        : "Compensation undisclosed"}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        {job.applicationDeadline
                          ? `Deadline ${formatDate(job.applicationDeadline)}`
                          : "Open deadline"}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="space-y-6 rounded-xl border bg-card p-6 sm:p-8">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">About the role</h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {job.description}
                    </p>
                  </div>

                  {job.responsibilities ? (
                    <div>
                      <h2 className="text-lg font-bold tracking-tight">Responsibilities</h2>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {job.responsibilities}
                      </p>
                    </div>
                  ) : null}

                  {job.qualifications ? (
                    <div>
                      <h2 className="text-lg font-bold tracking-tight">Qualifications</h2>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {job.qualifications}
                      </p>
                    </div>
                  ) : null}

                  {job.benefits ? (
                    <div>
                      <h2 className="text-lg font-bold tracking-tight">Benefits</h2>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {job.benefits}
                      </p>
                    </div>
                  ) : null}

                  {job.skills.length > 0 ? (
                    <div>
                      <h2 className="text-lg font-bold tracking-tight">
                        Required & preferred skills
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill.skillId}
                            className={
                              skill.mandatory
                                ? "rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand"
                                : "rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                            }
                          >
                            {skill.name}
                            {skill.mandatory ? " · required" : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {job.company?.website ? (
                    <div className="border-t pt-4 text-sm">
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
                      >
                        <Globe className="h-4 w-4" /> Visit employer website
                      </a>
                    </div>
                  ) : null}
                </section>

                {user.role === "STUDENT" ? (
                  <ApplicationModal
                    job={job}
                    resumes={resumesQuery.data ?? []}
                    open={applyOpen}
                    onClose={() => setApplyOpen(false)}
                  />
                ) : null}
              </div>
            );
          })()
        )}
      </div>
    </SiteLayout>
  );
}
