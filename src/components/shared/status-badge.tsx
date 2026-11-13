import { cn } from "@/lib/utils";
import {
  applicationStatusLabels,
  companyStatusLabels,
  jobStatusLabels,
  parseStatusLabels,
  requestStageLabels,
  titleCase,
} from "@/lib/format";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "destructive";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  brand: "bg-brand-soft text-brand border-brand/25",
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning-foreground border-warning/30",
  destructive: "bg-destructive-soft text-destructive border-destructive/25",
};

const jobTones: Record<string, BadgeTone> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  CLOSED: "warning",
  ARCHIVED: "neutral",
};

const applicationTones: Record<string, BadgeTone> = {
  APPLIED: "neutral",
  UNDER_REVIEW: "brand",
  SHORTLISTED: "brand",
  INTERVIEW: "warning",
  OFFERED: "success",
  HIRED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "neutral",
};

const companyTones: Record<string, BadgeTone> = {
  PENDING_ADMIN: "warning",
  IN_REVIEW: "brand",
  ACTIVE: "success",
  REJECTED: "destructive",
  SUSPENDED: "destructive",
};

const stageTones: Record<string, BadgeTone> = {
  PENDING: "warning",
  APPROVED: "success",
  ACCEPTED: "success",
  SUBMITTED: "brand",
  REJECTED: "destructive",
  EXPIRED: "neutral",
  REVOKED: "destructive",
};

const parseTones: Record<string, BadgeTone> = {
  NOT_STARTED: "neutral",
  PENDING: "brand",
  PARSED: "success",
  FAILED: "destructive",
};

const allDefaultLabels: Record<string, string> = {
  ...jobStatusLabels,
  ...applicationStatusLabels,
  ...companyStatusLabels,
  ...requestStageLabels,
  ...parseStatusLabels,
  QUALIFIED: "Qualified",
  NOT_QUALIFIED: "Not qualified",
  AVAILABLE: "Available",
  CLAIMED: "Claimed",
};

const allDefaultTones: Record<string, BadgeTone> = {
  ...jobTones,
  ...applicationTones,
  ...companyTones,
  ...stageTones,
  ...parseTones,
  QUALIFIED: "success",
  NOT_QUALIFIED: "warning",
  AVAILABLE: "success",
  CLAIMED: "brand",
};

export function StatusBadge({
  value,
  status,
  labels,
  tones,
  className,
}: {
  value?: string | undefined;
  status?: string | undefined;
  labels?: Record<string, string> | undefined;
  tones?: Record<string, BadgeTone> | undefined;
  className?: string | undefined;
}) {
  const raw = value ?? status ?? "";
  const tone = tones?.[raw] ?? allDefaultTones[raw] ?? "neutral";
  const label = labels?.[raw] ?? allDefaultLabels[raw] ?? titleCase(raw);
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function JobStatusBadge({ status }: { status: string }) {
  return <StatusBadge value={status} labels={jobStatusLabels} tones={jobTones} />;
}

export function ApplicationStatusBadge({ status }: { status: string }) {
  return <StatusBadge value={status} labels={applicationStatusLabels} tones={applicationTones} />;
}

export function CompanyStatusBadge({ status }: { status: string }) {
  return <StatusBadge value={status} labels={companyStatusLabels} tones={companyTones} />;
}

export function StageBadge({ stage }: { stage: string }) {
  return <StatusBadge value={stage} labels={requestStageLabels} tones={stageTones} />;
}

export function ParseStatusBadge({ status }: { status: string }) {
  return <StatusBadge value={status} labels={parseStatusLabels} tones={parseTones} />;
}
