"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RequireRole, PortalPageHeader } from "@/components/shared/app-shell";
import { StudentPortalShell } from "@/components/shared/portal-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEducation,
  createExperience,
  createProject,
  deleteEducation,
  deleteExperience,
  deleteProject,
} from "@/lib/api/endpoints";
import {
  useReplaceStudentPreferences,
  useReplaceStudentSkills,
  useSkillCatalog,
  useStudentEducations,
  useStudentExperiences,
  useStudentPreferences,
  useStudentProfile,
  useStudentProjects,
  useStudentSkills,
  useUpdateStudentProfile,
} from "@/lib/api/queries";
import type {
  EducationEntry,
  EmploymentType,
  ExperienceEntry,
  ProjectEntry,
  StudentPreferences,
  StudentProfile,
  StudentSkill,
  WorkMode,
} from "@/lib/api/types";
import { employmentTypeLabels, workModeLabels } from "@/lib/format";

export default function StudentProfilePage() {
  return (
    <RequireRole roles={["STUDENT"]}>
      {(user) => (
        <StudentPortalShell user={user}>
          <StudentProfileBody />
        </StudentPortalShell>
      )}
    </RequireRole>
  );
}

function StudentProfileBody() {
  const profileQuery = useStudentProfile();
  const skillsQuery = useStudentSkills();
  const prefsQuery = useStudentPreferences();
  const educationsQuery = useStudentEducations();
  const experiencesQuery = useStudentExperiences();
  const projectsQuery = useStudentProjects();

  return (
    <div>
      <PortalPageHeader
        title="My profile"
        description="Keep your profile, skills, and job preferences updated so verified employers can discover and shortlist you."
      />

      <Tabs defaultValue="basics" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="basics">Basics &amp; links</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="background">Education, work &amp; projects</TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          {profileQuery.isLoading ? (
            <div className="h-64 animate-pulse rounded-xl border bg-muted/40" />
          ) : profileQuery.data ? (
            <BasicProfileForm
              key={profileQuery.data.etag ?? profileQuery.dataUpdatedAt}
              initial={profileQuery.data.data}
              etag={profileQuery.data.etag ?? ""}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="skills">
          {skillsQuery.isLoading ? (
            <div className="h-52 animate-pulse rounded-xl border bg-muted/40" />
          ) : skillsQuery.data ? (
            <SkillsEditor
              key={skillsQuery.data.etag ?? skillsQuery.dataUpdatedAt}
              initial={skillsQuery.data.data}
              etag={skillsQuery.data.etag ?? ""}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="preferences">
          {prefsQuery.isLoading ? (
            <div className="h-56 animate-pulse rounded-xl border bg-muted/40" />
          ) : prefsQuery.data ? (
            <PreferencesEditor
              key={prefsQuery.data.etag ?? prefsQuery.dataUpdatedAt}
              initial={prefsQuery.data.data}
              etag={prefsQuery.data.etag ?? ""}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="background" className="space-y-6">
          <BackgroundSections
            educations={educationsQuery.data ?? []}
            experiences={experiencesQuery.data ?? []}
            projects={projectsQuery.data ?? []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BasicProfileForm({ initial, etag }: { initial: StudentProfile; etag: string }) {
  const updateProfile = useUpdateStudentProfile();
  const [firstName, setFirstName] = useState(initial.firstName ?? "");
  const [lastName, setLastName] = useState(initial.lastName ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [headline, setHeadline] = useState(initial.headline ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [experienceLevel, setExperienceLevel] = useState<"FRESHER" | "EXPERIENCED">(
    initial.experienceLevel ?? "FRESHER",
  );
  const [discoverable, setDiscoverable] = useState(Boolean(initial.discoverable ?? true));
  const [githubUrl, setGithubUrl] = useState(initial.profileData?.githubUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initial.profileData?.linkedinUrl ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(initial.profileData?.portfolioUrl ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error("First name is required.");
      return;
    }
    updateProfile.mutate(
      {
        ifMatch: etag,
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim() || null,
          phone: phone.trim() || null,
          headline: headline.trim() || null,
          location: location.trim() || null,
          bio: bio.trim() || null,
          experienceLevel,
          discoverable,
          profileData: {
            ...(githubUrl.trim() ? { githubUrl: githubUrl.trim() } : {}),
            ...(linkedinUrl.trim() ? { linkedinUrl: linkedinUrl.trim() } : {}),
            ...(portfolioUrl.trim() ? { portfolioUrl: portfolioUrl.trim() } : {}),
          },
        },
      },
      {
        onSuccess: () => toast.success("Profile saved"),
        onError: (err) =>
          toast.error("Failed to save profile", { description: (err as Error).message }),
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-5 rounded-xl border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sp-first" className="mb-1.5 block">
            First name
          </Label>
          <Input
            id="sp-first"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="sp-last" className="mb-1.5 block">
            Last name
          </Label>
          <Input id="sp-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="sp-phone" className="mb-1.5 block">
            Phone
          </Label>
          <Input
            id="sp-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sp-loc" className="mb-1.5 block">
            Current location
          </Label>
          <Input
            id="sp-loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Bengaluru, India"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="sp-headline" className="mb-1.5 block">
            Headline
          </Label>
          <Input
            id="sp-headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Full-stack graduate · TypeScript & Postgres"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Experience level</Label>
          <Select
            value={experienceLevel}
            onValueChange={(v) => setExperienceLevel(v as "FRESHER" | "EXPERIENCED")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FRESHER">Fresher / New graduate</SelectItem>
              <SelectItem value="EXPERIENCED">Experienced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={discoverable}
              onCheckedChange={(checked) => setDiscoverable(Boolean(checked))}
            />
            Allow verified employers to discover me in talent search
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="sp-bio" className="mb-1.5 block">
          Summary / Bio
        </Label>
        <Textarea id="sp-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      <fieldset className="grid gap-4 border-t pt-4 sm:grid-cols-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Links
        </legend>
        <div>
          <Label htmlFor="sp-gh" className="mb-1.5 block">
            GitHub URL
          </Label>
          <Input
            id="sp-gh"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <Label htmlFor="sp-li" className="mb-1.5 block">
            LinkedIn URL
          </Label>
          <Input
            id="sp-li"
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
        <div>
          <Label htmlFor="sp-pf" className="mb-1.5 block">
            Portfolio URL
          </Label>
          <Input
            id="sp-pf"
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </fieldset>

      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

function SkillsEditor({ initial, etag }: { initial: StudentSkill[]; etag: string }) {
  const [filter, setFilter] = useState("");
  const catalog = useSkillCatalog(filter.trim() || undefined);
  const replaceSkills = useReplaceStudentSkills();
  const [selected, setSelected] = useState<StudentSkill[]>(initial);

  const toggle = (skillId: string, name: string) => {
    setSelected((prev) =>
      prev.some((s) => s.skillId === skillId)
        ? prev.filter((s) => s.skillId !== skillId)
        : [...prev, { skillId, name }],
    );
  };

  const save = () => {
    replaceSkills.mutate(
      {
        ifMatch: etag,
        skills: selected.map((s) => ({
          skillId: s.skillId,
          ...(s.proficiency ? { proficiency: s.proficiency } : {}),
          ...(s.yearsExperience ? { yearsExperience: s.yearsExperience } : {}),
        })),
      },
      {
        onSuccess: () => toast.success("Skills updated"),
        onError: (err) =>
          toast.error("Failed to save skills", { description: (err as Error).message }),
      },
    );
  };

  return (
    <div className="space-y-5 rounded-xl border bg-card p-6">
      <div>
        <p className="text-sm font-semibold">Selected skills ({selected.length})</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.length === 0 ? (
            <span className="text-xs text-muted-foreground">No skills selected yet.</span>
          ) : (
            selected.map((s) => (
              <button
                key={s.skillId}
                type="button"
                onClick={() => toggle(s.skillId, s.name)}
                className="rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand"
              >
                {s.name} ×
              </button>
            ))
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="skill-search" className="mb-1.5 block">
          Browse HiLabs skill catalog
        </Label>
        <Input
          id="skill-search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search skills (e.g. Python, SQL, React)…"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(catalog.data ?? []).slice(0, 30).map((skill) => {
            const active = selected.some((s) => s.skillId === skill.id);
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggle(skill.id, skill.name)}
                className={
                  active
                    ? "rounded-full border border-brand bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand"
                    : "rounded-full border bg-secondary px-2.5 py-1 text-xs font-medium hover:bg-accent"
                }
              >
                {skill.name} {active ? "✓" : "+"}
              </button>
            );
          })}
        </div>
      </div>

      <Button type="button" onClick={save} disabled={replaceSkills.isPending}>
        {replaceSkills.isPending ? "Saving…" : "Save skills"}
      </Button>
    </div>
  );
}

function PreferencesEditor({ initial, etag }: { initial: StudentPreferences; etag: string }) {
  const replacePrefs = useReplaceStudentPreferences();
  const [titles, setTitles] = useState((initial.preferredTitles ?? []).join(", "));
  const [locations, setLocations] = useState((initial.preferredLocations ?? []).join(", "));
  const [workModes, setWorkModes] = useState<WorkMode[]>(initial.workModes ?? []);
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>(
    initial.employmentTypes ?? [],
  );
  const [minSalary, setMinSalary] = useState(initial.minSalary ?? "");

  const toggleWorkMode = (mode: WorkMode) => {
    setWorkModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };
  const toggleEmpType = (type: EmploymentType) => {
    setEmploymentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    replacePrefs.mutate(
      {
        ifMatch: etag,
        body: {
          preferredTitles: titles
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          preferredLocations: locations
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          workModes,
          employmentTypes,
          minSalary: minSalary.trim() || null,
          salaryCurrency: "INR",
        },
      },
      {
        onSuccess: () => toast.success("Preferences saved"),
        onError: (err) =>
          toast.error("Failed to save preferences", { description: (err as Error).message }),
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-5 rounded-xl border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="pref-titles" className="mb-1.5 block">
            Preferred job titles (comma-separated)
          </Label>
          <Input
            id="pref-titles"
            value={titles}
            onChange={(e) => setTitles(e.target.value)}
            placeholder="Backend Engineer, Data Analyst"
          />
        </div>
        <div>
          <Label htmlFor="pref-locs" className="mb-1.5 block">
            Preferred locations (comma-separated)
          </Label>
          <Input
            id="pref-locs"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            placeholder="Bengaluru, Hyderabad, Remote"
          />
        </div>
        <div>
          <Label htmlFor="pref-sal" className="mb-1.5 block">
            Minimum expected salary (INR, optional)
          </Label>
          <Input
            id="pref-sal"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            placeholder="600000"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset className="space-y-2">
          <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Work modes
          </legend>
          {(Object.keys(workModeLabels) as WorkMode[]).map((mode) => (
            <label key={mode} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={workModes.includes(mode)}
                onCheckedChange={() => toggleWorkMode(mode)}
              />
              {workModeLabels[mode]}
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Employment types
          </legend>
          {(Object.keys(employmentTypeLabels) as EmploymentType[]).map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={employmentTypes.includes(type)}
                onCheckedChange={() => toggleEmpType(type)}
              />
              {employmentTypeLabels[type]}
            </label>
          ))}
        </fieldset>
      </div>

      <Button type="submit" disabled={replacePrefs.isPending}>
        {replacePrefs.isPending ? "Saving…" : "Save preferences"}
      </Button>
    </form>
  );
}

function BackgroundSections({
  educations,
  experiences,
  projects,
}: {
  educations: EducationEntry[];
  experiences: ExperienceEntry[];
  projects: ProjectEntry[];
}) {
  const queryClient = useQueryClient();

  const [edu, setEdu] = useState({ institution: "", degree: "", fieldOfStudy: "", grade: "" });
  const [exp, setExp] = useState({ employer: "", jobTitle: "", location: "" });
  const [proj, setProj] = useState({
    title: "",
    description: "",
    projectUrl: "",
    repositoryUrl: "",
  });

  const addEdu = useMutation({
    mutationFn: () =>
      createEducation({
        institution: edu.institution.trim(),
        degree: edu.degree.trim() || null,
        fieldOfStudy: edu.fieldOfStudy.trim() || null,
        grade: edu.grade.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Education added");
      setEdu({ institution: "", degree: "", fieldOfStudy: "", grade: "" });
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeEdu = useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student"] }),
  });

  const addExp = useMutation({
    mutationFn: () =>
      createExperience({
        employer: exp.employer.trim(),
        jobTitle: exp.jobTitle.trim(),
        employmentType: "INTERNSHIP",
        location: exp.location.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Experience added");
      setExp({ employer: "", jobTitle: "", location: "" });
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeExp = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student"] }),
  });

  const addProj = useMutation({
    mutationFn: () =>
      createProject({
        title: proj.title.trim(),
        description: proj.description.trim() || null,
        projectUrl: proj.projectUrl.trim() || null,
        repositoryUrl: proj.repositoryUrl.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Project added");
      setProj({ title: "", description: "", projectUrl: "", repositoryUrl: "" });
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeProj = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student"] }),
  });

  return (
    <>
      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-base font-bold">Education</h2>
        {educations.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
          >
            <div>
              <p className="font-semibold">{item.institution}</p>
              <p className="text-xs text-muted-foreground">
                {[item.degree, item.fieldOfStudy, item.grade].filter(Boolean).join(" · ")}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeEdu.mutate(item.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <div className="grid gap-3 border-t pt-4 sm:grid-cols-4">
          <Input
            placeholder="Institution *"
            value={edu.institution}
            onChange={(e) => setEdu({ ...edu, institution: e.target.value })}
          />
          <Input
            placeholder="Degree"
            value={edu.degree}
            onChange={(e) => setEdu({ ...edu, degree: e.target.value })}
          />
          <Input
            placeholder="Field of study"
            value={edu.fieldOfStudy}
            onChange={(e) => setEdu({ ...edu, fieldOfStudy: e.target.value })}
          />
          <div className="flex gap-2">
            <Input
              placeholder="CGPA / Grade"
              value={edu.grade}
              onChange={(e) => setEdu({ ...edu, grade: e.target.value })}
            />
            <Button
              type="button"
              disabled={!edu.institution.trim() || addEdu.isPending}
              onClick={() => addEdu.mutate()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-base font-bold">Work &amp; internships</h2>
        {experiences.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
          >
            <div>
              <p className="font-semibold">
                {item.jobTitle} · {item.employer}
              </p>
              <p className="text-xs text-muted-foreground">{item.location ?? "India"}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeExp.mutate(item.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <div className="grid gap-3 border-t pt-4 sm:grid-cols-3">
          <Input
            placeholder="Role title *"
            value={exp.jobTitle}
            onChange={(e) => setExp({ ...exp, jobTitle: e.target.value })}
          />
          <Input
            placeholder="Employer *"
            value={exp.employer}
            onChange={(e) => setExp({ ...exp, employer: e.target.value })}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Location"
              value={exp.location}
              onChange={(e) => setExp({ ...exp, location: e.target.value })}
            />
            <Button
              type="button"
              disabled={!exp.employer.trim() || !exp.jobTitle.trim() || addExp.isPending}
              onClick={() => addExp.mutate()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-base font-bold">Projects</h2>
        {projects.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
          >
            <div>
              <p className="font-semibold">{item.title}</p>
              {item.description ? (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeProj.mutate(item.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <div className="grid gap-3 border-t pt-4 sm:grid-cols-3">
          <Input
            placeholder="Project title *"
            value={proj.title}
            onChange={(e) => setProj({ ...proj, title: e.target.value })}
          />
          <Input
            placeholder="Repository or demo URL"
            value={proj.repositoryUrl}
            onChange={(e) => setProj({ ...proj, repositoryUrl: e.target.value })}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Short description"
              value={proj.description}
              onChange={(e) => setProj({ ...proj, description: e.target.value })}
            />
            <Button
              type="button"
              disabled={!proj.title.trim() || addProj.isPending}
              onClick={() => addProj.mutate()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
