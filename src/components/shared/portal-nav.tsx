"use client";

import type { ReactNode } from "react";
import {
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
} from "lucide-react";
import { PortalShell, type NavItem } from "./app-shell";
import { useUnreadNotificationCount } from "@/lib/api/queries";
import type { AuthUser } from "@/lib/api/types";

export function StudentPortalShell({ user, children }: { user: AuthUser; children: ReactNode }) {
  const unread = useUnreadNotificationCount();
  const nav: NavItem[] = [
    { to: "/student/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { to: "/jobs", label: "Browse jobs", icon: <Search className="h-4 w-4" /> },
    { to: "/student/applications", label: "Applications", icon: <Briefcase className="h-4 w-4" /> },
    { to: "/student/saved", label: "Saved jobs", icon: <Bookmark className="h-4 w-4" /> },
    { to: "/student/resumes", label: "Resumes", icon: <FileText className="h-4 w-4" /> },
    { to: "/student/profile", label: "Profile", icon: <UserCircle className="h-4 w-4" /> },
    {
      to: "/student/notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      ...(unread.data && unread.data > 0 ? { badge: unread.data } : {}),
    },
  ];
  return (
    <PortalShell user={user} nav={nav} kicker="Student portal">
      {children}
    </PortalShell>
  );
}

export function CompanyPortalShell({
  user,
  companyId,
  children,
}: {
  user: AuthUser;
  companyId: string;
  children: ReactNode;
}) {
  const company =
    user.memberships.find((m) => m.companyId === companyId)?.companyName ?? "Company portal";
  const nav: NavItem[] = [
    {
      to: `/company/${companyId}/dashboard`,
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    { to: `/company/${companyId}/jobs`, label: "Jobs", icon: <Briefcase className="h-4 w-4" /> },
    {
      to: `/company/${companyId}/applications`,
      label: "Applicants",
      icon: <Users className="h-4 w-4" />,
    },
    {
      to: `/company/${companyId}/team`,
      label: "Team & profile",
      icon: <Building2 className="h-4 w-4" />,
    },
  ];
  return (
    <PortalShell user={user} nav={nav} kicker={company}>
      {children}
    </PortalShell>
  );
}

export function AdminPortalShell({ user, children }: { user: AuthUser; children: ReactNode }) {
  const nav: NavItem[] = [
    { to: "/admin/dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { to: "/admin/companies", label: "Companies", icon: <Building2 className="h-4 w-4" /> },
    {
      to: "/admin/allowlist",
      label: "Student allowlist",
      icon: <ClipboardCheck className="h-4 w-4" />,
    },
    ...(user.role === "MASTER_ADMIN"
      ? [{ to: "/admin/staff", label: "Portal staff", icon: <ShieldCheck className="h-4 w-4" /> }]
      : []),
    { to: "/admin/settings", label: "Platform settings", icon: <Settings className="h-4 w-4" /> },
  ];
  return (
    <PortalShell user={user} nav={nav} kicker="HiLabs admin">
      {children}
    </PortalShell>
  );
}
