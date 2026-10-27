// In-memory mock data layer. Reads return promises (simulated latency);
// mutations mutate the singleton db so the UI reacts after router.invalidate().
import { createSeedDb, STUDENT_ID, type MockDb } from "./seed";
import type {
  Application,
  ApplicationStatus,
  Company,
  CompanyStatus,
  Job,
  JobStatus,
  MembershipRequest,
  NotificationItem,
  PlatformUser,
  Resume,
  SavedJob,
  StudentProfile,
  StudentSkill,
} from "./types";

let db: MockDb = createSeedDb();

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));
const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export interface JobInput {
  title: string;
  description: string;
  responsibilities: string[];
  location: string;
  employmentType: Job["employmentType"];
  workMode: Job["workMode"];
  minExperience: number;
  maxExperience: number;
  minSalary: number;
  maxSalary: number;
  skills: string[];
  deadline: string;
}

export function hydrateExternal(input: { companies: Company[]; users: PlatformUser[] }) {
  for (const c of input.companies) if (!db.companies.some((x) => x.id === c.id)) db.companies.push(c);
  for (const u of input.users) if (!db.users.some((x) => x.id === u.id)) db.users.push(u);
}

export function findUserByEmailSync(email: string): PlatformUser | undefined {
  const normalized = email.trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === normalized);
}

function findJob(id: string): Job | undefined {
  return db.jobs.find((j) => j.id === id);
}

function sortDesc<T>(items: T[], key: (item: T) => string): T[] {
  return [...items].sort((a, b) => key(b).localeCompare(key(a)));
}

// ---------- reads ----------

export async function listJobs(opts: { includeAll?: boolean } = {}): Promise<Job[]> {
  await delay();
  return sortDesc(
    db.jobs.filter((j) => (opts.includeAll ? j.status !== "ARCHIVED" : j.status === "PUBLISHED")),
    (j) => j.createdAt,
  );
}

export async function listJobsForCompany(companyId: string): Promise<Job[]> {
  await delay();
  return sortDesc(
    db.jobs.filter((j) => j.companyId === companyId && j.status !== "ARCHIVED"),
    (j) => j.createdAt,
  );
}

export async function getJob(id: string): Promise<Job | undefined> {
  await delay();
  return findJob(id);
}

export async function getCompany(id: string): Promise<Company | undefined> {
  await delay();
  return db.companies.find((c) => c.id === id);
}

export async function listCompanies(): Promise<Company[]> {
  await delay();
  return sortDesc(db.companies, (c) => c.submittedAt);
}

export async function listApplications(): Promise<Application[]> {
  await delay();
  return sortDesc(db.applications, (a) => a.appliedAt);
}

export async function listApplicationsForStudent(studentId: string): Promise<Application[]> {
  await delay();
  return sortDesc(
    db.applications.filter((a) => a.studentId === studentId),
    (a) => a.appliedAt,
  );
}

export async function listApplicationsForCompany(companyId: string): Promise<Application[]> {
  await delay();
  return sortDesc(
    db.applications.filter((a) => findJob(a.jobId)?.companyId === companyId),
    (a) => a.appliedAt,
  );
}

export async function getApplication(id: string): Promise<Application | undefined> {
  await delay();
  return db.applications.find((a) => a.id === id);
}

export async function listResumes(studentId: string): Promise<Resume[]> {
  await delay();
  return sortDesc(
    db.resumes.filter((r) => r.studentId === studentId),
    (r) => r.uploadedAt,
  );
}

export async function getStudentProfile(): Promise<StudentProfile> {
  await delay();
  return { ...db.profile, links: { ...db.profile.links } };
}

export async function getStudentSkills(): Promise<StudentSkill[]> {
  await delay();
  return [...db.skills];
}

export async function listSavedJobs(studentId: string): Promise<SavedJob[]> {
  await delay();
  return db.savedJobs.filter((s) => s.studentId === studentId);
}

export async function listMembershipRequests(
  opts: { userId?: string; companyId?: string } = {},
): Promise<MembershipRequest[]> {
  await delay();
  return sortDesc(
    db.membershipRequests.filter(
      (m) =>
        (!opts.userId || m.userId === opts.userId) &&
        (!opts.companyId || m.companyId === opts.companyId),
    ),
    (m) => m.requestedAt,
  );
}

export async function listPlatformUsers(): Promise<PlatformUser[]> {
  await delay();
  return sortDesc(db.users, (u) => u.createdAt);
}

export async function listNotifications(userId: string): Promise<NotificationItem[]> {
  await delay();
  return sortDesc(
    db.notifications.filter((n) => n.userId === userId),
    (n) => n.createdAt,
  );
}

export async function getCompanyMembers(companyId: string): Promise<PlatformUser[]> {
  await delay();
  const company = db.companies.find((c) => c.id === companyId);
  const members: PlatformUser[] = [];
  if (company) {
    const owner = db.users.find(
      (u) => u.email.toLowerCase() === company.ownerEmail.toLowerCase(),
    );
    if (owner) members.push(owner);
  }
  const approvedHrIds = new Set(
    db.membershipRequests
      .filter(
        (m) =>
          m.companyId === companyId &&
          m.companyStage === "APPROVED" &&
          m.platformStage === "APPROVED",
      )
      .map((m) => m.userId),
  );
  for (const u of db.users) if (approvedHrIds.has(u.id)) members.push(u);
  return members;
}

// ---------- student mutations ----------

export async function applyToJob(input: {
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  resumeId: string;
  coverLetter: string;
}): Promise<Application> {
  await delay(400);
  const job = findJob(input.jobId);
  if (!job || job.status !== "PUBLISHED") throw new Error("This job is no longer accepting applications.");
  if (db.applications.some((a) => a.jobId === input.jobId && a.studentId === input.studentId)) {
    throw new Error("You have already applied to this job.");
  }
  const resume = db.resumes.find((r) => r.id === input.resumeId);
  const profile = db.profile;
  const application: Application = {
    id: uid("a"),
    jobId: input.jobId,
    studentId: input.studentId,
    studentName: input.studentName,
    studentEmail: input.studentEmail,
    status: "APPLIED",
    appliedAt: new Date().toISOString(),
    resumeId: input.resumeId,
    resumeLabel: resume?.fileName ?? "resume.pdf",
    coverLetter: input.coverLetter,
    snapshot: {
      fullName: input.studentName,
      email: input.studentEmail,
      headline: profile.headline,
      location: profile.location,
      skills: db.skills.map((s) => s.name),
    },
    notes: [],
  };
  db.applications.push(application);
  job.applicantCount += 1;
  db.notifications.push({
    id: uid("nt"),
    userId: input.studentId,
    text: `Application submitted for ${job.title} at ${companyName(job.companyId)}.`,
    createdAt: new Date().toISOString(),
    read: false,
  });
  return application;
}

export async function withdrawApplication(applicationId: string, studentId: string): Promise<void> {
  await delay();
  const app = db.applications.find((a) => a.id === applicationId);
  if (!app || app.studentId !== studentId) throw new Error("Application not found.");
  app.status = "WITHDRAWN";
}

export async function toggleSaveJob(jobId: string, studentId: string): Promise<boolean> {
  await delay(120);
  const existing = db.savedJobs.find((s) => s.jobId === jobId && s.studentId === studentId);
  if (existing) {
    db.savedJobs = db.savedJobs.filter((s) => s !== existing);
    return false;
  }
  const saved: SavedJob = { jobId, studentId, savedAt: new Date().toISOString() };
  db.savedJobs.push(saved);
  return true;
}

export async function uploadResume(input: { studentId: string; fileName: string }): Promise<Resume> {
  await delay(300);
  const version = Math.max(0, ...db.resumes.map((r) => r.version)) + 1;
  const resume: Resume = {
    id: uid("r"),
    studentId: input.studentId,
    version,
    fileName: input.fileName,
    uploadedAt: new Date().toISOString(),
    parseStatus: "PENDING",
    isDefault: false,
  };
  db.resumes.push(resume);
  // Simulated async parsing: flips to PARSED a couple of seconds later.
  setTimeout(() => {
    resume.parseStatus = "PARSED";
    resume.parsedData = {
      fullName: `${db.profile.firstName} ${db.profile.lastName}`,
      headline: db.profile.headline,
      skills: db.skills.map((s) => s.name),
      experience: "Software Intern, Finlabs (6 mo)",
      education: "B.E. Computer Science",
    };
  }, 2500);
  return resume;
}

export async function setDefaultResume(resumeId: string, studentId: string): Promise<void> {
  await delay();
  for (const r of db.resumes) {
    if (r.studentId === studentId) r.isDefault = r.id === resumeId;
  }
}

export async function deleteResume(resumeId: string, studentId: string): Promise<void> {
  await delay();
  const resume = db.resumes.find((r) => r.id === resumeId);
  if (!resume || resume.studentId !== studentId) throw new Error("Resume not found.");
  if (resume.isDefault && db.resumes.filter((r) => r.studentId === studentId).length > 1) {
    const next = db.resumes.find((r) => r.studentId === studentId && r.id !== resumeId);
    if (next) next.isDefault = true;
  }
  db.resumes = db.resumes.filter((r) => r.id !== resumeId);
}

export async function updateStudentProfile(patch: Partial<StudentProfile>): Promise<StudentProfile> {
  await delay(300);
  db.profile = { ...db.profile, ...patch, links: { ...db.profile.links, ...patch.links } };
  return { ...db.profile };
}

export async function upsertStudentSkill(skill: {
  id?: string;
  name: string;
  proficiency: number;
  yearsExperience: number;
}): Promise<void> {
  await delay(200);
  if (skill.id) {
    const existing = db.skills.find((s) => s.id === skill.id);
    if (existing) Object.assign(existing, skill);
  } else {
    db.skills.push({ id: uid("s"), name: skill.name, proficiency: skill.proficiency, yearsExperience: skill.yearsExperience });
  }
}

export async function removeStudentSkill(id: string): Promise<void> {
  await delay(150);
  db.skills = db.skills.filter((s) => s.id !== id);
}

// ---------- company mutations ----------

export async function createJob(companyId: string, input: JobInput): Promise<Job> {
  await delay(350);
  const job: Job = {
    id: uid("j"),
    companyId,
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    applicantCount: 0,
    currency: "INR",
    ...input,
  };
  db.jobs.push(job);
  return job;
}

export async function updateJob(jobId: string, patch: Partial<JobInput>): Promise<Job> {
  await delay(350);
  const job = findJob(jobId);
  if (!job) throw new Error("Job not found.");
  Object.assign(job, patch);
  return job;
}

export async function setJobStatus(jobId: string, status: JobStatus): Promise<Job> {
  await delay(200);
  const job = findJob(jobId);
  if (!job) throw new Error("Job not found.");
  job.status = status;
  return job;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
): Promise<Application> {
  await delay(250);
  const app = db.applications.find((a) => a.id === applicationId);
  if (!app) throw new Error("Application not found.");
  app.status = status;
  const job = findJob(app.jobId);
  if (job) {
    db.notifications.push({
      id: uid("nt"),
      userId: app.studentId,
      text: `Your application for ${job.title} moved to ${status.replaceAll("_", " ").toLowerCase()}.`,
      createdAt: new Date().toISOString(),
      read: false,
    });
  }
  return app;
}

export async function addApplicationNote(
  applicationId: string,
  text: string,
  authorName: string,
): Promise<void> {
  await delay(200);
  const app = db.applications.find((a) => a.id === applicationId);
  if (!app) throw new Error("Application not found.");
  app.notes.push({ id: uid("n"), authorName, createdAt: new Date().toISOString(), text });
}

export async function updateCompanyProfile(
  companyId: string,
  patch: Partial<Pick<Company, "name" | "description" | "website" | "location">>,
): Promise<Company> {
  await delay(300);
  const company = db.companies.find((c) => c.id === companyId);
  if (!company) throw new Error("Company not found.");
  Object.assign(company, patch);
  return company;
}

export async function registerCompanyAndOwner(input: {
  owner: { firstName: string; lastName: string; email: string };
  company: { name: string; location: string; website: string; description: string };
}): Promise<{ company: Company; user: PlatformUser }> {
  await delay(400);
  if (findUserByEmailSync(input.owner.email)) {
    throw new Error("An account with this email already exists. Sign in instead.");
  }
  const company: Company = {
    id: uid("c"),
    name: input.company.name,
    slug: input.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: input.company.description,
    website: input.company.website,
    location: input.company.location,
    logoText: input.company.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase(),
    status: "PENDING",
    ownerEmail: input.owner.email,
    submittedAt: new Date().toISOString(),
    verified: false,
  };
  const user: PlatformUser = {
    id: uid("u"),
    email: input.owner.email,
    firstName: input.owner.firstName,
    lastName: input.owner.lastName,
    role: "OWNER",
    emailVerified: false,
    active: true,
    createdAt: new Date().toISOString(),
  };
  db.companies.push(company);
  db.users.push(user);
  return { company, user };
}

export async function registerStudentUser(input: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<PlatformUser> {
  await delay(300);
  if (findUserByEmailSync(input.email)) {
    throw new Error("An account with this email already exists. Sign in instead.");
  }
  const user: PlatformUser = {
    id: uid("u"),
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    role: "STUDENT",
    emailVerified: false,
    active: true,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  return user;
}

export async function markUserVerified(email: string): Promise<void> {
  const user = findUserByEmailSync(email);
  if (user) user.emailVerified = true;
}

export async function createMembershipRequest(input: {
  user: PlatformUser;
  companyId: string;
  note?: string;
}): Promise<MembershipRequest> {
  await delay(350);
  const company = db.companies.find((c) => c.id === input.companyId);
  if (!company) throw new Error("Company not found.");
  if (company.status !== "APPROVED") throw new Error("This company is not verified on the platform yet.");
  if (db.membershipRequests.some((m) => m.userId === input.user.id && m.companyId === input.companyId && m.companyStage === "PENDING")) {
    throw new Error(`You already have a pending request for ${company.name}.`);
  }
  const request: MembershipRequest = {
    id: uid("m"),
    userId: input.user.id,
    userName: `${input.user.firstName} ${input.user.lastName}`,
    userEmail: input.user.email,
    companyId,
    companyName: company.name,
    requestedRole: "HR",
    note: input.note,
    companyStage: "PENDING",
    platformStage: "PENDING",
    requestedAt: new Date().toISOString(),
  };
  db.membershipRequests.push(request);
  return request;
}

export async function setMembershipRequestStage(
  id: string,
  stage: "companyStage" | "platformStage",
  decision: "APPROVED" | "REJECTED",
): Promise<MembershipRequest> {
  await delay(250);
  const request = db.membershipRequests.find((m) => m.id === id);
  if (!request) throw new Error("Request not found.");
  request[stage] = decision;
  if (request.reason === undefined && decision === "REJECTED") request.reason = "Did not meet requirements.";
  if (request.companyStage === "APPROVED" && request.platformStage === "APPROVED") {
    const user = db.users.find((u) => u.id === request.userId);
    if (user && user.role === "STUDENT") user.role = "HR";
  }
  return request;
}

// ---------- admin mutations ----------

export async function adminSetCompanyStatus(
  companyId: string,
  status: CompanyStatus,
  reason?: string,
): Promise<Company> {
  await delay(250);
  const company = db.companies.find((c) => c.id === companyId);
  if (!company) throw new Error("Company not found.");
  company.status = status;
  if (status === "SUSPENDED" && reason) company.suspensionReason = reason;
  if (status !== "SUSPENDED") delete company.suspensionReason;
  return company;
}

export async function adminSetCompanyVerified(companyId: string, verified: boolean): Promise<Company> {
  await delay(200);
  const company = db.companies.find((c) => c.id === companyId);
  if (!company) throw new Error("Company not found.");
  company.verified = verified;
  return company;
}

export async function adminUpdateUser(
  userId: string,
  patch: Partial<Pick<PlatformUser, "active" | "emailVerified" | "role">>,
): Promise<PlatformUser> {
  await delay(200);
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");
  Object.assign(user, patch);
  return user;
}

export async function markNotificationsRead(userId: string): Promise<void> {
  await delay(100);
  for (const n of db.notifications) if (n.userId === userId) n.read = true;
}

function companyName(companyId: string): string {
  return db.companies.find((c) => c.id === companyId)?.name ?? "the company";
}

export { STUDENT_ID };
