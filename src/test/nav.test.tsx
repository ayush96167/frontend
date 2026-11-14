import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "@/lib/api/types";

const navState = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navState.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const authState = vi.hoisted(() => ({
  user: null as AuthUser | null,
  ready: true,
  logout: vi.fn(async () => {}),
}));

vi.mock("@/lib/api/auth", () => ({
  useAuth: () => ({ user: authState.user, ready: authState.ready, logout: authState.logout }),
  homeForRole: () => "/student/dashboard",
  displayNameForUser: () => "Ada Lovelace",
  initialsForUser: () => "AL",
  roleLabel: () => "Student",
}));

import { PortalShell, type NavItem } from "@/components/shared/app-shell";
import { SiteHeader } from "@/components/shared/site";

const student: AuthUser = {
  id: "user-1",
  email: "ada@example.com",
  role: "STUDENT",
  emailVerified: true,
  memberships: [],
};

const portalNav: NavItem[] = [
  { to: "/student/dashboard", label: "Dashboard", icon: <span aria-hidden="true" /> },
  { to: "/student/applications", label: "Applications", icon: <span aria-hidden="true" /> },
  {
    to: "/student/notifications",
    label: "Notifications",
    icon: <span aria-hidden="true" />,
    badge: 120,
  },
];

beforeEach(() => {
  navState.pathname = "/";
  authState.user = null;
  authState.ready = true;
  authState.logout.mockClear();
});

describe("SiteHeader", () => {
  it("reserves space without rendering account CTAs until auth is ready", () => {
    authState.ready = false;
    const { container } = render(<SiteHeader />);

    expect(screen.queryByRole("link", { name: /sign in/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /create student account/i })).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));
    const panel = document.getElementById("mobile-site-menu");
    expect(panel).not.toBeNull();
    expect(within(panel as HTMLElement).queryByRole("link", { name: /sign in/i })).toBeNull();
  });

  it("locks scroll, focuses the drawer, and restores focus on Escape", () => {
    render(<SiteHeader />);

    const toggle = screen.getByRole("button", { name: /open navigation menu/i });
    fireEvent.click(toggle);

    const panel = document.getElementById("mobile-site-menu");
    expect(panel).not.toBeNull();
    expect(document.body.style.overflow).toBe("hidden");
    expect(panel).toHaveFocus();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("navigation", { name: /mobile navigation/i })).toBeNull();
    expect(document.body.style.overflow).toBe("");
    expect(toggle).toHaveFocus();
  });

  it("marks the current section with aria-current in the mobile drawer", () => {
    navState.pathname = "/jobs/123";
    render(<SiteHeader />);

    fireEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));
    const panel = document.getElementById("mobile-site-menu") as HTMLElement;

    expect(within(panel).getByRole("link", { name: "Open Roles" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(panel).getByRole("link", { name: "For Employers" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});

describe("PortalShell", () => {
  it("provides a skip link, a main landmark, and aria-current for the active page", () => {
    navState.pathname = "/student/applications";
    render(
      <PortalShell user={student} nav={portalNav} kicker="Student portal">
        <p>Portal content</p>
      </PortalShell>,
    );

    expect(screen.getByRole("link", { name: /skip to content/i })).toHaveAttribute(
      "href",
      "#portal-content",
    );
    expect(document.getElementById("portal-content")?.tagName).toBe("MAIN");

    const activeLinks = screen.getAllByRole("link", { name: /^applications$/i });
    expect(activeLinks).toHaveLength(2);
    activeLinks.forEach((link) => expect(link).toHaveAttribute("aria-current", "page"));

    const inactiveLinks = screen.getAllByRole("link", { name: /^dashboard$/i });
    inactiveLinks.forEach((link) => expect(link).not.toHaveAttribute("aria-current"));
  });

  it("caps notification badges and exposes the full count to assistive tech", () => {
    render(
      <PortalShell user={student} nav={portalNav} kicker="Student portal">
        <p>Portal content</p>
      </PortalShell>,
    );

    expect(screen.getAllByText("99+")).toHaveLength(2);
    expect(screen.getAllByLabelText("120 unread")).toHaveLength(2);
  });

  it("keeps sign out reachable in both the sidebar and the mobile top bar", () => {
    render(
      <PortalShell user={student} nav={portalNav} kicker="Student portal">
        <p>Portal content</p>
      </PortalShell>,
    );

    expect(screen.getAllByRole("button", { name: /sign out/i })).toHaveLength(2);
    expect(screen.getByText("Ada Lovelace · Student")).toBeInTheDocument();
  });
});
