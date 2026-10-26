// Shared domain types for the mock-data job portal.

export type Role = "STUDENT" | "HR" | "COMPANY_ADMIN" | "OWNER" | "ADMIN";

export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type WorkMode = "REMOTE" | "HYBRID" | "ONSITE";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";

export type ApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFERED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export type CompanyStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type ResumeParseStatus = "NOT_STARTED" | "PENDING" | "PARSED" | "FAILED";
export type RequestStage = "PENDING" | "APPROVED" | "REJECTED";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  companyId?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  location: string;
  logoText: string;
  status: CompanyStatus;
  ownerEmail: string;
  submittedAt: string;
  verified: boolean;
  suspensionReason?: string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  responsibilities: string[];
  location: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  minExperience: number;
  maxExperience: number;
  minSalary: number;
  maxSalary: number;
  currency: "INR" | "USD" | "EUR";
  skills: string[];
  deadline: string;
  status: JobStatus;
  createdAt: string;
  applicantCount: number;
}

export interface ApplicationNote {
  id: string;
  authorName: string;
  createdAt: string;
  text: string;
}

export interface ApplicationSnapshot {
  fullName: string;
  email: string;
  headline: string;
  location: string;
  skills: string[];
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: ApplicationStatus;
  appliedAt: string;
  resumeId: string;
  resumeLabel: string;
  coverLetter: string;
  snapshot: ApplicationSnapshot;
  notes: ApplicationNote[];
}

export interface Resume {
  id: string;
  studentId: string;
  version: number;
  fileName: string;
  uploadedAt: string;
  parseStatus: ResumeParseStatus;
  isDefault: boolean;
  parsedData?: {
    fullName: string;
    headline: string;
    skills: string[];
    experience: string;
    education: string;
  };
}

export interface StudentSkill {
  id: string;
  name: string;
  proficiency: number; // 1-5
  yearsExperience: number;
}

export interface StudentProfile {
  firstName: string;
  lastName: string;
  phone: string;
  headline: string;
  bio: string;
  location: string;
  dateOfBirth: string;
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
}

export interface MembershipRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  companyId: string;
  companyName: string;
  requestedRole: "HR";
  note?: string;
  companyStage: RequestStage;
  platformStage: RequestStage;
  requestedAt: string;
  reason?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface PlatformUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
}

export interface SavedJob {
  jobId: string;
  studentId: string;
  savedAt: string;
}
