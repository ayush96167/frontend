import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmploymentType, WorkMode } from "@/lib/mock/types";
import { employmentTypeLabels, workModeLabels } from "@/lib/format";
import type { JobInput } from "@/lib/mock/api";

const employmentTypes = Object.keys(employmentTypeLabels) as EmploymentType[];
const workModes = Object.keys(workModeLabels) as WorkMode[];

export function JobForm({
  initial,
  submitLabel,
  onSubmit,
  pending,
}: {
  initial?: JobInput;
  submitLabel: string;
  onSubmit: (input: JobInput) => void;
  pending?: boolean;
}) {
  const [form, setForm] = useState<JobInput>(
    initial ?? {
      title: "",
      description: "",
      responsibilities: [""],
      location: "",
      employmentType: "FULL_TIME",
      workMode: "ONSITE",
      minExperience: 0,
      maxExperience: 3,
      minSalary: 300000,
      maxSalary: 800000,
      skills: [],
      deadline: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    },
  );
  const [skillDraft, setSkillDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof JobInput>(key: K, value: JobInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.title.trim()) return setError("Job title is required.");
    if (!form.description.trim()) return setError("Add a short description of the role.");
    if (!form.location.trim()) return setError("Location is required.");
    if (form.skills.length === 0) return setError("Add at least one required skill.");
    if (form.maxSalary < form.minSalary) return setError("Max salary must be at least the min salary.");
    if (form.maxExperience < form.minExperience) return setError("Max experience must be at least the min.");
    setError(null);
    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      responsibilities: form.responsibilities.map((r) => r.trim()).filter(Boolean),
      deadline: new Date(form.deadline).toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title" className="sm:col-span-2">
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Frontend Engineer (React)" />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What will this person do?" />
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Kochi, Kerala" />
        </Field>
        <Field label="Application deadline">
          <Input type="date" value={form.deadline.slice(0, 10)} onChange={(e) => set("deadline", e.target.value)} />
        </Field>
        <Field label="Employment type">
          <Select value={form.employmentType} onValueChange={(v) => set("employmentType", v as EmploymentType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {employmentTypes.map((t) => (
                <SelectItem key={t} value={t}>{employmentTypeLabels[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Work mode">
          <Select value={form.workMode} onValueChange={(v) => set("workMode", v as WorkMode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {workModes.map((m) => (
                <SelectItem key={m} value={m}>{workModeLabels[m]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Min experience (years)">
          <Input type="number" min={0} max={15} value={form.minExperience} onChange={(e) => set("minExperience", Number(e.target.value))} />
        </Field>
        <Field label="Max experience (years)">
          <Input type="number" min={0} max={15} value={form.maxExperience} onChange={(e) => set("maxExperience", Number(e.target.value))} />
        </Field>
        <Field label="Min salary (₹ / year)">
          <Input type="number" step={50000} value={form.minSalary} onChange={(e) => set("minSalary", Number(e.target.value))} />
        </Field>
        <Field label="Max salary (₹ / year)">
          <Input type="number" step={50000} value={form.maxSalary} onChange={(e) => set("maxSalary", Number(e.target.value))} />
        </Field>
      </div>

      <Field label="Responsibilities" hint="One per line.">
        <Textarea
          rows={4}
          value={form.responsibilities.join("\n")}
          onChange={(e) => set("responsibilities", e.target.value.split("\n"))}
          placeholder={"Ship features end-to-end\nOwn quality checks"}
        />
      </Field>

      <Field label="Required skills" hint="Press Add after typing each skill.">
        <div className="flex gap-2">
          <Input
            value={skillDraft}
            onChange={(e) => setSkillDraft(e.target.value)}
            placeholder="e.g. React"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addSkill}>
            Add
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {form.skills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => set("skills", form.skills.filter((s) => s !== skill))}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium hover:bg-destructive-soft hover:text-destructive"
            >
              {skill} ×
            </button>
          ))}
        </div>
      </Field>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <Button onClick={submit} disabled={pending} size="lg">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </div>
  );

  function addSkill() {
    const name = skillDraft.trim();
    if (!name) return;
    if (!form.skills.some((s) => s.toLowerCase() === name.toLowerCase())) {
      set("skills", [...form.skills, name]);
    }
    setSkillDraft("");
  }
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
