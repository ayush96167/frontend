"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { StudentPortalShell } from "@/components/shared/portal-nav";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/api/endpoints";
import { useNotifications } from "@/lib/api/queries";
import { timeAgo } from "@/lib/format";

export default function StudentNotificationsPage() {
  return (
    <RequireRole roles={["STUDENT"]}>
      {(user) => (
        <StudentPortalShell user={user}>
          <StudentNotificationsBody />
        </StudentPortalShell>
      )}
    </RequireRole>
  );
}

function StudentNotificationsBody() {
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const notifications = useNotifications(unreadOnly);

  const markOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <div>
      <PortalPageHeader
        title="Notifications"
        description="Application stage updates and portal alerts."
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={unreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setUnreadOnly((prev) => !prev)}
            >
              {unreadOnly ? "Showing unread" : "Filter unread"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
            </Button>
          </div>
        }
      />

      {notifications.isLoading ? (
        <div className="h-44 animate-pulse rounded-xl border bg-muted/40" />
      ) : (notifications.data ?? []).length === 0 ? (
        <EmptyState
          title="You're all caught up"
          description={
            unreadOnly ? "No unread notifications right now." : "No notifications received yet."
          }
        />
      ) : (
        <div className="space-y-3">
          {(notifications.data ?? []).map((item) => (
            <div
              key={item.id}
              className={`flex flex-wrap items-start justify-between gap-4 rounded-xl border p-5 ${
                item.readAt ? "bg-card" : "border-brand/30 bg-brand-soft/30"
              }`}
            >
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">{timeAgo(item.createdAt)}</p>
              </div>
              {!item.readAt ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={markOne.isPending}
                  onClick={() => markOne.mutate(item.id)}
                >
                  Mark read
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
