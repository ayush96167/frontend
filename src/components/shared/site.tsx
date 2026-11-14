"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { isNavActive } from "@/lib/nav";
import { Logo } from "./logo";
import { homeForRole, useAuth } from "@/lib/api/auth";

const publicNav = [
  { href: "/jobs", label: "Open Roles" },
  { href: "/company/register", label: "For Employers" },
];

const emptySubscribe = () => () => {};

function useCurrentYear() {
  return useSyncExternalStore(
    emptySubscribe,
    () => new Date().getFullYear(),
    () => 2026,
  );
}

export function SiteHeader() {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const [openAtPath, setOpenAtPath] = useState<string | null>(null);
  const menuOpen = openAtPath === pathname;
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpenAtPath(null);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = menuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;

      const first = focusables.item(0);
      const last = focusables.item(focusables.length - 1);
      if (!first || !last) return;
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === menuRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b bg-background sm:h-[4.5rem]">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6 lg:gap-10">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {publicNav.map((item) => {
              const isActive = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className="dt-nav-link inline-flex h-9 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!ready ? (
            <div className="hidden items-center gap-2 md:flex" aria-hidden="true">
              <span className="h-9 w-16 rounded-md bg-muted" />
              <span className="h-10 w-48 rounded-md bg-muted" />
            </div>
          ) : user ? (
            <Link
              href={homeForRole(user)}
              className="dt-btn hidden h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-semibold text-background hover:bg-foreground/85 md:inline-flex"
            >
              Open My Portal
            </Link>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                aria-current={pathname === "/login" ? "page" : undefined}
                className="dt-nav-link inline-flex h-9 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/register/student"
                className="dt-btn inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-semibold text-background hover:bg-foreground/85"
              >
                Create Student Account
              </Link>
            </div>
          )}

          <button
            ref={toggleRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-site-menu"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpenAtPath((prev) => (prev === pathname ? null : pathname))}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border text-foreground transition-colors hover:bg-accent md:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-site-menu"
          ref={menuRef}
          tabIndex={-1}
          className="fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col justify-between overflow-y-auto overscroll-contain border-t bg-background px-4 py-6 outline-none sm:top-[4.5rem] sm:px-6 md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col divide-y">
            {publicNav.map((item) => {
              const isActive = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => closeMenu()}
                  aria-current={isActive ? "page" : undefined}
                  className="flex min-h-12 items-center text-base font-medium text-foreground transition-colors hover:text-brand"
                >
                  {item.label}
                </Link>
              );
            })}
            {ready && !user ? (
              <Link
                href="/login"
                onClick={() => closeMenu()}
                className="flex min-h-12 items-center text-base font-medium text-foreground transition-colors hover:text-brand"
              >
                Sign In
              </Link>
            ) : null}
          </nav>
          <div className="border-t pt-5">
            {!ready ? (
              <div className="h-11 w-full rounded-md bg-muted" aria-hidden="true" />
            ) : user ? (
              <Link
                href={homeForRole(user)}
                onClick={() => closeMenu()}
                className="dt-btn flex h-11 w-full items-center justify-center rounded-md bg-foreground px-4 text-sm font-semibold text-background hover:bg-foreground/85"
              >
                Open My Portal
              </Link>
            ) : (
              <Link
                href="/register/student"
                onClick={() => closeMenu()}
                className="dt-btn flex h-11 w-full items-center justify-center rounded-md bg-foreground px-4 text-sm font-semibold text-background hover:bg-foreground/85"
              >
                Create Student Account
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  const year = useCurrentYear();

  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            <span translate="no">HiLabs Careers</span> connects students and graduates with verified
            employers — transparent listings, one-click applications, and faster hiring.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">For Students</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/jobs"
                className="dt-link inline-block min-h-[24px] hover:text-foreground"
              >
                Browse Open Roles
              </Link>
            </li>
            <li>
              <Link
                href="/register/student"
                className="dt-link inline-block min-h-[24px] hover:text-foreground"
              >
                Create Student Account
              </Link>
            </li>
            <li>
              <Link
                href="/student/applications"
                className="dt-link inline-block min-h-[24px] hover:text-foreground"
              >
                My Applications
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">For Companies</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/company/register"
                className="dt-link inline-block min-h-[24px] hover:text-foreground"
              >
                Register Company
              </Link>
            </li>
            <li>
              <Link
                href="/hr/join-company"
                className="dt-link inline-block min-h-[24px] hover:text-foreground"
              >
                Join as HR
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="dt-link inline-block min-h-[24px] hover:text-foreground"
              >
                Sign In
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © <span className="tabular-nums">{year}</span> <span translate="no">HiLabs</span>. All
            rights reserved.
          </p>
          <p>Verified campus hiring &amp; employer portal</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-14 outline-none sm:pt-[4.5rem]">
        {children}
      </main>
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
        <h1 className="heading-underline text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
