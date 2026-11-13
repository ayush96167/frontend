"use client";

import Link from "next/link";
import { BookmarkX, MapPin } from "lucide-react";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { StudentPortalShell } from "@/components/shared/portal-nav";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useSavedJobs, useToggleSaveJob } from "@/lib/api/queries";
import { employmentTypeLabels, formatDate, workModeLabels } from "@/lib/format";

export default function StudentSavedJobsPage() {
  return (
    <RequireRole roles={["STUDENT"]}>
      {(user) => (
        <StudentPortalShell user={user}>
          <StudentSavedBody />
        </StudentPortalShell>
      )}
    </RequireRole>
  );
}

function StudentSavedBody() {
  const saved = useSavedJobs();
  const toggleSave = useToggleSaveJob();

  return (
    <div>
      <PortalPageHeader
        title="Saved jobs"
        description="Bookmarked roles to review or apply for when your profile is ready."
      />

      {saved.isLoading ? (
        <div className="h-44 animate-pulse rounded-xl border bg-muted/40" />
      ) : (saved.data ?? []).length === 0 ? (
        <EmptyState
          title="No saved jobs"
          description="Bookmark interesting openings while browsing jobs so you can return to them quickly."
          action={
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85"
            >
              Browse jobs
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {(saved.data ?? []).map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"
            >
              <div>
                <Link href={`/jobs/${item.id}`} className="text-base font-semibold hover:underline">
                  {item.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{item.companyName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {item.location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {item.location}
                    </span>
                  ) : null}
                  {item.employmentType ? (
                    <span>{employmentTypeLabels[item.employmentType]}</span>
                  ) : null}
                  {item.workMode ? <span>{workModeLabels[item.workMode]}</span> : null}
                  <span>Saved {formatDate(item.savedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/jobs/${item.id}`}
                  className="inline-flex items-center justify-center rounded-md bg-foreground px-3.5 py-2 text-xs font-semibold text-background hover:bg-foreground/85"
                >
                  View role
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={toggleSave.isPending}
                  onClick={() =>
                    toggleSave.mutate(
                      { jobId: item.id, save: false },
                      {
                        onSuccess: () => toast.success("Removed from saved jobs"),
                        onError: (err) => toast.error((err as Error).message),
                      },
                    )
                  }
                >
                  <BookmarkX className="mr-1 h-4 w-4" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
