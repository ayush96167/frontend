import type { ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { Loader2, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { homeForRole, roleLabel, useAuth } from "@/lib/mock/auth";
import { Logo } from "./logo";
import type { AuthUser } from "@/lib/mock/types";

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-brand" />
    </div>
  );
}

export function RequireRole({
  roles,
  companyId,
  children,
}: {
  roles: AuthUser["role"][];
  companyId?: string;
  children: (user: AuthUser) => ReactNode;
}) {
  const { user, ready } = useAuth();
  if (!ready) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeForRole(user)} replace />;
  if (companyId && user.companyId !== companyId) return <Navigate to={homeForRole(user)} replace />;
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
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="border-b px-5 py-4">
          <Logo />
        </div>
        <p className="px-5 pt-5 pb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {kicker}
        </p>
        <nav className="flex-1 space-y-0.5 px-3 pb-4">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              activeProps={{ className: "bg-sidebar-accent text-foreground font-semibold" }}
              activeOptions={{ exact: false }}
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
          ))}
        </nav>
        <div className="border-t px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{roleLabel(user.role)}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        {/* mobile top bar */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Logo />
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              {user.firstName} · {roleLabel(user.role)}
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground",
                )}
                activeProps={{
                  className: "border-brand/30 bg-brand-soft text-brand font-semibold",
                }}
                activeOptions={{ exact: false }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
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
  return (
    <button
      onClick={logout}
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
        <h1 className="heading-underline text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="mt-4 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
