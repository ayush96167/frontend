"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, FileText, MapPin, Search, ShieldCheck } from "lucide-react";
import { JobCard } from "@/components/shared/job-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { homeForRole, useAuth } from "@/lib/api/auth";
import { usePublishedJobs } from "@/lib/api/queries";
import { cn } from "@/lib/utils";

const PREVIEW_TABS = [
  { id: "roles", label: "Open Roles" },
  { id: "apply", label: "One-Click Apply" },
  { id: "tracker", label: "Stage Tracker" },
] as const;

type PreviewTabId = (typeof PREVIEW_TABS)[number]["id"];

const QUICK_FILTERS = [
  { label: "Internships", query: "Intern" },
  { label: "Full-Time", query: "Engineer" },
  { label: "Remote", query: "Remote" },
  { label: "Next.js", query: "Next.js" },
  { label: "Data & SQL", query: "SQL" },
] as const;

const SAMPLE_ROLES = [
  {
    id: "sample-1",
    monogram: "KA",
    title: "Frontend Engineer — Next.js",
    company: "Kestrel Analytics",
    location: "Bengaluru · Hybrid",
    compensation: "₹14–18 LPA",
    type: "Full-time",
    skills: ["TypeScript", "Next.js", "Tailwind CSS"],
    deadline: "Nov 28",
    searchQuery: "Frontend",
  },
  {
    id: "sample-2",
    monogram: "VS",
    title: "Systems Software Intern",
    company: "Verge Systems",
    location: "Hyderabad · Onsite",
    compensation: "₹55k / month",
    type: "Internship",
    skills: ["Go", "PostgreSQL", "Linux"],
    deadline: "Dec 04",
    searchQuery: "Intern",
  },
  {
    id: "sample-3",
    monogram: "NP",
    title: "Product Data Analyst",
    company: "Northstar Pay",
    location: "Remote · India",
    compensation: "₹11–14 LPA",
    type: "Full-time",
    skills: ["SQL", "Python", "dbt"],
    deadline: "Dec 10",
    searchQuery: "Analyst",
  },
] as const;

function DrawnArrow() {
  return (
    <svg className="dt-arrow" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M1.5 6h8.5" />
      <path d="M6 2.5 9.5 6 6 9.5" />
    </svg>
  );
}

function subscribeUrlState(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener("hilabs:urlstate", cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener("hilabs:urlstate", cb);
  };
}

function getPreviewTabSnapshot(): PreviewTabId {
  const param = new URLSearchParams(window.location.search).get("preview");
  return PREVIEW_TABS.some((t) => t.id === param) ? (param as PreviewTabId) : "roles";
}

function setUrlPreviewTab(tabId: PreviewTabId) {
  const url = new URL(window.location.href);
  if (tabId === "roles") url.searchParams.delete("preview");
  else url.searchParams.set("preview", tabId);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  window.dispatchEvent(new Event("hilabs:urlstate"));
}

export function HeroSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <div
      className="dt-hero-enter mt-8 max-w-xl space-y-3"
      style={{ "--dt-delay": "180ms" } as React.CSSProperties}
    >
      <form
        aria-label="Search open roles"
        className="flex items-center gap-2 rounded-xl border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = query.trim();
          router.push(trimmed ? `/jobs?q=${encodeURIComponent(trimmed)}` : "/jobs");
        }}
      >
        <label htmlFor="hero-job-search" className="sr-only">
          Search roles, skills, or companies
        </label>
        <Search className="ml-2 h-4.5 w-4.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <Input
          id="hero-job-search"
          name="q"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Frontend, Next.js, or Bengaluru…"
          className="border-0 shadow-none focus-visible:ring-0"
          enterKeyHint="search"
        />
        <Button type="submit" className="dt-btn shrink-0 cursor-pointer font-semibold">
          Search Open Roles
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2" aria-label="Popular role filters">
        <span className="text-xs font-medium text-muted-foreground">Popular:</span>
        {QUICK_FILTERS.map((item) => (
          <Link
            key={item.label}
            href={`/jobs?q=${encodeURIComponent(item.query)}`}
            className="inline-flex min-h-11 items-center rounded-full border bg-secondary/50 px-3 text-xs font-medium text-foreground transition-colors hover:border-foreground/25 hover:bg-secondary motion-reduce:transition-none sm:min-h-8"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function HeroPrimaryAction() {
  const { user } = useAuth();

  return (
    <Link
      href={user ? homeForRole(user) : "/register/student"}
      className="dt-link inline-flex min-h-11 items-center text-sm font-semibold text-foreground sm:min-h-0"
    >
      {user ? "Open My Portal" : "Create Student Account"}
      <DrawnArrow />
    </Link>
  );
}

export function HeroPortalFrame() {
  const activeTab = useSyncExternalStore(subscribeUrlState, getPreviewTabSnapshot, () => "roles");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let nextIdx: number | null = null;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % PREVIEW_TABS.length;
    else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + PREVIEW_TABS.length) % PREVIEW_TABS.length;
    else if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = PREVIEW_TABS.length - 1;

    if (nextIdx !== null) {
      e.preventDefault();
      const target = PREVIEW_TABS[nextIdx];
      if (target) {
        setUrlPreviewTab(target.id);
        tabRefs.current[nextIdx]?.focus();
      }
    }
  };

  return (
    <div className="dt-panel-enter rounded-2xl border bg-secondary/50 p-3 sm:p-5">
      <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-secondary/35 px-4 pt-2 sm:pt-3">
          <div className="flex items-center gap-2 pb-2 sm:pb-2.5">
            <ShieldCheck className="h-4 w-4 text-brand" aria-hidden="true" />
            <span translate="no" className="font-mono text-xs text-muted-foreground">
              portal.hilabs.careers
            </span>
          </div>
          <div
            role="tablist"
            aria-label="HiLabs Careers portal preview"
            className="flex items-center gap-1 overflow-x-auto"
          >
            {PREVIEW_TABS.map((tab, idx) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  id={`hero-tab-${tab.id}`}
                  aria-controls={`hero-panel-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setUrlPreviewTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  className={cn(
                    "dt-tab inline-flex min-h-11 shrink-0 cursor-pointer items-center px-2.5 text-[13px] font-medium transition-colors motion-reduce:transition-none sm:min-h-0 sm:pb-2.5",
                    selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div
            id="hero-panel-roles"
            role="tabpanel"
            aria-labelledby="hero-tab-roles"
            hidden={activeTab !== "roles"}
            tabIndex={activeTab === "roles" ? 0 : undefined}
            className="space-y-2.5 rounded-lg"
          >
            {SAMPLE_ROLES.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-secondary/20 px-3.5 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    translate="no"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-soft text-xs font-semibold text-brand"
                  >
                    {role.monogram}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{role.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      <span translate="no">{role.company}</span> · {role.location}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs font-medium text-foreground tabular-nums">
                  {role.compensation}
                </span>
              </div>
            ))}
          </div>

          <div
            id="hero-panel-apply"
            role="tabpanel"
            aria-labelledby="hero-tab-apply"
            hidden={activeTab !== "apply"}
            tabIndex={activeTab === "apply" ? 0 : undefined}
            className="space-y-3.5 rounded-lg"
          >
            <div className="flex items-start justify-between gap-3 border-b pb-3">
              <div className="min-w-0">
                <p className="font-mono text-xs font-medium text-brand">
                  Domain verified · <span translate="no">kestrelanalytics.in</span>
                </p>
                <p className="mt-1 truncate text-base font-semibold">Frontend Engineer — Next.js</p>
              </div>
              <span className="shrink-0 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
                Eligible
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-lg border border-brand/25 bg-brand-soft/60 px-3.5 py-2.5">
              <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                <span className="truncate">
                  Saved resume: <span translate="no">mehta_2026_v3.pdf</span>
                </span>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">Current</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
              <span>
                Cohort match · <span className="tabular-nums">3/3</span> required skills present
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-1.5 font-medium text-background">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Ready for 1-Click Apply
              </span>
            </div>
          </div>

          <div
            id="hero-panel-tracker"
            role="tabpanel"
            aria-labelledby="hero-tab-tracker"
            hidden={activeTab !== "tracker"}
            tabIndex={activeTab === "tracker" ? 0 : undefined}
            className="space-y-2.5 rounded-lg"
          >
            {[
              {
                role: "Frontend Engineer — Next.js",
                company: "Kestrel Analytics",
                stage: "Interview Scheduled",
                tone: "bg-brand-soft text-brand",
              },
              {
                role: "Systems Software Intern",
                company: "Verge Systems",
                stage: "Shortlisted",
                tone: "bg-success-soft text-success",
              },
              {
                role: "Product Data Analyst",
                company: "Northstar Pay",
                stage: "Applied",
                tone: "bg-secondary text-muted-foreground",
              },
            ].map((item) => (
              <div
                key={item.role}
                className="flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.role}</p>
                  <p translate="no" className="truncate text-xs text-muted-foreground">
                    {item.company}
                  </p>
                </div>
                <span
                  className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", item.tone)}
                >
                  {item.stage}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedRolesSection() {
  const { user, ready } = useAuth();
  const jobs = usePublishedJobs();
  const featured = (jobs.data ?? []).slice(0, 3);

  if (!ready) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl border bg-muted/40 motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {SAMPLE_ROLES.map((role) => (
            <article
              key={role.id}
              className="dt-card flex flex-col justify-between rounded-xl border bg-card p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      translate="no"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-soft text-sm font-semibold text-brand"
                    >
                      {role.monogram}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/jobs?q=${encodeURIComponent(role.searchQuery)}`}
                        className="block break-words text-base font-semibold tracking-tight text-foreground underline-offset-4 hover:underline"
                      >
                        {role.title}
                      </Link>
                      <p translate="no" className="truncate text-sm text-muted-foreground">
                        {role.company}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-semibold text-brand">
                    Verified
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {role.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {role.type}
                  </span>
                </div>

                <p className="mt-2 font-mono text-sm font-medium text-foreground tabular-nums">
                  {role.compensation}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {role.skills.map((skill) => (
                    <span
                      key={skill}
                      translate="no"
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3.5 text-xs text-muted-foreground">
                <span className="tabular-nums">Apply by {role.deadline}</span>
                <Link
                  href="/login?redirect=/jobs"
                  className="dt-link inline-flex min-h-11 items-center text-xs font-semibold text-foreground sm:min-h-0"
                >
                  Sign In to Apply
                  <DrawnArrow />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-6 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-base font-semibold">
              Sign in with your <span translate="no">HiLabs</span> account to view eligible openings
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Published roles match your program, cohort, and skills once you sign in.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="dt-btn inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85 sm:min-h-10"
            >
              Sign In
            </Link>
            <Link
              href="/register/student"
              className="dt-btn inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold hover:bg-accent sm:min-h-10"
            >
              Create Student Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (jobs.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl border bg-muted/40 motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  if (featured.length === 0) {
    return (
      <EmptyState
        title="No published openings right now"
        description="Check back soon or head to your portal to keep your resume and profile ready."
        action={
          <Link
            href={homeForRole(user)}
            className="dt-btn inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85 sm:min-h-10"
          >
            Open My Portal
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {featured.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
