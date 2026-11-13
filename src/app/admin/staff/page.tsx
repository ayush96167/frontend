"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { AdminPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdminStaff, deactivateAdminStaff, reactivateAdminStaff } from "@/lib/api/endpoints";
import { useAdminStaff } from "@/lib/api/queries";
import { formatDate } from "@/lib/format";

export default function AdminStaffPage() {
  return (
    <RequireRole roles={["MASTER_ADMIN"]}>
      {(user) => (
        <AdminPortalShell user={user}>
          <AdminStaffBody />
        </AdminPortalShell>
      )}
    </RequireRole>
  );
}

function AdminStaffBody() {
  const queryClient = useQueryClient();
  const staff = useAdminStaff();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [reason, setReason] = useState("");

  const invite = useMutation({
    mutationFn: () =>
      createAdminStaff({
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
      }),
    onSuccess: () => {
      toast.success("Portal HR activation email sent");
      setEmail("");
      setFirstName("");
      setLastName("");
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleActive = useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) => {
      if (reason.trim().length < 10) {
        throw new Error("Enter a 10+ character audit reason first.");
      }
      return active
        ? deactivateAdminStaff(userId, reason.trim())
        : reactivateAdminStaff(userId, reason.trim());
    },
    onSuccess: () => {
      toast.success("Staff account updated");
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Portal staff"
        description="Invite and manage HiLabs Portal HR administrators."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          invite.mutate();
        }}
        className="space-y-4 rounded-xl border bg-card p-6"
      >
        <h2 className="text-base font-bold">Invite Portal HR staff</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="st-email" className="mb-1.5 block">
              Email *
            </Label>
            <Input
              id="st-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="st-first" className="mb-1.5 block">
              First name *
            </Label>
            <Input
              id="st-first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="st-last" className="mb-1.5 block">
              Last name
            </Label>
            <Input id="st-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <Button type="submit" disabled={invite.isPending}>
          {invite.isPending ? "Sending activation…" : "Invite Portal HR"}
        </Button>
      </form>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">Staff accounts</h2>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Audit reason (10+ chars) for deactivate/reactivate…"
            className="max-w-sm"
          />
        </div>
        <div className="divide-y">
          {(staff.data ?? []).map((member) => (
            <div
              key={member.userId}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div>
                <p className="font-semibold">
                  {[member.firstName, member.lastName].filter(Boolean).join(" ") || member.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.email} · Added {formatDate(member.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={member.active ? "ACTIVE" : "SUSPENDED"} />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={toggleActive.isPending}
                  onClick={() =>
                    toggleActive.mutate({ userId: member.userId, active: member.active })
                  }
                >
                  {member.active ? "Deactivate" : "Reactivate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
