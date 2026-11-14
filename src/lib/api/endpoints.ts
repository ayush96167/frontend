import { apiRequest, type ApiResult } from "./client";
import type {
  AccountActivationPreview,
  AdminCompanyDetail,
  AdminCompanyInvitation,
  AdminCompanySummary,
  AdminStaffUser,
  ApplicationStatus,
  AuthUser,
  CatalogSkill,
  CompanyApplicationDetail,
  CompanyApplicationItem,
  CompanyApplicationNote,
  CompanyHrInvitation,
  CompanyInvitationPreview,
  CompanyJobSummary,
  CompanyMember,
  CompanyMembershipRequest,
  CompanyProfile,
  EducationEntry,
  EmploymentType,
  ExperienceEntry,
  FileUploadInit,
  HrInvitationPreview,
  Job,
  JobSalary,
  JobStatus,
  JobTargetStatus,
  LearnerType,
  NotificationItem,
  PlatformSettings,
  ProgramItem,
  ProjectEntry,
  ResumeItem,
  ResumeParseDetail,
  SavedJobItem,
  StudentAllowlistEntry,
  StudentEmailImport,
  StudentApplication,
  StudentApplicationDetail,
  StudentPreferences,
  StudentProfile,
  StudentRegistrationPreview,
  StudentSkill,
  StudentCompletion,
  TalentSearchCandidate,
  WorkMode,
} from "./types";

export type { JobTargetStatus } from "./types";

// --- Auth & Onboarding ---

export async function login(email: string, password: string) {
  return apiRequest<{ accessToken: string; expiresIn: number; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: { email, password },
    skipAuth: true,
  });
}

export async function getMe() {
  return apiRequest<AuthUser>("/auth/me");
}

export async function logout() {
  return apiRequest<void>("/auth/logout", { method: "POST" });
}

export async function logoutAll() {
  return apiRequest<void>("/auth/logout-all", { method: "POST" });
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  return apiRequest<void>("/auth/password/change", { method: "POST", body: input });
}

export async function requestStudentRegistration(email: string) {
  return apiRequest<{ message: string }>("/student-registrations", {
    method: "POST",
    body: { email },
    skipAuth: true,
  });
}

export async function getStudentRegistrationPreview(token: string) {
  return apiRequest<StudentRegistrationPreview>(
    `/student-registrations/${encodeURIComponent(token)}`,
    { skipAuth: true },
  );
}

export async function completeStudentRegistration(input: {
  token: string;
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}) {
  return apiRequest<{ accessToken: string; expiresIn: number; user: Partial<AuthUser> }>(
    "/student-registrations/complete",
    {
      method: "POST",
      body: input,
      skipAuth: true,
      idempotent: true,
    },
  );
}

export async function confirmEmailVerification(token: string) {
  return apiRequest<{ message: string; email: string }>("/auth/email-verification/confirm", {
    method: "POST",
    body: { token },
    skipAuth: true,
  });
}

export async function resendEmailVerification(email: string) {
  return apiRequest<{ message: string }>("/auth/email-verification/resend", {
    method: "POST",
    body: { email },
    skipAuth: true,
  });
}

export async function requestPasswordReset(email: string) {
  return apiRequest<{ message: string }>("/auth/password-reset/request", {
    method: "POST",
    body: { email },
    skipAuth: true,
  });
}

export async function confirmPasswordReset(input: { token: string; newPassword: string }) {
  return apiRequest<{ message: string }>("/auth/password-reset/confirm", {
    method: "POST",
    body: input,
    skipAuth: true,
  });
}

export async function getActivationPreview(token: string) {
  return apiRequest<AccountActivationPreview>(`/account-activations/${encodeURIComponent(token)}`, {
    skipAuth: true,
  });
}

export async function activateAccount(token: string, password: string) {
  return apiRequest<{ accessToken: string; expiresIn: number; user: AuthUser }>(
    `/account-activations/${encodeURIComponent(token)}`,
    {
      method: "POST",
      body: { password },
      skipAuth: true,
    },
  );
}

export async function getCompanyRegistrationInvitation(token: string) {
  return apiRequest<CompanyInvitationPreview>(
    `/company-registration-invitations/${encodeURIComponent(token)}`,
    { skipAuth: true },
  );
}

export async function registerCompanyWithInvitation(input: {
  invitationToken: string;
  name: string;
  website?: string;
  location?: string;
  linkedinUrl?: string;
  gstin?: string;
  emailDomains?: string[];
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}) {
  return apiRequest<{
    companyId: string;
    adminEmailVerificationRequired: boolean;
    status: string;
  }>("/company-registrations", {
    method: "POST",
    body: input,
    skipAuth: true,
  });
}

export async function getHrInvitationPreview(token: string) {
  return apiRequest<HrInvitationPreview>(`/hr-invitations/${encodeURIComponent(token)}`, {
    skipAuth: true,
  });
}

export async function acceptHrInvitation(
  token: string,
  input: { name: string; password: string; designation?: string; phone?: string },
) {
  return apiRequest<{ membershipRequestId: string; status: string; emailVerified: boolean }>(
    `/hr-invitations/${encodeURIComponent(token)}/accept`,
    {
      method: "POST",
      body: input,
      skipAuth: true,
    },
  );
}

// --- Jobs & Catalog ---

export async function searchJobs(query?: {
  q?: string | undefined;
  location?: string | undefined;
  skill?: string | undefined;
  workMode?: WorkMode | undefined;
  employmentType?: EmploymentType | undefined;
  companyId?: string | undefined;
  sort?: "recent" | "deadline" | undefined;
  limit?: number | undefined;
  cursor?: string | undefined;
}) {
  return apiRequest<Job[]>("/jobs", query ? { query } : {});
}

export async function getJob(jobId: string): Promise<ApiResult<Job>> {
  return apiRequest<Job>(`/jobs/${jobId}`);
}

export async function searchSkills(query?: string, limit = 50) {
  return apiRequest<CatalogSkill[]>("/skills", { query: { query, limit } });
}

// --- Student Endpoints ---

export async function getStudentProfile(): Promise<ApiResult<StudentProfile>> {
  return apiRequest<StudentProfile>("/students/me/profile");
}

export async function patchStudentProfile(
  body: Partial<
    Pick<
      StudentProfile,
      | "firstName"
      | "lastName"
      | "phone"
      | "headline"
      | "bio"
      | "location"
      | "dateOfBirth"
      | "discoverable"
      | "experienceLevel"
      | "profilePhotoFileId"
      | "profileData"
    >
  >,
  ifMatch: string,
): Promise<ApiResult<StudentProfile>> {
  return apiRequest<StudentProfile>("/students/me/profile", {
    method: "PATCH",
    body,
    ifMatch,
  });
}

export async function getStudentCompletion() {
  return apiRequest<StudentCompletion>("/students/me/profile/completion");
}

export async function getStudentPreferences(): Promise<ApiResult<StudentPreferences>> {
  return apiRequest<StudentPreferences>("/students/me/preferences");
}

export async function replaceStudentPreferences(
  body: StudentPreferences,
  ifMatch: string,
): Promise<ApiResult<StudentPreferences>> {
  return apiRequest<StudentPreferences>("/students/me/preferences", {
    method: "PUT",
    body,
    ifMatch,
  });
}

export async function getStudentSkills(): Promise<ApiResult<StudentSkill[]>> {
  return apiRequest<StudentSkill[]>("/students/me/skills");
}

export async function replaceStudentSkills(
  skills: { skillId: string; proficiency?: number | null; yearsExperience?: number | null }[],
  ifMatch: string,
): Promise<ApiResult<StudentSkill[]>> {
  return apiRequest<StudentSkill[]>("/students/me/skills", {
    method: "PUT",
    body: { skills },
    ifMatch,
  });
}

export async function listEducations() {
  return apiRequest<EducationEntry[]>("/students/me/educations");
}
export async function createEducation(body: Omit<EducationEntry, "id">) {
  return apiRequest<EducationEntry>("/students/me/educations", { method: "POST", body });
}
export async function updateEducation(id: string, body: Partial<Omit<EducationEntry, "id">>) {
  return apiRequest<EducationEntry>(`/students/me/educations/${id}`, { method: "PATCH", body });
}
export async function deleteEducation(id: string) {
  return apiRequest<void>(`/students/me/educations/${id}`, { method: "DELETE" });
}

export async function listExperiences() {
  return apiRequest<ExperienceEntry[]>("/students/me/experiences");
}
export async function createExperience(body: Omit<ExperienceEntry, "id">) {
  return apiRequest<ExperienceEntry>("/students/me/experiences", { method: "POST", body });
}
export async function updateExperience(id: string, body: Partial<Omit<ExperienceEntry, "id">>) {
  return apiRequest<ExperienceEntry>(`/students/me/experiences/${id}`, { method: "PATCH", body });
}
export async function deleteExperience(id: string) {
  return apiRequest<void>(`/students/me/experiences/${id}`, { method: "DELETE" });
}

export async function listProjects() {
  return apiRequest<ProjectEntry[]>("/students/me/projects");
}
export async function createProject(body: {
  title: string;
  description?: string | null;
  projectUrl?: string | null;
  repositoryUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  technologyIds?: string[];
}) {
  return apiRequest<ProjectEntry>("/students/me/projects", { method: "POST", body });
}
export async function deleteProject(id: string) {
  return apiRequest<void>(`/students/me/projects/${id}`, { method: "DELETE" });
}

export async function listResumes(limit = 50) {
  return apiRequest<ResumeItem[]>("/students/me/resumes", { query: { limit } });
}

export async function getResumeParse(resumeId: string) {
  return apiRequest<ResumeParseDetail>(`/students/me/resumes/${resumeId}/parse`);
}

export async function attachResume(fileId: string) {
  return apiRequest<ResumeItem>("/students/me/resumes", {
    method: "POST",
    body: { fileId },
    idempotent: true,
  });
}

export async function setCurrentResume(resumeId: string) {
  return apiRequest<void>(`/students/me/resumes/${resumeId}/current`, { method: "PUT" });
}

export async function deleteResume(resumeId: string) {
  return apiRequest<void>(`/students/me/resumes/${resumeId}`, { method: "DELETE" });
}

export async function initFileUpload(input: {
  purpose: "RESUME" | "PROFILE_PHOTO" | "COMPANY_LOGO" | "ALLOWLIST_CSV";
  filename: string;
  contentType: string;
  sizeBytes: number;
}) {
  return apiRequest<FileUploadInit>("/files/uploads", {
    method: "POST",
    body: input,
    idempotent: true,
  });
}

export async function completeFileUpload(fileId: string) {
  return apiRequest<{ id: string; status: string; virusScanStatus?: string }>(
    `/files/${fileId}/complete`,
    { method: "POST" },
  );
}

export async function getFileDownloadUrl(fileId: string) {
  return apiRequest<{ downloadUrl: string; expiresAt?: string }>(`/files/${fileId}/download`);
}

export async function uploadFileToR2(
  file: File,
  purpose: "RESUME" | "PROFILE_PHOTO" | "COMPANY_LOGO" | "ALLOWLIST_CSV",
): Promise<string> {
  const fallbackMime =
    purpose === "ALLOWLIST_CSV"
      ? "text/csv"
      : file.name.toLowerCase().endsWith(".docx")
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf";
  const contentType = purpose === "ALLOWLIST_CSV" ? "text/csv" : file.type || fallbackMime;

  const { data: init } = await initFileUpload({
    purpose,
    filename: file.name,
    contentType,
    sizeBytes: file.size,
  });

  const putResponse = await fetch(init.uploadUrl, {
    method: "PUT",
    headers: init.uploadHeaders,
    body: file,
  });

  if (!putResponse.ok) {
    throw new Error(
      `Direct storage upload failed (${putResponse.status}). Ensure Cloudflare R2 CORS allows PUT requests from this origin.`,
    );
  }

  await completeFileUpload(init.fileId);
  return init.fileId;
}

export async function listSavedJobs(limit = 50) {
  return apiRequest<SavedJobItem[]>("/students/me/saved-jobs", { query: { limit } });
}

export async function saveJob(jobId: string) {
  return apiRequest<void>(`/students/me/saved-jobs/${jobId}`, { method: "PUT" });
}

export async function unsaveJob(jobId: string) {
  return apiRequest<void>(`/students/me/saved-jobs/${jobId}`, { method: "DELETE" });
}

export async function listStudentApplications(limit = 50) {
  return apiRequest<StudentApplication[]>("/students/me/applications", { query: { limit } });
}

export async function getStudentApplication(applicationId: string) {
  return apiRequest<StudentApplicationDetail>(`/applications/${applicationId}`);
}

export async function applyToJob(jobId: string, body: { resumeId?: string; coverLetter?: string }) {
  return apiRequest<{ id: string; jobId: string; status: ApplicationStatus; appliedAt: string }>(
    `/jobs/${jobId}/applications`,
    {
      method: "POST",
      body,
      idempotent: true,
    },
  );
}

export async function withdrawApplication(
  applicationId: string,
  body?: {
    reason?: "OFFER_DECLINED" | "ACCEPTED_OTHER_OFFER" | "NOT_INTERESTED" | "OTHER";
    note?: string;
  },
) {
  return apiRequest<{ id: string; status: ApplicationStatus }>(
    `/applications/${applicationId}/withdrawal`,
    {
      method: "POST",
      body: body ?? {},
    },
  );
}

export async function listNotifications(unreadOnly = false, limit = 50) {
  return apiRequest<NotificationItem[]>("/notifications", { query: { unreadOnly, limit } });
}

export async function getUnreadNotificationCount() {
  return apiRequest<{ unreadCount: number }>("/notifications/unread-count");
}

export async function markNotificationRead(id: string) {
  return apiRequest<void>(`/notifications/${id}/read`, { method: "POST" });
}

export async function markAllNotificationsRead() {
  return apiRequest<{ updatedCount?: number }>("/notifications/read-all", { method: "POST" });
}

// --- Company Endpoints ---

export interface CreateCompanyJobPayload {
  title: string;
  description: string;
  responsibilities?: string;
  qualifications?: string;
  benefits?: string;
  openings?: number;
  locations: string[];
  employmentType: EmploymentType;
  workMode: WorkMode;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  skills: { skillId: string; mandatory: boolean }[];
  salary?: JobSalary;
  applicationDeadline: string;
}

export async function listMyCompanies() {
  return apiRequest<
    {
      companyId: string;
      name: string;
      slug: string;
      status: string;
      membershipRole: string;
      membershipStatus: string;
    }[]
  >("/companies/me");
}

export async function getCompany(companyId: string) {
  return apiRequest<CompanyProfile>(`/companies/${companyId}`);
}

export async function updateCompany(
  companyId: string,
  body: Partial<
    Pick<
      CompanyProfile,
      "name" | "website" | "linkedinUrl" | "location" | "description" | "industry" | "companySize"
    >
  >,
  ifMatch: string,
) {
  return apiRequest<CompanyProfile>(`/companies/${companyId}`, {
    method: "PATCH",
    body,
    ifMatch,
  });
}

export async function listCompanyJobs(companyId: string, status?: JobStatus, limit = 50) {
  return apiRequest<CompanyJobSummary[]>(`/companies/${companyId}/jobs`, {
    query: { status, limit },
  });
}

export async function getCompanyJob(companyId: string, jobId: string) {
  return apiRequest<Job>(`/companies/${companyId}/jobs/${jobId}`);
}

export async function createCompanyJob(companyId: string, body: CreateCompanyJobPayload) {
  return apiRequest<Job>(`/companies/${companyId}/jobs`, {
    method: "POST",
    body,
    idempotent: true,
  });
}

export async function updateCompanyJob(
  companyId: string,
  jobId: string,
  body: Partial<CreateCompanyJobPayload>,
  ifMatch: string,
) {
  return apiRequest<Job>(`/companies/${companyId}/jobs/${jobId}`, {
    method: "PATCH",
    body,
    ifMatch,
  });
}

export async function publishCompanyJob(companyId: string, jobId: string) {
  return apiRequest<Job>(`/companies/${companyId}/jobs/${jobId}/publication`, { method: "POST" });
}

export async function closeCompanyJob(companyId: string, jobId: string, reason?: string) {
  return apiRequest<Job>(`/companies/${companyId}/jobs/${jobId}/closure`, {
    method: "POST",
    body: reason ? { reason } : {},
  });
}

export async function transitionCompanyJob(
  companyId: string,
  jobId: string,
  toStatus: JobTargetStatus,
  reason?: string,
) {
  return apiRequest<Job>(`/companies/${companyId}/jobs/${jobId}/transitions`, {
    method: "POST",
    body: { toStatus, ...(reason ? { reason } : {}) },
  });
}

export async function deleteDraftJob(companyId: string, jobId: string) {
  return apiRequest<void>(`/companies/${companyId}/jobs/${jobId}`, { method: "DELETE" });
}

export async function listCompanyApplications(
  companyId: string,
  query?: {
    jobId?: string | undefined;
    stage?: ApplicationStatus[] | undefined;
    qualification?: "QUALIFIED" | "NOT_QUALIFIED" | undefined;
    query?: string | undefined;
    sort?: "appliedAt" | "qualification" | "matchScore" | undefined;
    limit?: number | undefined;
  },
) {
  return apiRequest<CompanyApplicationItem[]>(
    `/companies/${companyId}/applications`,
    query ? { query } : {},
  );
}

export async function getCompanyApplication(companyId: string, applicationId: string) {
  return apiRequest<CompanyApplicationDetail>(
    `/companies/${companyId}/applications/${applicationId}`,
  );
}

export async function transitionCompanyApplication(
  companyId: string,
  applicationId: string,
  body: {
    toStage: "UNDER_REVIEW" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "HIRED" | "REJECTED";
    reasonCode?:
      | "SKILLS_MISMATCH"
      | "EXPERIENCE_MISMATCH"
      | "POSITION_FILLED"
      | "INTERVIEW_NOT_CLEARED"
      | "NO_SHOW"
      | "OTHER";
    messageToCandidate?: string;
    notify?: boolean;
  },
  ifMatch: string,
) {
  return apiRequest<{ id: string; status: ApplicationStatus; updatedAt: string }>(
    `/companies/${companyId}/applications/${applicationId}/stage-transitions`,
    {
      method: "POST",
      body,
      ifMatch,
    },
  );
}

export async function listApplicationNotes(companyId: string, applicationId: string) {
  return apiRequest<CompanyApplicationNote[]>(
    `/companies/${companyId}/applications/${applicationId}/notes`,
  );
}

export async function addApplicationNote(companyId: string, applicationId: string, body: string) {
  return apiRequest<CompanyApplicationNote>(
    `/companies/${companyId}/applications/${applicationId}/notes`,
    {
      method: "POST",
      body: { body },
      idempotent: true,
    },
  );
}

export async function listCompanyMembers(companyId: string) {
  return apiRequest<CompanyMember[]>(`/companies/${companyId}/members`);
}

export async function updateCompanyMember(
  companyId: string,
  userId: string,
  body: {
    role?: "COMPANY_HR" | "COMPANY_ADMIN";
    status?: "ACTIVE" | "SUSPENDED" | "REVOKED";
    reason?: string;
  },
) {
  return apiRequest<{ companyId: string; userId: string; role: string; status: string }>(
    `/companies/${companyId}/members/${userId}`,
    { method: "PATCH", body },
  );
}

export async function listCompanyHrInvitations(companyId: string) {
  return apiRequest<CompanyHrInvitation[]>(`/companies/${companyId}/hr-invitations`);
}

export async function inviteCompanyHr(
  companyId: string,
  body: { email: string; preApproved?: boolean },
) {
  return apiRequest<{
    invitationId: string;
    invitedEmail: string;
    status: string;
    expiresAt: string;
  }>(`/companies/${companyId}/hr-invitations`, { method: "POST", body });
}

export async function resendCompanyHrInvitation(companyId: string, invitationId: string) {
  return apiRequest<{ invitationId: string }>(
    `/companies/${companyId}/hr-invitations/${invitationId}/resend`,
    { method: "POST" },
  );
}

export async function revokeCompanyHrInvitation(companyId: string, invitationId: string) {
  return apiRequest<void>(`/companies/${companyId}/hr-invitations/${invitationId}`, {
    method: "DELETE",
  });
}

export async function listMembershipRequests(companyId: string) {
  return apiRequest<CompanyMembershipRequest[]>(`/companies/${companyId}/membership-requests`);
}

export async function decideMembershipRequest(
  companyId: string,
  requestId: string,
  body: { decision: "APPROVE" | "REJECT"; reason?: string },
) {
  return apiRequest<{ id: string; status: string }>(
    `/companies/${companyId}/membership-requests/${requestId}/decision`,
    { method: "POST", body },
  );
}

export async function searchCompanyTalent(
  companyId: string,
  query?: {
    query?: string | undefined;
    location?: string | undefined;
    learnerType?: LearnerType | undefined;
    limit?: number | undefined;
  },
) {
  return apiRequest<TalentSearchCandidate[]>(
    `/companies/${companyId}/talent`,
    query ? { query } : {},
  );
}

// --- Admin Endpoints ---

export async function listAdminCompanies() {
  return apiRequest<AdminCompanySummary[]>("/admin/companies");
}

export async function getAdminCompany(companyId: string) {
  return apiRequest<AdminCompanyDetail>(`/admin/companies/${companyId}`);
}

export async function decideCompanyVerification(
  companyId: string,
  body: {
    decision: "APPROVED" | "REJECTED";
    reason?: string;
    note?: string;
    websiteChecked?: boolean;
    linkedinChecked?: boolean;
    gstinChecked?: boolean;
  },
) {
  return apiRequest<{ companyId: string; status: string }>(
    `/admin/companies/${companyId}/verification-decision`,
    { method: "POST", body },
  );
}

export async function suspendAdminCompany(companyId: string, reason: string) {
  return apiRequest<{ companyId: string; status: string }>(
    `/admin/companies/${companyId}/suspension`,
    { method: "POST", body: { reason } },
  );
}

export async function reactivateAdminCompany(companyId: string, reason: string) {
  return apiRequest<{ companyId: string; status: string }>(
    `/admin/companies/${companyId}/reactivation`,
    { method: "POST", body: { reason } },
  );
}

export async function listCompanyRegistrationInvitations() {
  return apiRequest<AdminCompanyInvitation[]>("/admin/company-registration-invitations");
}

export async function createCompanyRegistrationInvitation(body: {
  contactEmail: string;
  proposedCompanyName: string;
  note?: string;
  preApproved?: boolean;
}) {
  return apiRequest<{ invitationId: string; status: string; expiresAt: string }>(
    "/admin/company-registration-invitations",
    { method: "POST", body },
  );
}

export async function revokeCompanyRegistrationInvitation(invitationId: string) {
  return apiRequest<{ invitationId: string; status: string }>(
    `/admin/company-registration-invitations/${invitationId}/revocation`,
    { method: "POST" },
  );
}

export async function listStudentAllowlist(query?: {
  status?: "AVAILABLE" | "CLAIMED" | "REVOKED" | undefined;
  learnerType?: LearnerType | undefined;
  query?: string | undefined;
  limit?: number | undefined;
}) {
  return apiRequest<StudentAllowlistEntry[]>("/admin/student-allowlist", query ? { query } : {});
}

export async function addStudentAllowlistEntry(body: {
  email: string;
  firstName?: string;
  lastName?: string;
  rollNumber?: string;
  learnerType?: LearnerType;
  programCode?: string;
  cohort?: string;
  batchYear?: number;
}) {
  return apiRequest<StudentAllowlistEntry>("/admin/student-allowlist", {
    method: "POST",
    body,
    idempotent: true,
  });
}

export async function revokeStudentAllowlistEntry(entryId: string) {
  return apiRequest<{ id: string; status: string }>(
    `/admin/student-allowlist/${entryId}/revocation`,
    { method: "POST" },
  );
}

export async function createStudentEmailImport(body: {
  fileId: string;
  learnerType?: LearnerType;
  programCode?: string;
  cohort?: string;
  batchYear?: number;
}) {
  return apiRequest<Pick<StudentEmailImport, "importId" | "status">>("/admin/student-email-imports", {
    method: "POST",
    body,
    idempotent: true,
  });
}

export async function getStudentEmailImport(importId: string) {
  return apiRequest<StudentEmailImport>(`/admin/student-email-imports/${encodeURIComponent(importId)}`);
}

export async function listPrograms() {
  return apiRequest<ProgramItem[]>("/programs");
}

export async function createProgram(body: { code: string; name: string }) {
  return apiRequest<ProgramItem>("/admin/programs", { method: "POST", body });
}

export async function listAdminStaff() {
  return apiRequest<AdminStaffUser[]>("/admin/staff");
}

export async function createAdminStaff(body: {
  email: string;
  firstName: string;
  lastName?: string;
}) {
  return apiRequest<{ userId: string; email: string; role: string; status: string }>(
    "/admin/staff",
    { method: "POST", body, idempotent: true },
  );
}

export async function deactivateAdminStaff(userId: string, reason: string) {
  return apiRequest<{ userId: string; active: boolean }>(`/admin/staff/${userId}/deactivation`, {
    method: "POST",
    body: { reason },
  });
}

export async function reactivateAdminStaff(userId: string, reason: string) {
  return apiRequest<{ userId: string; active: boolean }>(`/admin/staff/${userId}/reactivation`, {
    method: "POST",
    body: { reason },
  });
}

export async function getPlatformSettings() {
  return apiRequest<PlatformSettings>("/admin/platform-settings");
}

export async function updatePlatformSettings(
  body: Partial<Omit<PlatformSettings, "updatedAt">>,
  ifMatch: string,
) {
  return apiRequest<PlatformSettings>("/admin/platform-settings", {
    method: "PATCH",
    body,
    ifMatch,
  });
}
