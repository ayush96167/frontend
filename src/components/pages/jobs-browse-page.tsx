"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/shared/site";
import { JobCard } from "@/components/shared/job-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/api/auth";
import { usePublishedJobs, useToggleSaveJob } from "@/lib/api/queries";
import type { EmploymentType, WorkMode } from "@/lib/api/types";
import { employmentTypeLabels, workModeLabels } from "@/lib/format";
import { toast } from "sonner";

export function JobsBrowsePage() {
  const searchParams = useSearchParams();
  const { user, ready } = useAuth();
  const toggleSave = useToggleSaveJob();

  const [qInput, setQInput] = useState(searchParams.get("q") ?? "");
  const [locationInput, setLocationInput] = useState("");
  const [workModeInput, setWorkModeInput] = useState<string>("ALL");
  const [employmentTypeInput, setEmploymentTypeInput] = useState<string>("ALL");
  const [sortInput, setSortInput] = useState<"recent" | "deadline">("recent");

  const [appliedFilters, setAppliedFilters] = useState<{
    q?: string | undefined;
    location?: string | undefined;
    workMode?: WorkMode | undefined;
    employmentType?: EmploymentType | undefined;
    sort: "recent" | "deadline";
  }>(() => {
    const initialQ = searchParams.get("q")?.trim();
    return initialQ ? { q: initialQ, sort: "recent" } : { sort: "recent" };
  });

  const jobsQuery = usePublishedJobs(appliedFilters);

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters({
      ...(qInput.trim() ? { q: qInput.trim() } : {}),
      ...(locationInput.trim() ? { location: locationInput.trim() } : {}),
      ...(workModeInput !== "ALL" ? { workMode: workModeInput as WorkMode } : {}),
      ...(employmentTypeInput !== "ALL"
        ? { employmentType: employmentTypeInput as EmploymentType }
        : {}),
      sort: sortInput,
    });
  };

  const resetFilters = () => {
    setQInput("");
    setLocationInput("");
    setWorkModeInput("ALL");
    setEmploymentTypeInput("ALL");
    setSortInput("recent");
    setAppliedFilters({ sort: "recent" });
  };

  return (
    <SiteLayout>
      <PageHero
        title="Open roles"
        description="Verified opportunities across HiLabs employer partners."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {!ready ? (
          <div className="h-48 animate-pulse rounded-xl border bg-muted/40" />
        ) : !user ? (
          <EmptyState
            title="Sign in to browse open roles"
            description="HiLabs Careers is an invite-only campus and employer hiring network. Sign in with your student or recruiter account to view live roles."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/login?redirect=/jobs"
                  className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85"
                >
                  Sign in
                </Link>
                <Link
                  href="/register/student"
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold hover:bg-accent"
                >
                  Student registration
                </Link>
              </div>
            }
          />
        ) : (
          <>
            <search>
              <form
                onSubmit={applySearch}
                aria-label="Filter jobs"
                className="mb-8 grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6"
              >
                <div className="lg:col-span-2">
                  <Label htmlFor="job-q" className="mb-1 block text-xs">
                    Keyword
                  </Label>
                  <Input
                    id="job-q"
                    type="search"
                    value={qInput}
                    onChange={(e) => setQInput(e.target.value)}
                    placeholder="Role, skill, or keyword…"
                    spellCheck={false}
                  />
                </div>

                <div>
                  <Label htmlFor="job-loc" className="mb-1 block text-xs">
                    Location
                  </Label>
                  <Input
                    id="job-loc"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="City or Remote"
                  />
                </div>

                <div>
                  <Label className="mb-1 block text-xs">Work mode</Label>
                  <Select value={workModeInput} onValueChange={setWorkModeInput}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All work modes</SelectItem>
                      {(Object.keys(workModeLabels) as WorkMode[]).map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {workModeLabels[mode]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1 block text-xs">Employment</Label>
                  <Select value={employmentTypeInput} onValueChange={setEmploymentTypeInput}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All types</SelectItem>
                      {(Object.keys(employmentTypeLabels) as EmploymentType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {employmentTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col justify-end gap-2">
                  <Select
                    value={sortInput}
                    onValueChange={(v) => setSortInput(v as "recent" | "deadline")}
                  >
                    <SelectTrigger aria-label="Sort jobs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most recent</SelectItem>
                      <SelectItem value="deadline">Earliest deadline</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      <Search className="mr-1.5 h-3.5 w-3.5" /> Filter
                    </Button>
                    <Button type="button" variant="outline" onClick={resetFilters}>
                      Reset
                    </Button>
                  </div>
                </div>
              </form>
            </search>

            {jobsQuery.isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-44 animate-pulse rounded-xl border bg-muted/40" />
                ))}
              </div>
            ) : jobsQuery.isError ? (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive-soft p-6 text-sm text-destructive"
              >
                Failed to load jobs: {(jobsQuery.error as Error).message}
              </div>
            ) : (jobsQuery.data ?? []).length === 0 ? (
              <EmptyState
                title="No matching roles right now"
                description="No published roles match your current filters. Try clearing filters or check back as verified employers post openings."
                action={
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {(jobsQuery.data ?? []).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    {...(user.role === "STUDENT"
                      ? {
                          onToggleSave: (item) =>
                            toggleSave.mutate(
                              { jobId: item.id, save: !item.saved },
                              {
                                onError: (err) => toast.error((err as Error).message),
                              },
                            ),
                        }
                      : {})}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </SiteLayout>
  );
}
