"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  displayNameForUser,
  homeForRole,
  initialsForUser,
  roleLabel,
  useAuth,
} from "@/lib/api/auth";
import { Logo } from "./logo";
import type { AuthUser, UserRole } from "@/lib/api/types";

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-brand" aria-label="Loading" />
    </div>
  );
}

export function RequireRole({
  roles,
  companyId,
  children,
}: {
  roles: UserRole[];
  companyId?: string;
  children: (user: AuthUser) => ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const hasCompanyMembership =
    !companyId ||
    Boolean(user?.memberships.some((m) => m.companyId === companyId && m.status === "ACTIVE"));

  const redirectTo = !ready
    ? null
    : !user
      ? `/login?redirect=${encodeURIComponent(pathname)}`
      : !roles.includes(user.role) || !hasCompanyMembership
        ? homeForRole(user)
        : null;

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  if (!ready || !user || redirectTo) return <FullPageLoader />;
  return <>{children(user)}</>;
}

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export function PortalShell({
  user,
  nav,
  children,
  kicker,
}: {
  user: AuthUser;
  nav: NavItem[];
  children: ReactNode;
  kicker: string;
}) {
  const pathname = usePathname();
  const displayName = displayNameForUser(user);
  const initials = initialsForUser(user);
  const label = roleLabel(user);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="border-b px-5 py-4">
          <Logo />
        </div>
        <p className="px-5 pt-5 pb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {kicker}
        </p>
        <nav aria-label={kicker} className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {nav.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                  active && "bg-sidebar-accent font-semibold text-foreground",
                )}
              >
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="min-w-5 rounded-full bg-brand px-1.5 text-center text-[11px] font-bold text-brand-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground" title={user.email}>
                {label}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Logo />
            <div className="text-xs font-medium text-muted-foreground">
              {displayName} · {label}
            </div>
          </div>
          <nav aria-label={kicker} className="flex gap-1 overflow-x-auto px-3 pb-2">
            {nav.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground",
                    active && "border-brand/30 bg-brand-soft font-semibold text-brand",
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
            <SignOutButton mobile />
          </nav>
        </div>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
      </div>
    </div>
  );
}

function SignOutButton({ mobile }: { mobile?: boolean }) {
  const { logout } = useAuth();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        void logout().then(() => router.replace("/login"));
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        mobile ? "mt-0 shrink-0 px-3 py-1.5 text-xs" : "mt-3 w-full px-2 py-2",
      )}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}

export function PortalPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="heading-underline text-2xl font-extrabold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description ? <p className="mt-4 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
