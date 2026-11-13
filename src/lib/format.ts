import type {
  ApplicationStatus,
  CompanyStatus,
  EmploymentType,
  JobStatus,
  RequestStage,
  ResumeParseStatus,
  WorkMode,
} from "./api/types";

export function formatSalary(
  min?: string | number | null,
  max?: string | number | null,
  currency = "INR",
  period?: string | null,
): string {
  const minNum = min !== undefined && min !== null && min !== "" ? Number(min) : null;
  const maxNum = max !== undefined && max !== null && max !== "" ? Number(max) : null;
  if (minNum === null && maxNum === null) return "Compensation undisclosed";

  const symbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  const sym = symbols[currency] ?? `${currency} `;
  const fmt = (n: number) =>
    currency === "INR" && n >= 100000
      ? `${sym}${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
      : `${sym}${n.toLocaleString("en-IN")}`;

  const suffix = period ? ` / ${period.toLowerCase()}` : "";
  if (minNum !== null && maxNum !== null) return `${fmt(minNum)} – ${fmt(maxNum)}${suffix}`;
  if (minNum !== null) return `From ${fmt(minNum)}${suffix}`;
  return `Up to ${fmt(maxNum!)}${suffix}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const workModeLabels: Record<WorkMode, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

export const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  TEMPORARY: "Temporary",
  APPRENTICESHIP: "Apprenticeship",
};

export const jobStatusLabels: Record<JobStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  OFFERED: "Offered",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const companyStatusLabels: Record<CompanyStatus, string> = {
  PENDING_ADMIN: "Email verification pending",
  IN_REVIEW: "Under HiLabs review",
  ACTIVE: "Active",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

export const requestStageLabels: Record<RequestStage, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
  ACCEPTED: "Accepted",
  SUBMITTED: "Submitted",
};

export const parseStatusLabels: Record<ResumeParseStatus, string> = {
  NOT_STARTED: "Not started",
  PENDING: "Parsing…",
  PARSED: "Parsed",
  FAILED: "Failed",
};
