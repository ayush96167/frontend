"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  label: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

const STEPS: WorkflowStep[] = [
  {
    id: "profile",
    label: "01 · Profile & Allowlist",
    title: "Verify Once with Your Cohort Email",
    description:
      "Claim your allowlisted student profile, confirm your batch and skills, and keep one parsed PDF resume ready to reuse.",
    ctaLabel: "Create Student Account",
    ctaHref: "/register/student",
  },
  {
    id: "apply",
    label: "02 · Verified Listings",
    title: "Apply Without Repeating Forms",
    description:
      "Review roles from domain-verified companies with upfront compensation and submit your saved resume in one click.",
    ctaLabel: "Browse Open Roles",
    ctaHref: "/jobs",
  },
  {
    id: "track",
    label: "03 · Hiring Pipeline",
    title: "Follow Every Stage in One Timeline",
    description:
      "Track movement from Applied through Shortlisted, Interview, and Offered with instant portal and email updates.",
    ctaLabel: "Open My Applications",
    ctaHref: "/student/applications",
  },
];

function subscribeUrlState(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener("hilabs:urlstate", cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener("hilabs:urlstate", cb);
  };
}

function getUrlStepIndexSnapshot(): number | null {
  const stepParam = new URLSearchParams(window.location.search).get("step");
  if (!stepParam) return null;
  const idx = STEPS.findIndex((s) => s.id === stepParam);
  return idx >= 0 ? idx : null;
}

function setUrlStepParam(stepId: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("step", stepId);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  window.dispatchEvent(new Event("hilabs:urlstate"));
}

function subscribeViewport(cb: () => void) {
  const mqlWide = window.matchMedia("(min-width: 1024px)");
  const mqlTall = window.matchMedia("(min-height: 640px)");
  const mqlMotion = window.matchMedia("(prefers-reduced-motion: no-preference)");
  mqlWide.addEventListener("change", cb);
  mqlTall.addEventListener("change", cb);
  mqlMotion.addEventListener("change", cb);
  return () => {
    mqlWide.removeEventListener("change", cb);
    mqlTall.removeEventListener("change", cb);
    mqlMotion.removeEventListener("change", cb);
  };
}

function getCanPinSnapshot(): boolean {
  return (
    window.matchMedia("(min-width: 1024px)").matches &&
    window.matchMedia("(min-height: 640px)").matches &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches
  );
}

function StepScreen({ stepIndex }: { stepIndex: number }) {
  if (stepIndex === 0) {
    return (
      <div className="w-full rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b pb-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                <span translate="no">Aarav Mehta</span> · B.Tech CS ’26
              </p>
              <p translate="no" className="truncate font-mono text-xs text-muted-foreground">
                aarav.mehta@hilabs-cohort.edu
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success tabular-nums">
            92% Ready
          </span>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-lg border bg-secondary/40 p-3.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Active resume</span>
              <span className="font-mono font-medium text-brand">Parsed</span>
            </div>
            <div className="mt-2 flex min-w-0 items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <span translate="no" className="truncate">
                aarav_mehta_systems_v3.pdf
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Verified skill tags</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["TypeScript", "Next.js", "PostgreSQL", "Distributed Systems"].map((skill) => (
                <span
                  key={skill}
                  translate="no"
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stepIndex === 1) {
    return (
      <div className="w-full rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-start justify-between gap-3 border-b pb-4">
          <div className="min-w-0">
            <p className="font-mono text-xs font-medium text-brand">
              Domain verified · <span translate="no">finstack.in</span>
            </p>
            <p className="mt-1 break-words text-base font-semibold">
              Backend Engineer — Payments Core
            </p>
            <p className="truncate text-sm text-muted-foreground">
              <span translate="no">FinStack Systems</span> · Bengaluru · Hybrid
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-brand-soft px-2.5 py-1 font-mono text-xs font-semibold text-brand tabular-nums">
            ₹18–24 LPA
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-brand/25 bg-brand-soft/60 px-3.5 py-2.5 text-sm">
            <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <span className="truncate">Profile &amp; resume attached</span>
            </span>
            <span translate="no" className="shrink-0 font-mono text-xs text-muted-foreground">
              v3.pdf
            </span>
          </div>
          <div className="rounded-lg border px-3.5 py-2.5 text-xs text-muted-foreground">
            Optional recruiter note: Built event-sourced ledger service in{" "}
            <span translate="no">Spring</span> &amp; <span translate="no">Postgres</span>.
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs text-muted-foreground">
              Eligible cohort · <span className="tabular-nums">2026</span> graduates
            </span>
            <span className="inline-flex h-9 shrink-0 items-center rounded-md bg-foreground px-4 text-xs font-semibold text-background">
              Submit Application
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b pb-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Application Timeline</p>
          <p className="truncate text-xs text-muted-foreground">
            Backend Engineer · <span translate="no">FinStack Systems</span>
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
          <Sparkles className="h-3 w-3" aria-hidden="true" /> Interview
        </span>
      </div>

      <ol className="mt-5 space-y-3">
        {[
          { stage: "Applied", time: "Oct 12 · Resume snapshot locked", done: true },
          { stage: "Shortlisted", time: "Oct 15 · Reviewed by FinStack HR", done: true },
          {
            stage: "Technical Interview",
            time: "Oct 18 · Slot confirmed via portal",
            done: true,
            current: true,
          },
          { stage: "Offered", time: "Pending final debrief", done: false },
        ].map((item) => (
          <li key={item.stage} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                item.current
                  ? "bg-brand ring-4 ring-brand/15"
                  : item.done
                    ? "bg-foreground"
                    : "border border-muted-foreground/40 bg-transparent",
              )}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  item.done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.stage}
              </p>
              <p className="font-mono text-xs text-muted-foreground tabular-nums">{item.time}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PinnedWorkflowMoment() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const urlStepIndex = useSyncExternalStore(subscribeUrlState, getUrlStepIndexSnapshot, () => null);
  const activeIndex = urlStepIndex ?? scrollIndex;

  const canPin = useSyncExternalStore(subscribeViewport, getCanPinSnapshot, () => false);

  useEffect(() => {
    if (!canPin || urlStepIndex !== null) return;

    const updateProgress = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollSpan = Math.max(1, el.offsetHeight - window.innerHeight);
      const passed = Math.min(scrollSpan, Math.max(0, -rect.top));
      const progress = passed / scrollSpan;
      const nextIdx = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
      setScrollIndex(nextIdx);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [canPin, urlStepIndex]);

  return (
    <section
      ref={sectionRef}
      id="workflow"
      data-moment="pinned-chapters"
      className={cn(
        "border-y bg-secondary/30 text-foreground",
        canPin ? "pc-live lg:h-[200svh]" : "py-16 sm:py-24",
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-6xl px-4 sm:px-6",
          canPin
            ? "lg:sticky lg:top-[4.5rem] lg:flex lg:h-[calc(100svh-4.5rem)] lg:items-center"
            : "",
        )}
      >
        <div className="w-full">
          <div className="max-w-2xl">
            <h2 className="heading-underline text-2xl font-bold tracking-tight sm:text-3xl">
              How <span translate="no">HiLabs Careers</span> Works
            </h2>
          </div>

          {canPin ? (
            <div className="mt-10 grid items-center gap-10 lg:grid-cols-12">
              <ol className="space-y-4 lg:col-span-5">
                {STEPS.map((step, idx) => {
                  const isActive = idx === activeIndex;
                  const panelId = `workflow-step-${step.id}`;
                  return (
                    <li
                      key={step.id}
                      data-active={isActive}
                      className={cn(
                        "pc-step border-l-2 pl-5 transition-colors duration-200 motion-reduce:transition-none",
                        isActive ? "border-brand" : "border-border",
                      )}
                    >
                      <button
                        type="button"
                        aria-expanded={isActive}
                        aria-controls={panelId}
                        onClick={() => setUrlStepParam(step.id)}
                        className="w-full cursor-pointer py-1.5 text-left hover:text-foreground focus-visible:rounded-sm"
                      >
                        <span className="block font-mono text-xs font-semibold text-brand tabular-nums">
                          {step.label}
                        </span>
                        <span
                          className={cn(
                            "mt-1 block text-lg font-semibold tracking-tight transition-colors motion-reduce:transition-none",
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {step.title}
                        </span>
                      </button>
                      <div id={panelId} className="pc-step-body">
                        <div className="pc-step-inner">
                          <p className="pt-1 pb-2 text-sm leading-relaxed text-muted-foreground">
                            {step.description}
                          </p>
                          <Link
                            href={step.ctaHref}
                            className="dt-link mb-1 inline-flex items-center text-xs font-semibold text-brand"
                          >
                            {step.ctaLabel}
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="lg:col-span-7">
                <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border bg-secondary/60 p-6 sm:p-10">
                  <StepScreen stepIndex={activeIndex} />
                </div>
              </div>
            </div>
          ) : (
            <ol className="mt-10 space-y-8">
              {STEPS.map((step, idx) => (
                <li
                  key={step.id}
                  className="grid gap-6 border-t pt-8 md:grid-cols-12 md:items-center"
                >
                  <div className="md:col-span-5">
                    <span className="font-mono text-xs font-semibold text-brand tabular-nums">
                      {step.label}
                    </span>
                    <h3 className="mt-1.5 text-lg font-bold tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    <Link
                      href={step.ctaHref}
                      className="dt-link mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-brand sm:min-h-0"
                    >
                      {step.ctaLabel}
                    </Link>
                  </div>
                  <div className="md:col-span-7">
                    <div className="rounded-2xl border bg-secondary/60 p-4 sm:p-6">
                      <StepScreen stepIndex={idx} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
