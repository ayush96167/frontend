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
  AlertCircle,
  FileWarning,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/shared/site";
import { ApplicationModal } from "@/components/shared/application-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/api/auth";
import {
  useJob,
  useStudentCompletion,
  useStudentResumes,
  useToggleSaveJob,
} from "@/lib/api/queries";
import { employmentTypeLabels, formatDate, formatSalary, workModeLabels } from "@/lib/format";

export default function JobDetailRoutePage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;
  const { user, ready } = useAuth();
  const jobQuery = useJob(jobId);
  const completionQuery = useStudentCompletion();
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
          <ArrowLeft className="size-4" /> Back to open roles
        </Link>

        {!ready ? (
          <div className="h-64 animate-pulse rounded-2xl border bg-muted/40" />
        ) : !user ? (
          <EmptyState
            title="Sign in to view this role"
            description="Sign in with your HiLabs Careers account to inspect job requirements and submit an application."
            action={
              <Link
                href={`/login?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`}
                className="dt-btn inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85"
              >
                Sign in
              </Link>
            }
          />
        ) : jobQuery.isLoading ? (
          <div className="h-72 animate-pulse rounded-2xl border bg-muted/40" />
        ) : jobQuery.isError || !jobQuery.data ? (
          <EmptyState
            title="Job listing unavailable"
            description={
              (jobQuery.error as Error)?.message ?? "This role may have closed or does not exist."
            }
            action={
              <Link
                href="/jobs"
                className="dt-btn inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-accent"
              >
                Browse other roles
              </Link>
            }
          />
        ) : (
          (() => {
            const job = jobQuery.data;
            const completion = completionQuery.data;
            const resumes = resumesQuery.data ?? [];
            const hasCleanResume = resumes.some((r) => r.isCurrent || resumes.length > 0);
            const score = completion?.percentage ?? 0;
            const applyThreshold = completion?.thresholds.apply ?? 50;
            const isGatedByCompletion = score < applyThreshold;
            const isDeadlinePassed = job.applicationDeadline
              ? new Date(job.applicationDeadline) < new Date()
              : false;

            return (
              <div className="space-y-8">
                {/* Header card with action buttons */}
                <section className="dt-card rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={job.status} />
                        {job.applied ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
                            <CheckCircle2 className="size-3.5" /> Applied
                          </span>
                        ) : null}
                      </div>
                      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                        {job.title}
                      </h1>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="size-4" />
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
                          className="dt-btn"
                        >
                          {job.saved ? (
                            <>
                              <BookmarkCheck className="mr-1.5 size-4 text-brand" /> Saved
                            </>
                          ) : (
                            <>
                              <Bookmark className="mr-1.5 size-4" /> Save
                            </>
                          )}
                        </Button>

                        {/* Apply Button Gated by PRD v4 Invariants */}
                        <Button
                          type="button"
                          onClick={() => setApplyOpen(true)}
                          disabled={
                            Boolean(job.applied) ||
                            job.status !== "PUBLISHED" ||
                            isDeadlinePassed ||
                            isGatedByCompletion ||
                            !hasCleanResume
                          }
                          className="dt-btn font-semibold"
                        >
                          {job.applied
                            ? "Already applied"
                            : isDeadlinePassed
                              ? "Application Closed"
                              : isGatedByCompletion
                                ? `Unlock at ${applyThreshold}% (Current: ${score}%)`
                                : !hasCleanResume
                                  ? "Upload Resume to Apply"
                                  : "Apply now"}
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {/* Gating helper alerts if student cannot apply */}
                  {user.role === "STUDENT" && !job.applied && job.status === "PUBLISHED" && (
                    <div className="mt-4">
                      {isGatedByCompletion ? (
                        <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>
                            Your profile readiness is <strong>{score}%</strong>. Complete your
                            profile to at least <strong>{applyThreshold}%</strong> to submit
                            applications.{" "}
                            <Link href="/student/profile" className="font-semibold underline">
                              Complete profile now
                            </Link>
                          </span>
                        </div>
                      ) : !hasCleanResume ? (
                        <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-900 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800">
                          <FileWarning className="size-4 shrink-0" />
                          <span>
                            You need an active resume version in your vault to apply.{" "}
                            <Link href="/student/resumes" className="font-semibold underline">
                              Upload resume in Resume Vault
                            </Link>
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className="mt-6 grid gap-3 border-t border-border/70 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="size-4 shrink-0" />
                      <span>{job.locations.join(", ") || "India"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="size-4 shrink-0" />
                      <span>
                        {employmentTypeLabels[job.employmentType]} · {workModeLabels[job.workMode]}
                      </span>
                    </div>
                    <div className="font-medium text-foreground">
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
                      <Calendar className="size-4 shrink-0" />
                      <span>
                        {job.applicationDeadline
                          ? `Deadline ${formatDate(job.applicationDeadline)}`
                          : "Open deadline"}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Job Description & Details */}
                <section className="dt-card space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      About the role
                    </h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {job.description}
                    </p>
                  </div>

                  {job.responsibilities ? (
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-foreground">
                        Responsibilities
                      </h2>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {job.responsibilities}
                      </p>
                    </div>
                  ) : null}

                  {job.qualifications ? (
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-foreground">
                        Qualifications
                      </h2>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {job.qualifications}
                      </p>
                    </div>
                  ) : null}

                  {job.benefits ? (
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-foreground">Benefits</h2>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {job.benefits}
                      </p>
                    </div>
                  ) : null}

                  {job.skills.length > 0 ? (
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-foreground">
                        Required & Preferred Skills
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
                    <div className="border-t border-border/70 pt-4 text-sm">
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
                      >
                        <Globe className="size-4" /> Visit employer website
                      </a>
                    </div>
                  ) : null}
                </section>

                {/* Application Modal */}
                {user.role === "STUDENT" ? (
                  <ApplicationModal
                    job={job}
                    resumes={resumes}
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
