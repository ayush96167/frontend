"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateCompanyJobPayload } from "@/lib/api/endpoints";
import type { EmploymentType, WorkMode } from "@/lib/api/types";
import { employmentTypeLabels, workModeLabels } from "@/lib/format";
import { useSkillCatalog } from "@/lib/api/queries";

const employmentTypes = Object.keys(employmentTypeLabels) as EmploymentType[];
const workModes = Object.keys(workModeLabels) as WorkMode[];

export function JobForm({
  submitLabel,
  onSubmit,
  pending,
}: {
  submitLabel: string;
  onSubmit: (input: CreateCompanyJobPayload) => void;
  pending?: boolean;
}) {
  const [skillSearch, setSkillSearch] = useState("");
  const catalog = useSkillCatalog(skillSearch.trim() || undefined);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [locationsText, setLocationsText] = useState("");
  const [openings, setOpenings] = useState(1);
  const [employmentType, setEmploymentType] = useState<EmploymentType>("FULL_TIME");
  const [workMode, setWorkMode] = useState<WorkMode>("HYBRID");
  const [minExperienceYears, setMinExperienceYears] = useState(0);
  const [maxExperienceYears, setMaxExperienceYears] = useState(2);
  const [salaryVisible, setSalaryVisible] = useState(true);
  const [minSalary, setMinSalary] = useState("600000");
  const [maxSalary, setMaxSalary] = useState("1000000");
  const [salaryPeriod, setSalaryPeriod] = useState<"MONTH" | "YEAR">("YEAR");
  const [deadlineDate, setDeadlineDate] = useState(() =>
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  );
  const [selectedSkills, setSelectedSkills] = useState<
    { skillId: string; name: string; mandatory: boolean }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const toggleSkill = (skillId: string, name: string) => {
    setSelectedSkills((prev) =>
      prev.some((s) => s.skillId === skillId)
        ? prev.filter((s) => s.skillId !== skillId)
        : [...prev, { skillId, name, mandatory: true }],
    );
  };

  const submit = () => {
    const locations = locationsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!title.trim()) return setError("Job title is required.");
    if (!description.trim()) return setError("Job description is required.");
    if (locations.length === 0) return setError("Enter at least one location.");
    if (maxExperienceYears < minExperienceYears) {
      return setError("Max experience must be at least min experience.");
    }
    if (salaryVisible) {
      if (!/^\d{1,12}(\.\d{1,2})?$/.test(minSalary) || !/^\d{1,12}(\.\d{1,2})?$/.test(maxSalary)) {
        return setError("Enter numeric salary bounds.");
      }
      if (Number(maxSalary) < Number(minSalary)) {
        return setError("Max salary must be at least min salary.");
      }
    }
    const deadlineIso = new Date(`${deadlineDate}T23:59:59Z`).toISOString();
    if (new Date(deadlineIso).getTime() <= Date.now()) {
      return setError("Application deadline must be in the future.");
    }

    setError(null);
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      ...(responsibilities.trim() ? { responsibilities: responsibilities.trim() } : {}),
      openings,
      locations,
      employmentType,
      workMode,
      minExperienceYears,
      maxExperienceYears,
      skills: selectedSkills.map(({ skillId, mandatory }) => ({ skillId, mandatory })),
      salary: salaryVisible
        ? {
            visible: true,
            min: minSalary.trim(),
            max: maxSalary.trim(),
            currency: "INR",
            period: salaryPeriod,
          }
        : { visible: false },
      applicationDeadline: deadlineIso,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title" className="sm:col-span-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Backend Engineer (Node.js)"
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will this person build and own?"
          />
        </Field>
        <Field label="Locations" hint="Comma-separated">
          <Input
            value={locationsText}
            onChange={(e) => setLocationsText(e.target.value)}
            placeholder="Bengaluru, Remote"
          />
        </Field>
        <Field label="Application deadline">
          <Input
            type="date"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
          />
        </Field>
        <Field label="Employment type">
          <Select
            value={employmentType}
            onValueChange={(v) => setEmploymentType(v as EmploymentType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {employmentTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {employmentTypeLabels[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Work mode">
          <Select value={workMode} onValueChange={(v) => setWorkMode(v as WorkMode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workModes.map((m) => (
                <SelectItem key={m} value={m}>
                  {workModeLabels[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Openings">
          <Input
            type="number"
            min={1}
            max={1000}
            value={openings}
            onChange={(e) => setOpenings(Math.max(1, Number(e.target.value) || 1))}
          />
        </Field>
        <Field label="Experience range (years)">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={0}
              max={20}
              value={minExperienceYears}
              onChange={(e) => setMinExperienceYears(Math.max(0, Number(e.target.value) || 0))}
              aria-label="Minimum experience years"
            />
            <Input
              type="number"
              min={0}
              max={25}
              value={maxExperienceYears}
              onChange={(e) => setMaxExperienceYears(Math.max(0, Number(e.target.value) || 0))}
              aria-label="Maximum experience years"
            />
          </div>
        </Field>
      </div>

      <div className="space-y-3 rounded-lg border bg-secondary/20 p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox
            checked={salaryVisible}
            onCheckedChange={(checked) => setSalaryVisible(Boolean(checked))}
          />
          Display compensation range on listing
        </label>
        {salaryVisible ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Min salary (INR)">
              <Input value={minSalary} onChange={(e) => setMinSalary(e.target.value)} />
            </Field>
            <Field label="Max salary (INR)">
              <Input value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} />
            </Field>
            <Field label="Period">
              <Select
                value={salaryPeriod}
                onValueChange={(v) => setSalaryPeriod(v as "MONTH" | "YEAR")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YEAR">Per year</SelectItem>
                  <SelectItem value="MONTH">Per month</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        ) : null}
      </div>

      <Field label="Responsibilities" hint="Optional key outcomes and duties">
        <Textarea
          rows={3}
          value={responsibilities}
          onChange={(e) => setResponsibilities(e.target.value)}
          placeholder="Own backend services, write integration tests, collaborate with product."
        />
      </Field>

      <Field label="Skills from HiLabs catalog" hint="Select relevant skills">
        <Input
          value={skillSearch}
          onChange={(e) => setSkillSearch(e.target.value)}
          placeholder="Filter catalog skills (e.g. TypeScript, PostgreSQL)…"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(catalog.data ?? []).slice(0, 18).map((skill) => {
            const active = selectedSkills.some((s) => s.skillId === skill.id);
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id, skill.name)}
                aria-pressed={active}
                className={
                  active
                    ? "rounded-full border border-brand bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand"
                    : "rounded-full border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground hover:bg-accent"
                }
              >
                {skill.name} {active ? "✓" : "+"}
              </button>
            );
          })}
          {!catalog.isLoading && (catalog.data ?? []).length === 0 ? (
            <span className="text-xs text-muted-foreground">
              No matching skills found in catalog.
            </span>
          ) : null}
        </div>
      </Field>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <Button type="button" onClick={submit} disabled={pending} size="lg">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </div>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">
        {label}
        {hint ? <span className="ml-2 font-normal text-muted-foreground">{hint}</span> : null}
      </Label>
      {children}
    </div>
  );
}
