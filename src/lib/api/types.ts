export type UserRole = "STUDENT" | "COMPANY_USER" | "PORTAL_HR" | "MASTER_ADMIN";
export type MembershipRole = "COMPANY_ADMIN" | "COMPANY_HR";
export type MembershipStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REVOKED";

export type EmploymentType =
  "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "TEMPORARY" | "APPRENTICESHIP";

export type WorkMode = "ONSITE" | "HYBRID" | "REMOTE";
export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type JobTargetStatus = "PUBLISHED" | "CLOSED" | "ARCHIVED";

export type ApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFERED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export type CompanyStatus = "PENDING_ADMIN" | "IN_REVIEW" | "ACTIVE" | "REJECTED" | "SUSPENDED";

export type RequestStage =
  "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "REVOKED" | "ACCEPTED" | "SUBMITTED";
export type ResumeParseStatus = "NOT_STARTED" | "PENDING" | "PARSED" | "FAILED";
export type LearnerType = "ENROLLED" | "PLACEMENT_SUPPORT";
export type EmailDomainStatus = "COMPANY_DOMAIN" | "UNVERIFIED_DOMAIN" | "PERSONAL_EMAIL" | null;

export interface CompanyMembership {
  companyId: string;
  companyName: string;
  role: MembershipRole;
  status: MembershipStatus;
}

export interface ProfileCompletionSummary {
  percentage: number;
  label: "COMPLETE" | "PLACEMENT_READY" | "READY_TO_APPLY" | "INCOMPLETE";
  thresholds: { apply: number; talentSearch: number };
  missingSections: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  emailDomainStatus?: EmailDomainStatus;
  profileCompletion?: ProfileCompletionSummary | null;
  memberships: CompanyMembership[];
}

export interface PageInfo {
  hasMore: boolean;
  nextCursor: string | null;
}

export interface ApiEnvelope<T> {
  data: T;
  page?: PageInfo;
  meta?: Record<string, unknown>;
}

export interface JobSkill {
  skillId: string;
  name: string;
  mandatory: boolean;
}

export interface JobSalary {
  visible: boolean;
  min?: string | null;
  max?: string | null;
  currency?: string | null;
  period?: string | null;
}

export interface JobCompanySummary {
  id: string;
  name: string;
  website?: string | null;
  industry?: string | null;
  location?: string | null;
  logoUrl?: string | null;
  domainVerified?: boolean;
}

export interface Job {
  id: string;
  etagVersion?: string;
  companyId: string;
  title: string;
  description: string;
  responsibilities?: string | null;
  qualifications?: string | null;
  benefits?: string | null;
  openings?: number | null;
  locations: string[];
  employmentType: EmploymentType;
  workMode: WorkMode;
  minExperienceYears?: number | null;
  maxExperienceYears?: number | null;
  minExperienceMonths?: number | null;
  countInternships?: boolean;
  eligibility?: {
    programIds?: string[];
    learnerTypes?: LearnerType[];
    batchYears?: number[];
  };
  salary?: JobSalary;
  educationLevel?: string | null;
  status: JobStatus;
  applicationDeadline: string | null;
  applicationUrl?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  saved?: boolean;
  applied?: boolean;
  skills: JobSkill[];
  company?: JobCompanySummary;
}

export interface CompanyJobSummary {
  id: string;
  etagVersion?: string;
  companyId: string;
  title: string;
  status: JobStatus;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  locations: string[];
  openings?: number | null;
  applicationDeadline?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  applicationCount: number;
}

export interface StudentProfile {
  userId: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  dateOfBirth?: string | null;
  discoverable?: boolean;
  experienceLevel?: "FRESHER" | "EXPERIENCED" | null;
  learnerType?: LearnerType;
  cohort?: string | null;
  batchYear?: number | null;
  totalExperienceMonths?: number;
  profilePhotoFileId?: string | null;
  profileData?: {
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
}

export interface StudentCompletionSection {
  key: string;
  complete?: boolean;
  earned?: number;
  max?: number;
  missing?: string[];
  via?: string;
}

export interface StudentCompletion extends ProfileCompletionSummary {
  sections: StudentCompletionSection[];
}

export interface CatalogSkill {
  id: string;
  name: string;
}

export interface StudentSkill {
  skillId: string;
  name: string;
  proficiency?: number | null;
  yearsExperience?: number | null;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  grade?: string | null;
  description?: string | null;
}

export interface ExperienceEntry {
  id: string;
  employer: string;
  jobTitle: string;
  employmentType: EmploymentType;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string | null;
}

export interface ProjectEntry {
  id: string;
  title: string;
  description?: string | null;
  projectUrl?: string | null;
  repositoryUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  technologies?: { id: string; name: string }[];
}

export interface ResumeItem {
  id: string;
  fileId: string;
  filename: string;
  versionNumber: number;
  isCurrent: boolean;
  parseStatus: ResumeParseStatus;
  createdAt: string;
}

export interface ResumeParseDetail {
  resumeId: string;
  status: ResumeParseStatus;
  parsedData: Record<string, unknown> | null;
  parserVersion?: string | null;
  errorCode?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface SavedJobItem {
  id: string;
  title: string;
  location?: string | null;
  workMode?: WorkMode | null;
  employmentType?: EmploymentType | null;
  publishedAt?: string | null;
  companyName: string;
  savedAt: string;
}

export interface StudentApplication {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    location?: string | null;
    workMode?: WorkMode | null;
    companyName: string;
  };
}

export interface StudentApplicationDetail {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  resumeId?: string | null;
  coverLetter?: string | null;
  snapshot?: Record<string, unknown>;
  messageToCandidate?: string | null;
  appliedAt: string;
  updatedAt: string;
  job: {
    title: string;
    location?: string | null;
    workMode?: WorkMode | null;
    companyName: string;
  };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: string | null;
  createdAt: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  slug: string;
  website?: string | null;
  linkedinUrl?: string | null;
  location?: string | null;
  description?: string | null;
  industry?: string | null;
  companySize?: string | null;
  status: CompanyStatus;
  membershipRole?: MembershipRole;
  membershipStatus?: MembershipStatus;
  updatedAt: string;
}

export interface CompanyApplicationItem {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  stage: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  qualificationLabels?: string[];
  qualification: {
    status: "QUALIFIED" | "NOT_QUALIFIED";
    reasons: unknown[];
  };
  contactVisible: boolean;
  contact: { email?: string | null; phone?: string | null } | null;
  snapshot?: Record<string, unknown>;
  student: {
    id: string;
    name: string;
    headline?: string | null;
    learnerType?: LearnerType;
    program?: string | null;
    batchYear?: number | null;
    totalExperienceMonths?: number | null;
  };
  matchScore?: number;
}

export interface CompanyApplicationDetail {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  stage: ApplicationStatus;
  rejectionReasonCode?: string | null;
  coverLetter?: string | null;
  qualificationLabels?: string[];
  appliedAt: string;
  updatedAt: string;
  qualification: {
    status: "QUALIFIED" | "NOT_QUALIFIED";
    reasons: unknown[];
  };
  contactVisible: boolean;
  contact: { email?: string | null; phone?: string | null } | null;
  snapshot?: Record<string, unknown>;
  resume?: { resumeId: string; fileId: string; filename: string } | null;
  history: {
    from: string | null;
    to: string;
    by?: string | null;
    at: string;
    note?: string | null;
  }[];
}

export interface CompanyApplicationNote {
  id: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: {
    userId: string;
    name: string | null;
  };
}

export interface CompanyMember {
  userId: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  designation?: string | null;
  department?: string | null;
  role: MembershipRole;
  status: MembershipStatus;
}

export interface CompanyHrInvitation {
  invitationId: string;
  email: string;
  status: RequestStage;
  expiresAt: string;
  createdAt: string;
}

export interface CompanyMembershipRequest {
  requestId: string;
  status: RequestStage;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  designation?: string | null;
  phone?: string | null;
  createdAt: string;
}

export interface AdminCompanySummary {
  companyId: string;
  name: string;
  website?: string | null;
  location?: string | null;
  status: CompanyStatus;
  adminEmail?: string | null;
  createdAt: string;
}

export interface AdminCompanyDetail {
  id: string;
  name: string;
  website?: string | null;
  linkedin_url?: string | null;
  gstin?: string | null;
  location?: string | null;
  description?: string | null;
  status: CompanyStatus;
  updated_at: string;
  email_domains?: { domain: string; verified: boolean }[];
  members?: { userId: string; email: string; role: MembershipRole; status: MembershipStatus }[];
}

export interface AdminCompanyInvitation {
  invitationId: string;
  contactEmail: string | null;
  proposedCompanyName: string | null;
  status: RequestStage;
  expiresAt: string;
  createdAt: string;
  companyId?: string | null;
}

export interface StudentAllowlistEntry {
  id: string;
  email: string;
  status: "AVAILABLE" | "CLAIMED" | "REVOKED";
  firstName?: string | null;
  lastName?: string | null;
  rollNumber?: string | null;
  learnerType: LearnerType;
  program?: { id: string; code: string; name: string } | null;
  cohort?: string | null;
  batchYear?: number | null;
  createdAt: string;
}

export interface ProgramItem {
  id: string;
  code: string;
  name: string;
  status: "ACTIVE" | "COMPLETED" | "INACTIVE";
}

export interface AdminStaffUser {
  userId: string;
  email: string;
  active: boolean;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuingOrganization: string;
  credentialId?: string | null;
  credentialUrl?: string | null;
  issueDate?: string | null;
  expirationDate?: string | null;
}

export interface StudentPreferences {
  preferredTitles: string[];
  preferredLocations: string[];
  workModes: WorkMode[];
  employmentTypes: EmploymentType[];
  minSalary?: string | null;
  salaryCurrency?: string | null;
}

export interface StudentRegistrationPreview {
  email: string;
  firstName: string | null;
  lastName: string | null;
  learnerType: LearnerType;
  programCode: string | null;
  cohort: string | null;
  batchYear: number | null;
  expiresAt: string;
}

export interface CompanyInvitationPreview {
  contactEmail: string | null;
  proposedCompanyName: string | null;
  expiresAt: string;
}

export interface HrInvitationPreview {
  id: string;
  email: string;
  expiresAt: string;
  companyId: string;
  companyName: string;
}

export interface AccountActivationPreview {
  email: string;
  role: UserRole;
  companyName?: string | null;
  expiresAt: string;
}

export interface TalentSearchCandidate {
  studentId: string;
  firstName: string;
  lastName: string | null;
  headline: string | null;
  location: string | null;
  learnerType: LearnerType;
  cohort: string | null;
  batchYear: number | null;
  program: string | null;
  profileCompletion: number;
  totalExperienceMonths: number;
  skills: string[];
}

export interface FileUploadInit {
  fileId: string;
  uploadUrl: string;
  uploadHeaders: Record<string, string>;
  expiresAt: string;
}

export interface PlatformSettings {
  applyCompletionThreshold: number;
  talentSearchCompletionThreshold: number;
  reapplyCooldownDays: number;
  maxApplicationsPerStudentPerDay: number;
  talentProfileViewsPerCompanyPerDay: number;
  idleSessionTimeoutMinutes: number;
  hrInvitationTtlDays: number;
  companyInvitationTtlDays: number;
  updatedAt: string;
}
