import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Providers } from "@/components/providers";
import { LandingPage } from "@/components/pages/landing-page";
import { LoginPage } from "@/components/pages/login-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("HiLabs Careers routing and auth integration", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url.includes("/auth/login")) {
          return new Response(
            JSON.stringify({
              status: 401,
              title: "Unauthorized",
              detail: "Invalid email or password",
              code: "AUTH_INVALID_CREDENTIALS",
            }),
            { status: 401, headers: { "Content-Type": "application/problem+json" } },
          );
        }
        return new Response(JSON.stringify({ status: 401, title: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/problem+json" },
        });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the HiLabs Careers hero heading and interactive preview", () => {
    render(
      <Providers>
        <LandingPage />
      </Providers>,
    );

    expect(
      screen.getByRole("heading", {
        name: /verified campus jobs with one-click applications/i,
      }),
    ).toBeInTheDocument();

    const applyTab = screen.getByRole("tab", { name: /one-click apply/i });
    fireEvent.click(applyTab);
    expect(applyTab).toHaveAttribute("aria-selected", "true");
  });

  it("surfaces backend Problem+JSON errors on sign-in failure", async () => {
    render(
      <Providers>
        <LoginPage />
      </Providers>,
    );

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "LongEnoughPass123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/invalid email or password/i);
    });
  });
});
