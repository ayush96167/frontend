"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { AdminPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createCompanyRegistrationInvitation,
  decideCompanyVerification,
  reactivateAdminCompany,
  revokeCompanyRegistrationInvitation,
  suspendAdminCompany,
} from "@/lib/api/endpoints";
import { useAdminCompanies, useAdminCompany, useAdminCompanyInvitations } from "@/lib/api/queries";
import { formatDate } from "@/lib/format";

export default function AdminCompaniesPage() {
  return (
    <RequireRole roles={["PORTAL_HR", "MASTER_ADMIN"]}>
      {(user) => (
        <AdminPortalShell user={user}>
          <AdminCompaniesBody />
        </AdminPortalShell>
      )}
    </RequireRole>
  );
}

function AdminCompaniesBody() {
  const queryClient = useQueryClient();
  const companies = useAdminCompanies();
  const invitations = useAdminCompanyInvitations();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [proposedCompanyName, setProposedCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [note, setNote] = useState("");
  const [preApproved, setPreApproved] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: () =>
      createCompanyRegistrationInvitation({
        proposedCompanyName: proposedCompanyName.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        ...(note.trim() ? { note: note.trim() } : {}),
        preApproved,
      }),
    onSuccess: () => {
      toast.success("Company registration invitation sent");
      setProposedCompanyName("");
      setContactEmail("");
      setNote("");
      setPreApproved(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "company-invitations"] });
    },
    onError: (err: Error) => toast.error("Failed to create invite", { description: err.message }),
  });

  const revokeMutation = useMutation({
    mutationFn: revokeCompanyRegistrationInvitation,
    onSuccess: () => {
      toast.success("Invitation revoked");
      queryClient.invalidateQueries({ queryKey: ["admin", "company-invitations"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Companies & verification"
        description="Review submitted companies, approve or suspend partners, and send private registration invitations."
      />

      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="companies">Registered companies</TabsTrigger>
          <TabsTrigger value="invitations">Registration invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          {companies.isLoading ? (
            <div className="h-44 animate-pulse rounded-xl border bg-muted/40" />
          ) : (companies.data ?? []).length === 0 ? (
            <EmptyState
              title="No companies registered yet"
              description="Send a company registration invitation in the next tab to onboard an employer partner."
            />
          ) : (
            <div
              tabIndex={0}
              role="region"
              aria-label="Companies list"
              className="overflow-x-auto rounded-xl border bg-card"
            >
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Company
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Admin email
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Created
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">
                      Manage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(companies.data ?? []).map((c) => (
                    <tr key={c.companyId} className="hover:bg-accent/40">
                      <th scope="row" className="px-4 py-3 font-semibold">
                        {c.name}
                      </th>
                      <td className="px-4 py-3 text-muted-foreground">{c.adminEmail ?? "—"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedId(c.companyId)}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              inviteMutation.mutate();
            }}
            className="space-y-4 rounded-xl border bg-card p-6"
          >
            <h2 className="text-base font-bold">Send private company invitation</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ci-name" className="mb-1.5 block">
                  Company name
                </Label>
                <Input
                  id="ci-name"
                  value={proposedCompanyName}
                  onChange={(e) => setProposedCompanyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ci-email" className="mb-1.5 block">
                  Owner work email
                </Label>
                <Input
                  id="ci-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ci-note" className="mb-1.5 block">
                Internal note (optional)
              </Label>
              <Input id="ci-note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={preApproved}
                onCheckedChange={(checked) => setPreApproved(Boolean(checked))}
              />
              Pre-approve verification on registration completion
            </label>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? "Sending…" : "Create invitation"}
            </Button>
          </form>

          <section className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-base font-bold">Sent invitations</h2>
            {(invitations.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No invitations created yet.</p>
            ) : (
              <div className="divide-y">
                {(invitations.data ?? []).map((inv) => (
                  <div
                    key={inv.invitationId}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold">{inv.proposedCompanyName ?? "Company invite"}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.contactEmail ?? "No email"} · Expires {formatDate(inv.expiresAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={inv.status} />
                      {inv.status === "PENDING" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          disabled={revokeMutation.isPending}
                          onClick={() => revokeMutation.mutate(inv.invitationId)}
                        >
                          Revoke
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>

      {selectedId ? (
        <CompanyReviewDialog companyId={selectedId} onClose={() => setSelectedId(null)} />
      ) : null}
    </div>
  );
}

function CompanyReviewDialog({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const detailQuery = useAdminCompany(companyId);

  const [websiteChecked, setWebsiteChecked] = useState(true);
  const [linkedinChecked, setLinkedinChecked] = useState(true);
  const [gstinChecked, setGstinChecked] = useState(false);
  const [reason, setReason] = useState("");

  const decideMutation = useMutation({
    mutationFn: (decision: "APPROVED" | "REJECTED") => {
      if (decision === "REJECTED" && reason.trim().length < 10) {
        throw new Error("Rejection reason must be at least 10 characters.");
      }
      return decideCompanyVerification(companyId, {
        decision,
        websiteChecked,
        linkedinChecked,
        gstinChecked,
        ...(decision === "REJECTED"
          ? { reason: reason.trim() }
          : reason.trim()
            ? { note: reason.trim() }
            : {}),
      });
    },
    onSuccess: () => {
      toast.success("Verification decision recorded");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const suspendMutation = useMutation({
    mutationFn: () => {
      if (reason.trim().length < 10) throw new Error("Reason must be at least 10 characters.");
      return suspendAdminCompany(companyId, reason.trim());
    },
    onSuccess: () => {
      toast.success("Company suspended");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const reactivateMutation = useMutation({
    mutationFn: () => {
      if (reason.trim().length < 10) throw new Error("Reason must be at least 10 characters.");
      return reactivateAdminCompany(companyId, reason.trim());
    },
    onSuccess: () => {
      toast.success("Company reactivated");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const company = detailQuery.data?.data;

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{company?.name ?? "Company verification"}</DialogTitle>
          <DialogDescription>{company?.location ?? "Verification inspection"}</DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading || !company ? (
          <div className="h-44 animate-pulse rounded-lg bg-muted/40" />
        ) : (
          <div className="space-y-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={company.status} />
            </div>

            <dl className="grid gap-2 rounded-lg bg-secondary/40 p-4 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Website</dt>
                <dd className="font-medium break-all">{company.website ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">LinkedIn</dt>
                <dd className="font-medium break-all">{company.linkedin_url ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">GSTIN</dt>
                <dd className="font-medium">{company.gstin ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Domains</dt>
                <dd className="font-medium">
                  {(company.email_domains ?? [])
                    .map((d) => `${d.domain}${d.verified ? " ✓" : ""}`)
                    .join(", ") || "—"}
                </dd>
              </div>
            </dl>

            {company.status === "IN_REVIEW" ? (
              <div className="space-y-3 rounded-lg border p-4">
                <p className="font-semibold">Verification checklist</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={websiteChecked}
                      onCheckedChange={(c) => setWebsiteChecked(Boolean(c))}
                    />
                    Website checked
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={linkedinChecked}
                      onCheckedChange={(c) => setLinkedinChecked(Boolean(c))}
                    />
                    LinkedIn checked
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={gstinChecked}
                      onCheckedChange={(c) => setGstinChecked(Boolean(c))}
                    />
                    GSTIN checked
                  </label>
                </div>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Note (or required 10+ char reason if rejecting)…"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={decideMutation.isPending}
                    onClick={() => decideMutation.mutate("APPROVED")}
                  >
                    Approve company
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={decideMutation.isPending}
                    onClick={() => decideMutation.mutate("REJECTED")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : company.status === "ACTIVE" || company.status === "SUSPENDED" ? (
              <div className="space-y-3 rounded-lg border p-4">
                <p className="font-semibold">
                  {company.status === "ACTIVE" ? "Suspend company" : "Reactivate company"}
                </p>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Audit reason (10+ characters)…"
                />
                {company.status === "ACTIVE" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={suspendMutation.isPending}
                    onClick={() => suspendMutation.mutate()}
                  >
                    Suspend company
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={reactivateMutation.isPending}
                    onClick={() => reactivateMutation.mutate()}
                  >
                    Reactivate company
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
