import { Link } from "@tanstack/react-router";
import { MapPin, Users, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import type { Company, Job } from "@/lib/mock/types";
import {
  employmentTypeLabels,
  formatSalary,
  timeAgo,
  workModeLabels,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export function JobCard({
  job,
  company,
  saved,
  onToggleSave,
  showApplicants = false,
}: {
  job: Job;
  company?: Company;
  saved?: boolean;
  onToggleSave?: (job: Job) => void;
  showApplicants?: boolean;
}) {
  return (
    <article className="group relative rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-soft text-sm font-bold text-brand">
            {company?.logoText ?? "HC"}
          </div>
          <div>
            <Link
              to="/jobs/$jobId"
              params={{ jobId: job.id }}
              className="text-base font-semibold tracking-tight underline-offset-4 group-hover:underline"
            >
              {job.title}
            </Link>
            <p className="text-sm text-muted-foreground">{company?.name ?? "HiLabs partner"}</p>
          </div>
        </div>
        {onToggleSave ? (
          <button
            onClick={() => onToggleSave(job)}
            aria-label={saved ? "Remove from saved jobs" : "Save job"}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {saved ? (
              <BookmarkCheck className="h-4.5 w-4.5 text-brand" />
            ) : (
              <Bookmark className="h-4.5 w-4.5" />
            )}
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {employmentTypeLabels[job.employmentType]} ·{" "}
          {workModeLabels[job.workMode]}
        </span>
        <span className="font-medium text-foreground">{formatSalary(job.minSalary, job.maxSalary, job.currency)}</span>
        {showApplicants ? (
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {job.applicantCount} applicants
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className={cn("mt-4 flex items-center justify-between text-xs text-muted-foreground")}>
        <span>Posted {timeAgo(job.createdAt)}</span>
        <span>Apply by {new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
      </div>
    </article>
  );
}
