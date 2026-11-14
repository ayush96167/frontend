"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { createStudentEmailImport, getStudentEmailImport, uploadFileToR2 } from "@/lib/api/endpoints";
import type { LearnerType } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MAX_CSV_BYTES = 5 * 1024 * 1024;

export function StudentEmailImport() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [learnerType, setLearnerType] = useState<LearnerType>("PLACEMENT_SUPPORT");
  const [programCode, setProgramCode] = useState("");
  const [cohort, setCohort] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [importId, setImportId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const status = useQuery({
    queryKey: ["admin", "student-email-import", importId],
    queryFn: async () => (await getStudentEmailImport(importId!)).data,
    enabled: Boolean(importId),
    refetchInterval: (query) => {
      const state = query.state.data?.status;
      return state && state !== "PROCESSING" ? false : 2000;
    },
  });

  useEffect(() => {
    const state = status.data?.status;
    if (state && state !== "PROCESSING") {
      queryClient.invalidateQueries({ queryKey: ["admin", "allowlist"] });
      if (state === "COMPLETED") toast.success(`Import complete: ${status.data?.added ?? 0} students added`);
      else if (state === "COMPLETED_WITH_ERRORS") toast.warning("Import completed with some rows skipped");
      else toast.error(status.data?.failureSummary || "The CSV import failed");
    }
  }, [status.data, queryClient]);

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a CSV file first.");
      const fileId = await uploadFileToR2(file, "ALLOWLIST_CSV");
      const body = {
        fileId,
        learnerType,
        ...(programCode.trim() ? { programCode: programCode.trim().toUpperCase() } : {}),
        ...(cohort.trim() ? { cohort: cohort.trim() } : {}),
        ...(batchYear.trim() ? { batchYear: Number(batchYear) } : {}),
      };

      // File validation is asynchronous. Retry briefly while the scan worker marks it READY.
      for (let attempt = 0; attempt < 20; attempt += 1) {
        try {
          return (await createStudentEmailImport(body)).data;
        } catch (error) {
          if (!(error instanceof ApiError) || error.code !== "FILE_SCAN_PENDING" || attempt === 19) throw error;
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
      throw new Error("The CSV is still being validated. Please try again shortly.");
    },
    onSuccess: (result) => {
      setImportId(result.importId);
      setFile(null);
      toast.success("CSV uploaded; import is processing");
    },
    onError: (error: Error) => toast.error("Couldn't import CSV", { description: error.message }),
  });

  const chooseFile = (next: File | undefined) => {
    if (!next) return;
    if (!next.name.toLowerCase().endsWith(".csv") || next.size > MAX_CSV_BYTES) {
      toast.error("Choose a CSV file up to 5 MB");
      return;
    }
    setFile(next);
  };

  const busy = importMutation.isPending || status.data?.status === "PROCESSING";
  const completed = status.data && status.data.status !== "PROCESSING";

  return (
    <section className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h2 className="text-base font-bold">Import students from CSV</h2>
        <p className="mt-1 text-sm text-muted-foreground">Upload up to 5 MB. Required column: email. Optional columns: firstName, lastName, rollNumber, learnerType, programCode, cohort, batchYear.</p>
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Choose a student CSV file"
        onClick={() => document.getElementById("student-csv")?.click()}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") document.getElementById("student-csv")?.click(); }}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}
        className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center ${dragging ? "border-primary bg-primary/5" : "border-border"}`}
      >
        <FileUp className="mb-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium">{file?.name ?? "Drop a CSV here or click to browse"}</span>
        <span className="mt-1 text-xs text-muted-foreground">Maximum file size 5 MB</span>
        <input id="student-csv" type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label>Learner type default</Label>
          <Select value={learnerType} onValueChange={(value) => setLearnerType(value as LearnerType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="PLACEMENT_SUPPORT">Placement support</SelectItem><SelectItem value="ENROLLED">Enrolled</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label htmlFor="csv-program">Program code default</Label><Input id="csv-program" value={programCode} onChange={(event) => setProgramCode(event.target.value)} placeholder="Required for enrolled" /></div>
        <div className="space-y-1.5"><Label htmlFor="csv-cohort">Cohort default</Label><Input id="csv-cohort" value={cohort} onChange={(event) => setCohort(event.target.value)} placeholder="e.g. Batch 2026" /></div>
        <div className="space-y-1.5"><Label htmlFor="csv-year">Batch year default</Label><Input id="csv-year" inputMode="numeric" value={batchYear} onChange={(event) => setBatchYear(event.target.value)} placeholder="2026" /></div>
      </div>
      {learnerType === "ENROLLED" && !programCode.trim() ? <p className="text-sm text-destructive">A program code is required for enrolled students.</p> : null}
      <Button type="button" disabled={!file || busy || (learnerType === "ENROLLED" && !programCode.trim())} onClick={() => importMutation.mutate()}>
        {importMutation.isPending ? "Uploading and validating…" : status.data?.status === "PROCESSING" ? "Import processing…" : "Upload and import CSV"}
      </Button>

      {status.data ? (
        <div aria-live="polite" className="rounded-lg border bg-secondary/30 p-4 text-sm">
          <p className="font-semibold">Import status: {status.data.status.replaceAll("_", " ").toLowerCase()}</p>
          {completed ? <p className="mt-1 text-muted-foreground">{status.data.added} added · {status.data.duplicates} duplicates · {status.data.invalid} invalid · {status.data.totalRows} rows</p> : <p className="mt-1 text-muted-foreground">Your rows are being processed. This panel updates automatically.</p>}
          {status.data.failureSummary ? <p className="mt-2 text-destructive">{status.data.failureSummary}</p> : null}
          {status.data.errors?.length ? <details className="mt-2"><summary className="cursor-pointer font-medium">View row errors ({status.data.errors.length})</summary><ul className="mt-2 max-h-40 space-y-1 overflow-auto text-muted-foreground">{status.data.errors.slice(0, 100).map((error, index) => <li key={`${error.row}-${error.code}-${index}`}>Row {error.row}{error.email ? ` (${error.email})` : ""}: {error.message || error.code}</li>)}</ul></details> : null}
        </div>
      ) : null}
    </section>
  );
}
