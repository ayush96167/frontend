"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth";
import * as api from "./endpoints";
import type {
  ApplicationStatus,
  EmploymentType,
  JobStatus,
  JobTargetStatus,
  LearnerType,
  StudentPreferences,
  StudentProfile,
  WorkMode,
} from "./types";

// --- Jobs & Catalog ---

export function usePublishedJobs(filters?: {
  q?: string | undefined;
  location?: string | undefined;
  workMode?: WorkMode | undefined;
  employmentType?: EmploymentType | undefined;
  sort?: "recent" | "deadline" | undefined;
}) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["jobs", user?.id ?? "anon", filters ?? {}],
    queryFn: async () => (await api.searchJobs(filters)).data,
    enabled: ready && Boolean(user),
  });
}

export function useJob(jobId: string | undefined) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["job", jobId, user?.id ?? "anon"],
    queryFn: async () => (await api.getJob(jobId!)).data,
    enabled: ready && Boolean(user && jobId),
  });
}

export function useSkillCatalog(query?: string) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["skills", query ?? ""],
    queryFn: async () => (await api.searchSkills(query, 100)).data,
    enabled: ready && Boolean(user),
    staleTime: 5 * 60_000,
  });
}

// --- Student Queries & Mutations ---

export function useStudentProfile() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["student", "profile", user?.id],
    queryFn: () => api.getStudentProfile(),
    enabled: ready && user?.role === "STUDENT",
  });
}

export function useStudentCompletion() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["student", "completion", user?.id],
    queryFn: async () => (await api.getStudentCompletion()).data,
    enabled: ready && user?.role === "STUDENT",
  });
}

export function useStudentPreferences() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["student", "preferences", user?.id],
    queryFn: () => api.getStudentPreferences(),
    enabled: ready && user?.role === "STUDENT",
  });
}

export function useStudentSkills() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["student", "skills", user?.id],
    queryFn: () => api.getStudentSkills(),
    enabled: ready && user?.role === "STUDENT",
  });
}

export function useStudentEducations() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["student", "educations", user?.id],
    queryFn: async () => (await api.listEducations()).data,
    enabled: ready && user?.role === "STUDENT",
  });
}

export function useStudentExperiences() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["student", "experiences", user?.id],
    queryFn: async () => (await api.listExperiences()).data,
    enabled: ready && user?.role === "STUDENT",
  });
}

export function useStudentProjects() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["student", "projects", user?.id],
    queryFn: async () => (await api.listProjects()).data,
    enabled: ready && user?.role === "STUDENT",
  });
}

export function useStudentResumes() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["student", "resumes", user?.id],
    queryFn: async () => (await api.listResumes()).data,
    enabled: ready && user?.role === "STUDENT",
  });
}

export function useSavedJobs() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["student", "saved-jobs", user?.id],
    queryFn: async () => (await api.listSavedJobs()).data,
    enabled: ready && user?.role === "STUDENT",
  });
}

export function useStudentApplications() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["student", "applications", user?.id],
    queryFn: async () => (await api.listStudentApplications()).data,
    enabled: ready && user?.role === "STUDENT",
  });
}

export function useNotifications(unreadOnly = false) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id, unreadOnly],
    queryFn: async () => (await api.listNotifications(unreadOnly)).data,
    enabled: ready && Boolean(user),
  });
}

export function useUnreadNotificationCount() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["notifications", "unread-count", user?.id],
    queryFn: async () => (await api.getUnreadNotificationCount()).data.unreadCount,
    enabled: ready && Boolean(user),
  });
}

export function useToggleSaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, save }: { jobId: string; save: boolean }) =>
      save ? api.saveJob(jobId) : api.unsaveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job"] });
      queryClient.invalidateQueries({ queryKey: ["student", "saved-jobs"] });
    },
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
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
          | "profileData"
        >
      >;
      ifMatch: string;
    }) => api.patchStudentProfile(input.body, input.ifMatch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
  });
}

export function useReplaceStudentPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { body: StudentPreferences; ifMatch: string }) =>
      api.replaceStudentPreferences(input.body, input.ifMatch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
  });
}

export function useReplaceStudentSkills() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      skills: { skillId: string; proficiency?: number | null; yearsExperience?: number | null }[];
      ifMatch: string;
    }) => api.replaceStudentSkills(input.skills, input.ifMatch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
  });
}

// --- Company Queries ---

export function useCompanyProfile(companyId: string | undefined) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["company", companyId, "profile"],
    queryFn: () => api.getCompany(companyId!),
    enabled: ready && Boolean(user && companyId),
  });
}

export function useCompanyJobs(companyId: string | undefined, status?: JobStatus) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["company", companyId, "jobs", status ?? "all"],
    queryFn: async () => (await api.listCompanyJobs(companyId!, status)).data,
    enabled: ready && Boolean(user && companyId),
  });
}

export function useCompanyJob(companyId: string | undefined, jobId: string | undefined) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["company", companyId, "job", jobId],
    queryFn: () => api.getCompanyJob(companyId!, jobId!),
    enabled: ready && Boolean(user && companyId && jobId),
  });
}

export function useCompanyApplications(
  companyId: string | undefined,
  query?: {
    jobId?: string | undefined;
    stage?: ApplicationStatus[] | undefined;
    qualification?: "QUALIFIED" | "NOT_QUALIFIED" | undefined;
    query?: string | undefined;
    sort?: "appliedAt" | "qualification" | "matchScore" | undefined;
  },
) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["company", companyId, "applications", query ?? {}],
    queryFn: async () => (await api.listCompanyApplications(companyId!, query)).data,
    enabled: ready && Boolean(user && companyId),
  });
}

export function useCompanyApplication(
  companyId: string | undefined,
  applicationId: string | undefined,
) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["company", companyId, "application", applicationId],
    queryFn: () => api.getCompanyApplication(companyId!, applicationId!),
    enabled: ready && Boolean(user && companyId && applicationId),
  });
}

export function useCompanyMembers(companyId: string | undefined) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["company", companyId, "members"],
    queryFn: async () => (await api.listCompanyMembers(companyId!)).data,
    enabled: ready && Boolean(user && companyId),
  });
}

export function useCompanyHrInvitations(companyId: string | undefined, isAdmin: boolean) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["company", companyId, "hr-invitations"],
    queryFn: async () => (await api.listCompanyHrInvitations(companyId!)).data,
    enabled: ready && Boolean(user && companyId && isAdmin),
  });
}

export function useCompanyMembershipRequests(companyId: string | undefined, isAdmin: boolean) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["company", companyId, "membership-requests"],
    queryFn: async () => (await api.listMembershipRequests(companyId!)).data,
    enabled: ready && Boolean(user && companyId && isAdmin),
  });
}

export function useCompanyTalentSearch(
  companyId: string | undefined,
  query?: { query?: string; location?: string; learnerType?: LearnerType },
) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["company", companyId, "talent", query ?? {}],
    queryFn: async () => (await api.searchCompanyTalent(companyId!, query)).data,
    enabled: ready && Boolean(user && companyId),
  });
}

// --- Admin Queries ---

export function useAdminCompanies() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["admin", "companies"],
    queryFn: async () => (await api.listAdminCompanies()).data,
    enabled: ready && (user?.role === "PORTAL_HR" || user?.role === "MASTER_ADMIN"),
  });
}

export function useAdminCompany(companyId: string | undefined) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["admin", "company", companyId],
    queryFn: () => api.getAdminCompany(companyId!),
    enabled:
      ready && Boolean(companyId) && (user?.role === "PORTAL_HR" || user?.role === "MASTER_ADMIN"),
  });
}

export function useAdminCompanyInvitations() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["admin", "company-invitations"],
    queryFn: async () => (await api.listCompanyRegistrationInvitations()).data,
    enabled: ready && (user?.role === "PORTAL_HR" || user?.role === "MASTER_ADMIN"),
  });
}

export function useAdminAllowlist(query?: {
  status?: "AVAILABLE" | "CLAIMED" | "REVOKED" | undefined;
  learnerType?: LearnerType | undefined;
  query?: string | undefined;
}) {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["admin", "allowlist", query ?? {}],
    queryFn: async () => (await api.listStudentAllowlist(query)).data,
    enabled: ready && (user?.role === "PORTAL_HR" || user?.role === "MASTER_ADMIN"),
  });
}

export function usePrograms() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["programs"],
    queryFn: async () => (await api.listPrograms()).data,
    enabled: ready && (user?.role === "PORTAL_HR" || user?.role === "MASTER_ADMIN"),
  });
}

export function useAdminStaff() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["admin", "staff"],
    queryFn: async () => (await api.listAdminStaff()).data,
    enabled: ready && user?.role === "MASTER_ADMIN",
  });
}

export function usePlatformSettings() {
  const { user, ready } = useAuth();
  return useQuery({
    queryKey: ["admin", "platform-settings"],
    queryFn: () => api.getPlatformSettings(),
    enabled: ready && (user?.role === "PORTAL_HR" || user?.role === "MASTER_ADMIN"),
  });
}

export type { JobTargetStatus };
