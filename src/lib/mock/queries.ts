import { useQuery } from "@tanstack/react-query";
import { STUDENT_ID, listApplicationsForStudent, listJobs, listCompanies, listResumes, getStudentProfile, getStudentSkills, listSavedJobs } from "./api";

export const usePublishedJobs = () =>
  useQuery({ queryKey: ["jobs", "published"], queryFn: () => listJobs() });

export const useAllJobs = () =>
  useQuery({ queryKey: ["jobs", "all"], queryFn: () => listJobs({ includeAll: true }) });

export const useCompanies = () =>
  useQuery({ queryKey: ["companies"], queryFn: listCompanies });

export const useStudentResumes = () =>
  useQuery({ queryKey: ["resumes"], queryFn: () => listResumes(STUDENT_ID), refetchInterval: (q) => (q.state.data?.some((r) => r.parseStatus === "PENDING") ? 1000 : false) });

export const useStudentProfile = () =>
  useQuery({ queryKey: ["profile"], queryFn: getStudentProfile });

export const useStudentSkills = () =>
  useQuery({ queryKey: ["skills"], queryFn: getStudentSkills });

export const useSavedJobs = () =>
  useQuery({ queryKey: ["savedJobs"], queryFn: () => listSavedJobs(STUDENT_ID) });

export const useStudentApplications = () =>
  useQuery({ queryKey: ["applications", "student"], queryFn: () => listApplicationsForStudent(STUDENT_ID) });
