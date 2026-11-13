"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { AdminPortalShell } from "@/components/shared/portal-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePlatformSettings } from "@/lib/api/endpoints";
import { usePlatformSettings } from "@/lib/api/queries";
import type { PlatformSettings } from "@/lib/api/types";

export default function AdminSettingsPage() {
  return (
    <RequireRole roles={["PORTAL_HR", "MASTER_ADMIN"]}>
      {(user) => (
        <AdminPortalShell user={user}>
          <AdminSettingsBody canEdit={user.role === "MASTER_ADMIN"} />
        </AdminPortalShell>
      )}
    </RequireRole>
  );
}

function AdminSettingsBody({ canEdit }: { canEdit: boolean }) {
  const settingsQuery = usePlatformSettings();

  return (
    <div>
      <PortalPageHeader
        title="Platform settings"
        description="Configure application thresholds, daily limits, and invitation lifetimes."
      />

      {settingsQuery.isLoading ? (
        <div className="h-64 animate-pulse rounded-xl border bg-muted/40" />
      ) : settingsQuery.data ? (
        <SettingsForm
          key={settingsQuery.data.etag ?? settingsQuery.dataUpdatedAt}
          initial={settingsQuery.data.data}
          etag={settingsQuery.data.etag ?? ""}
          canEdit={canEdit}
        />
      ) : null}
    </div>
  );
}

function SettingsForm({
  initial,
  etag,
  canEdit,
}: {
  initial: PlatformSettings;
  etag: string;
  canEdit: boolean;
}) {
  const queryClient = useQueryClient();
  const [applyThreshold, setApplyThreshold] = useState(initial.applyCompletionThreshold);
  const [talentThreshold, setTalentThreshold] = useState(initial.talentSearchCompletionThreshold);
  const [cooldownDays, setCooldownDays] = useState(initial.reapplyCooldownDays);
  const [maxAppsPerDay, setMaxAppsPerDay] = useState(initial.maxApplicationsPerStudentPerDay);
  const [hrTtlDays, setHrTtlDays] = useState(initial.hrInvitationTtlDays);
  const [companyTtlDays, setCompanyTtlDays] = useState(initial.companyInvitationTtlDays);

  const save = useMutation({
    mutationFn: () =>
      updatePlatformSettings(
        {
          applyCompletionThreshold: applyThreshold,
          talentSearchCompletionThreshold: talentThreshold,
          reapplyCooldownDays: cooldownDays,
          maxApplicationsPerStudentPerDay: maxAppsPerDay,
          hrInvitationTtlDays: hrTtlDays,
          companyInvitationTtlDays: companyTtlDays,
        },
        etag,
      ),
    onSuccess: () => {
      toast.success("Platform settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "platform-settings"] });
    },
    onError: (err: Error) => toast.error("Failed to save settings", { description: err.message }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="space-y-5 rounded-xl border bg-card p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NumField
          id="ps-apply"
          label="Apply completion threshold (%)"
          value={applyThreshold}
          onChange={setApplyThreshold}
          disabled={!canEdit}
        />
        <NumField
          id="ps-talent"
          label="Talent search threshold (%)"
          value={talentThreshold}
          onChange={setTalentThreshold}
          disabled={!canEdit}
        />
        <NumField
          id="ps-cooldown"
          label="Re-apply cooldown (days)"
          value={cooldownDays}
          onChange={setCooldownDays}
          disabled={!canEdit}
        />
        <NumField
          id="ps-maxapps"
          label="Max applications per student/day"
          value={maxAppsPerDay}
          onChange={setMaxAppsPerDay}
          disabled={!canEdit}
        />
        <NumField
          id="ps-hrttl"
          label="HR invitation TTL (days)"
          value={hrTtlDays}
          onChange={setHrTtlDays}
          disabled={!canEdit}
        />
        <NumField
          id="ps-comttl"
          label="Company invitation TTL (days)"
          value={companyTtlDays}
          onChange={setCompanyTtlDays}
          disabled={!canEdit}
        />
      </div>

      {canEdit ? (
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save platform settings"}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          Read-only for Portal HR. Only Master Admin can modify platform settings.
        </p>
      )}
    </form>
  );
}

function NumField({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        disabled={disabled}
      />
    </div>
  );
}
