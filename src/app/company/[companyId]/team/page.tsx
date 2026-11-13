"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { CompanyPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  decideMembershipRequest,
  inviteCompanyHr,
  resendCompanyHrInvitation,
  revokeCompanyHrInvitation,
  updateCompany,
} from "@/lib/api/endpoints";
import {
  useCompanyHrInvitations,
  useCompanyMembers,
  useCompanyMembershipRequests,
  useCompanyProfile,
} from "@/lib/api/queries";
import type { CompanyProfile } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

export default function CompanyTeamPage() {
  const { companyId } = useParams<{ companyId: string }>();

  return (
    <RequireRole roles={["COMPANY_USER"]} companyId={companyId}>
      {(user) => {
        const isAdmin =
          user.memberships.find((m) => m.companyId === companyId)?.role === "COMPANY_ADMIN";
        return (
          <CompanyPortalShell user={user} companyId={companyId}>
            <CompanyTeamBody companyId={companyId} isAdmin={isAdmin} />
          </CompanyPortalShell>
        );
      }}
    </RequireRole>
  );
}

function CompanyTeamBody({ companyId, isAdmin }: { companyId: string; isAdmin: boolean }) {
  const queryClient = useQueryClient();
  const profile = useCompanyProfile(companyId);
  const members = useCompanyMembers(companyId);
  const invitations = useCompanyHrInvitations(companyId, isAdmin);
  const requests = useCompanyMembershipRequests(companyId, isAdmin);

  const [inviteEmail, setInviteEmail] = useState("");

  const inviteMutation = useMutation({
    mutationFn: () => inviteCompanyHr(companyId, { email: inviteEmail.trim().toLowerCase() }),
    onSuccess: () => {
      toast.success("HR invitation sent");
      setInviteEmail("");
      queryClient.invalidateQueries({ queryKey: ["company", companyId, "hr-invitations"] });
    },
    onError: (err: Error) => toast.error("Invite failed", { description: err.message }),
  });

  const resendMutation = useMutation({
    mutationFn: (invId: string) => resendCompanyHrInvitation(companyId, invId),
    onSuccess: () => toast.success("Invitation re-sent"),
    onError: (err: Error) => toast.error(err.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (invId: string) => revokeCompanyHrInvitation(companyId, invId),
    onSuccess: () => {
      toast.success("Invitation revoked");
      queryClient.invalidateQueries({ queryKey: ["company", companyId, "hr-invitations"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const decideMutation = useMutation({
    mutationFn: ({ requestId, decision }: { requestId: string; decision: "APPROVE" | "REJECT" }) =>
      decideMembershipRequest(companyId, requestId, { decision }),
    onSuccess: () => {
      toast.success("Request updated");
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Team & company profile"
        description="Maintain your public employer details and invite company HR teammates."
      />

      {profile.data ? (
        <CompanyProfileForm
          key={profile.data.etag ?? profile.dataUpdatedAt}
          companyId={companyId}
          initial={profile.data.data}
          etag={profile.data.etag ?? ""}
          canEdit={isAdmin}
        />
      ) : null}

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-base font-bold">Team members</h2>
        <div className="divide-y">
          {(members.data ?? []).map((member) => (
            <div
              key={member.userId}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div>
                <p className="font-semibold">
                  {[member.firstName, member.lastName].filter(Boolean).join(" ") || member.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.email} · {member.role.replaceAll("_", " ")}
                </p>
              </div>
              <StatusBadge status={member.status} />
            </div>
          ))}
        </div>
      </section>

      {isAdmin ? (
        <>
          <section className="space-y-4 rounded-xl border bg-card p-6">
            <h2 className="text-base font-bold">Invite HR recruiter</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inviteEmail.trim()) inviteMutation.mutate();
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="recruiter@company.com"
                required
              />
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Sending…" : "Send invite"}
              </Button>
            </form>

            {(invitations.data ?? []).length > 0 ? (
              <div className="divide-y border-t pt-3">
                {(invitations.data ?? []).map((inv) => (
                  <div
                    key={inv.invitationId}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires {formatDate(inv.expiresAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={inv.status} />
                      {inv.status === "PENDING" ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => resendMutation.mutate(inv.invitationId)}
                          >
                            Resend
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => revokeMutation.mutate(inv.invitationId)}
                          >
                            Revoke
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          {(requests.data ?? []).length > 0 ? (
            <section className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="text-base font-bold">Membership requests</h2>
              <div className="divide-y">
                {(requests.data ?? []).map((req) => (
                  <div
                    key={req.requestId}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold">
                        {[req.firstName, req.lastName].filter(Boolean).join(" ") || req.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.email} {req.designation ? `· ${req.designation}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={req.status} />
                      {req.status === "PENDING" ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              decideMutation.mutate({
                                requestId: req.requestId,
                                decision: "APPROVE",
                              })
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              decideMutation.mutate({
                                requestId: req.requestId,
                                decision: "REJECT",
                              })
                            }
                          >
                            Reject
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function CompanyProfileForm({
  companyId,
  initial,
  etag,
  canEdit,
}: {
  companyId: string;
  initial: CompanyProfile;
  etag: string;
  canEdit: boolean;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(initial.name ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [website, setWebsite] = useState(initial.website ?? "");
  const [industry, setIndustry] = useState(initial.industry ?? "");
  const [description, setDescription] = useState(initial.description ?? "");

  const save = useMutation({
    mutationFn: () =>
      updateCompany(
        companyId,
        {
          name: name.trim(),
          location: location.trim() || null,
          website: website.trim() || null,
          industry: industry.trim() || null,
          description: description.trim() || null,
        },
        etag,
      ),
    onSuccess: () => {
      toast.success("Company profile updated");
      queryClient.invalidateQueries({ queryKey: ["company", companyId, "profile"] });
    },
    onError: (err: Error) => toast.error("Failed to update", { description: err.message }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="space-y-4 rounded-xl border bg-card p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cp-name" className="mb-1.5 block">
            Company name
          </Label>
          <Input
            id="cp-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canEdit}
            required
          />
        </div>
        <div>
          <Label htmlFor="cp-loc" className="mb-1.5 block">
            Headquarters
          </Label>
          <Input
            id="cp-loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label htmlFor="cp-web" className="mb-1.5 block">
            Website
          </Label>
          <Input
            id="cp-web"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            disabled={!canEdit}
          />
        </div>
        <div>
          <Label htmlFor="cp-ind" className="mb-1.5 block">
            Industry
          </Label>
          <Input
            id="cp-ind"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            disabled={!canEdit}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="cp-desc" className="mb-1.5 block">
          About the company
        </Label>
        <Textarea
          id="cp-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!canEdit}
        />
      </div>
      {canEdit ? (
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save company profile"}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          Only company administrators can edit company profile fields.
        </p>
      )}
    </form>
  );
}
