import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";
import { useAuth, DEMO_ACCOUNTS } from "@/lib/mock/auth";

const publicNav = [
  { to: "/jobs", label: "Find jobs" },
  { to: "/register/company-owner", label: "For companies" },
  { to: "/login", label: "Sign in" },
];

export function SiteHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          {publicNav.slice(0, 2).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeOptions={{ exact: false }}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <Link
              to="/student/dashboard"
              className="ml-1 inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/85"
            >
              My portal
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                to="/register/student"
                className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/85"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            HiLabs Careers connects students and graduates with verified employers — transparent
            listings, one-click applications and faster hiring.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">For students</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/jobs" className="hover:text-foreground">Browse jobs</Link></li>
            <li><Link to="/register/student" className="hover:text-foreground">Create account</Link></li>
            <li><Link to="/student/applications" className="hover:text-foreground">My applications</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">For companies</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/register/company-owner" className="hover:text-foreground">Register company</Link></li>
            <li><Link to="/hr/join-company" className="hover:text-foreground">Join as HR</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} HiLabs. All rights reserved.</p>
          <p>
            Demo accounts:{" "}
            {DEMO_ACCOUNTS.map((a) => a.email).join(" · ")}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h1 className="heading-underline text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
