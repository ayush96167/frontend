"use client";

import Link from "next/link";
import { MapPin, Clock, Bookmark, BookmarkCheck, CheckCircle2 } from "lucide-react";
import type { Job } from "@/lib/api/types";
import {
  employmentTypeLabels,
  formatDate,
  formatSalary,
  timeAgo,
  workModeLabels,
} from "@/lib/format";
import { cn } from "@/lib/utils";

function companyMonogram(name?: string): string {
  if (!name) return "HC";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function JobCard({
  job,
  saved,
  onToggleSave,
}: {
  job: Job;
  saved?: boolean;
  onToggleSave?: (job: Job) => void;
}) {
  const isSaved = saved ?? job.saved ?? false;
  const locationText =
    job.locations.length > 0 ? job.locations.join(", ") : (job.company?.location ?? "India");

  return (
    <article className="dt-card group relative rounded-xl border bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            translate="no"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-soft text-sm font-medium text-brand"
          >
            {companyMonogram(job.company?.name)}
          </div>
          <div className="min-w-0">
            <Link
              href={`/jobs/${job.id}`}
              className="block break-words text-base font-medium tracking-[-0.01em] text-foreground underline-offset-4 group-hover:underline"
            >
              {job.title}
            </Link>
            <p translate="no" className="truncate text-sm text-muted-foreground">
              {job.company?.name ?? "Verified HiLabs partner"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {job.applied ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Applied
            </span>
          ) : null}
          {onToggleSave ? (
            <button
              type="button"
              onClick={() => onToggleSave(job)}
              aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
              aria-pressed={isSaved}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {isSaved ? (
                <BookmarkCheck className="h-4.5 w-4.5 text-brand" aria-hidden="true" />
              ) : (
                <Bookmark className="h-4.5 w-4.5" aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {locationText}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />{" "}
          {employmentTypeLabels[job.employmentType]} · {workModeLabels[job.workMode]}
        </span>
        <span className="font-medium text-foreground tabular-nums">
          {job.salary?.visible
            ? formatSalary(
                job.salary.min,
                job.salary.max,
                job.salary.currency ?? "INR",
                job.salary.period,
              )
            : "Compensation undisclosed"}
        </span>
      </div>

      {job.skills.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((skill) => (
            <span
              key={skill.skillId}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {skill.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className={cn("mt-4 flex items-center justify-between text-xs text-muted-foreground")}>
        <span>Posted {timeAgo(job.publishedAt ?? job.createdAt)}</span>
        {job.applicationDeadline ? (
          <span>Apply by {formatDate(job.applicationDeadline)}</span>
        ) : (
          <span>Open deadline</span>
        )}
      </div>
    </article>
  );
}
