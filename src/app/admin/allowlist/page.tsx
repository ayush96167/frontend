"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { AdminPortalShell } from "@/components/shared/portal-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { StudentEmailImport } from "@/components/shared/student-email-import";
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
import {
  addStudentAllowlistEntry,
  createProgram,
  revokeStudentAllowlistEntry,
} from "@/lib/api/endpoints";
import { useAdminAllowlist, usePrograms } from "@/lib/api/queries";
import type { LearnerType } from "@/lib/api/types";

export default function AdminAllowlistPage() {
  return (
    <RequireRole roles={["PORTAL_HR", "MASTER_ADMIN"]}>
      {(user) => (
        <AdminPortalShell user={user}>
          <AdminAllowlistBody />
        </AdminPortalShell>
      )}
    </RequireRole>
  );
}

function AdminAllowlistBody() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const allowlist = useAdminAllowlist(searchText.trim() ? { query: searchText.trim() } : undefined);
  const programs = usePrograms();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [learnerType, setLearnerType] = useState<LearnerType>("ENROLLED");
  const [programCode, setProgramCode] = useState("");
  const [batchYear, setBatchYear] = useState("");

  const [newProgCode, setNewProgCode] = useState("");
  const [newProgName, setNewProgName] = useState("");

  const addStudent = useMutation({
    mutationFn: () =>
      addStudentAllowlistEntry({
        email: email.trim().toLowerCase(),
        ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
        ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
        learnerType,
        ...(programCode.trim() ? { programCode: programCode.trim() } : {}),
        ...(batchYear.trim() ? { batchYear: Number(batchYear) } : {}),
      }),
    onSuccess: () => {
      toast.success("Student added to allowlist");
      setEmail("");
      setFirstName("");
      setLastName("");
      queryClient.invalidateQueries({ queryKey: ["admin", "allowlist"] });
    },
    onError: (err: Error) => toast.error("Couldn't add student", { description: err.message }),
  });

  const revokeStudent = useMutation({
    mutationFn: revokeStudentAllowlistEntry,
    onSuccess: () => {
      toast.success("Allowlist entry revoked");
      queryClient.invalidateQueries({ queryKey: ["admin", "allowlist"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const addProgram = useMutation({
    mutationFn: () =>
      createProgram({ code: newProgCode.trim().toUpperCase(), name: newProgName.trim() }),
    onSuccess: () => {
      toast.success("Program created");
      setNewProgCode("");
      setNewProgName("");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="Student allowlist"
        description="Authorize eligible students to request registration links and manage academic programs."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addStudent.mutate();
        }}
        className="space-y-4 rounded-xl border bg-card p-6"
      >
        <h2 className="text-base font-bold">Add student to allowlist</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="al-email" className="mb-1.5 block">
              Student email *
            </Label>
            <Input
              id="al-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="al-first" className="mb-1.5 block">
              First name
            </Label>
            <Input id="al-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="al-last" className="mb-1.5 block">
              Last name
            </Label>
            <Input id="al-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Learner type</Label>
            <Select value={learnerType} onValueChange={(v) => setLearnerType(v as LearnerType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENROLLED">Enrolled</SelectItem>
                <SelectItem value="PLACEMENT_SUPPORT">Placement support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="al-prog" className="mb-1.5 block">
              Program code (optional)
            </Label>
            <Input
              id="al-prog"
              value={programCode}
              onChange={(e) => setProgramCode(e.target.value)}
              placeholder="BTECH-CSE"
            />
          </div>
          <div>
            <Label htmlFor="al-year" className="mb-1.5 block">
              Batch year (optional)
            </Label>
            <Input
              id="al-year"
              inputMode="numeric"
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              placeholder="2026"
            />
          </div>
        </div>
        <Button type="submit" disabled={addStudent.isPending}>
          {addStudent.isPending ? "Adding…" : "Add student"}
        </Button>
      </form>

      <StudentEmailImport />

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">Allowlist directory</h2>
          <Input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Filter by email or name…"
            className="max-w-xs"
          />
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-label="Allowlist entries"
          className="overflow-x-auto rounded-lg border"
        >
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Email
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Student
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Track
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(allowlist.data ?? []).map((entry) => (
                <tr key={entry.id}>
                  <th scope="row" className="px-4 py-2.5 font-medium">
                    {entry.email}
                  </th>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {[entry.firstName, entry.lastName].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {entry.learnerType}
                    {entry.program ? ` · ${entry.program.code}` : ""}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={entry.status} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {entry.status === "AVAILABLE" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => revokeStudent.mutate(entry.id)}
                      >
                        Revoke
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-base font-bold">Programs</h2>
        <div className="flex flex-wrap gap-2">
          {(programs.data ?? []).map((prog) => (
            <span
              key={prog.id}
              className="rounded-full border bg-secondary px-3 py-1 text-xs font-medium"
            >
              {prog.code} — {prog.name}
            </span>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addProgram.mutate();
          }}
          className="grid gap-3 border-t pt-4 sm:grid-cols-3"
        >
          <Input
            placeholder="Code (e.g. MCA)"
            value={newProgCode}
            onChange={(e) => setNewProgCode(e.target.value)}
            required
          />
          <Input
            placeholder="Program name"
            value={newProgName}
            onChange={(e) => setNewProgName(e.target.value)}
            required
          />
          <Button type="submit" disabled={addProgram.isPending}>
            Add program
          </Button>
        </form>
      </section>
    </div>
  );
}
