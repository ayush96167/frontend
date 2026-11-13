import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { StudentCompletion } from "@/lib/api/types";

export interface ProfileCompletenessWidgetProps {
  completion: StudentCompletion | null | undefined;
  isLoading?: boolean | undefined;
  className?: string | undefined;
}

const sectionLabels: Record<string, { title: string; route: string; tab?: string }> = {
  personal: { title: "Personal Details", route: "/student/profile", tab: "basics" },
  education: { title: "Education History", route: "/student/profile", tab: "background" },
  experience: { title: "Work Experience", route: "/student/profile", tab: "background" },
  projects: { title: "Technical Projects", route: "/student/profile", tab: "background" },
  skills: { title: "Skills (Min. 5)", route: "/student/profile", tab: "skills" },
  resume: { title: "Verified Clean Resume", route: "/student/resumes" },
  photo: { title: "Profile Photo", route: "/student/profile", tab: "basics" },
};

export function ProfileCompletenessWidget({
  completion,
  isLoading = false,
  className,
}: ProfileCompletenessWidgetProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-6 shadow-xs animate-pulse",
          className,
        )}
      >
        <div className="h-6 w-48 rounded bg-muted/60" />
        <div className="mt-4 h-3 w-full rounded bg-muted/40" />
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="h-14 rounded-lg bg-muted/30" />
          <div className="h-14 rounded-lg bg-muted/30" />
        </div>
      </div>
    );
  }

  const pct = completion?.percentage ?? 0;
  const label = completion?.label ?? "INCOMPLETE";
  const thresholds = completion?.thresholds ?? { apply: 50, talentSearch: 80 };

  // Status Tier Styling
  const tierConfig: Record<string, { badge: string; badgeClass: string; desc: string }> = {
    COMPLETE: {
      badge: "Profile Complete",
      badgeClass: "bg-success-soft text-success border-success/30",
      desc: "Maximum visibility unlocked with Profile Complete badge.",
    },
    PLACEMENT_READY: {
      badge: "Placement Ready",
      badgeClass: "bg-brand-soft text-brand border-brand/30",
      desc: "Visible in Recruiter Talent Search & Eligible to apply to all roles.",
    },
    READY_TO_APPLY: {
      badge: "Ready to Apply",
      badgeClass:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
      desc: "Eligible to apply to published roles. Reach 80% to be discovered by recruiters.",
    },
    INCOMPLETE: {
      badge: "Incomplete (<50%)",
      badgeClass:
        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
      desc: "Job applications locked until your profile reaches 50% completeness.",
    },
  };

  const currentTier = tierConfig[label] ?? tierConfig["INCOMPLETE"]!;
  const sections = completion?.sections ?? [];

  return (
    <section
      aria-label="Profile Completion Status"
      className={cn(
        "dt-card rounded-2xl border border-border bg-card p-6 shadow-xs transition-shadow duration-200",
        className,
      )}
    >
      {/* Header & Badging */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold tracking-tight text-foreground">Profile Readiness</h2>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
                currentTier.badgeClass,
              )}
            >
              {pct === 100 && <Sparkles className="size-3" />}
              {currentTier.badge}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{currentTier.desc}</p>
        </div>

        {/* Big percentage & Radial indicator visual */}
        <div className="flex items-baseline gap-1.5 self-start sm:self-auto">
          <span className="text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
            {pct}%
          </span>
          <span className="text-xs font-medium text-muted-foreground">/ 100%</span>
        </div>
      </div>

      {/* Progress Bar with Tier Markers */}
      <div className="relative mt-5">
        <Progress
          value={pct}
          className="h-2.5 rounded-full bg-muted/60"
          aria-label={`Profile completion: ${pct}%`}
        />
        {/* Tier milestone indicator tags */}
        <div className="mt-2 flex justify-between text-[11px] font-medium text-muted-foreground">
          <span>0%</span>
          <span className={cn(pct >= thresholds.apply ? "font-bold text-foreground" : "")}>
            50% (Apply)
          </span>
          <span className={cn(pct >= thresholds.talentSearch ? "font-bold text-brand" : "")}>
            80% (Talent Search)
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* Actionable Sections Checklist */}
      {sections.length > 0 && (
        <div className="mt-6 border-t border-border/70 pt-5">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Weighted Checklist
            </span>
            <Link
              href="/student/profile"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              Update Profile <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((sec) => {
              const meta = sectionLabels[sec.key] ?? { title: sec.key, route: "/student/profile" };
              const isDone = sec.complete ?? (sec.earned ?? 0) > 0;
              const linkUrl = meta.tab ? `${meta.route}?tab=${meta.tab}` : meta.route;

              return (
                <Link
                  key={sec.key}
                  href={linkUrl}
                  className={cn(
                    "group flex items-start gap-2.5 rounded-xl border p-3 text-xs transition-colors duration-150",
                    isDone
                      ? "border-border/60 bg-muted/20 hover:bg-muted/40"
                      : "border-border bg-card hover:border-brand/40 hover:bg-brand-soft/20",
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/60 group-hover:text-brand" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={cn(
                          "truncate font-medium",
                          isDone
                            ? "text-foreground line-through opacity-80"
                            : "text-foreground font-semibold",
                        )}
                      >
                        {meta.title}
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums font-semibold text-muted-foreground">
                        {sec.earned ?? 0}/{sec.max ?? 0}%
                      </span>
                    </div>
                    {sec.via === "FRESHER" && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Granted via Fresher status
                      </p>
                    )}
                    {sec.missing && sec.missing.length > 0 && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
                        <AlertCircle className="size-3 shrink-0" />
                        <span className="truncate">{sec.missing[0]}</span>
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
