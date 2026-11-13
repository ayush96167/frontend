import Link from "next/link";
import { FileText, ShieldCheck, Users } from "lucide-react";
import { SiteLayout } from "@/components/shared/site";
import {
  FeaturedRolesSection,
  HeroPortalFrame,
  HeroPrimaryAction,
  HeroSearchForm,
} from "./landing-widgets";
import { PinnedWorkflowMoment } from "./pinned-workflow-moment";

function DrawnArrow() {
  return (
    <svg className="dt-arrow" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M1.5 6h8.5" />
      <path d="M6 2.5 9.5 6 6 9.5" />
    </svg>
  );
}

const TRUST_PILLARS = [
  { icon: ShieldCheck, label: "Domain-Verified Employers" },
  { icon: Users, label: "Cohort Allowlist Access" },
  { icon: FileText, label: "One Saved PDF Resume" },
] as const;

export function LandingPage() {
  return (
    <SiteLayout>
      {/* Screen 1: Hero (Server-rendered copy + compact leaf client search & preview tabs) */}
      <section className="flex min-h-[calc(100svh-3.5rem)] items-center border-b bg-background py-10 sm:min-h-[calc(100svh-4.5rem)] sm:py-14">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col lg:col-span-6">
              <p translate="no" className="dt-hero-enter text-sm font-semibold text-brand">
                HiLabs Careers
              </p>
              <h1
                className="heading-underline dt-hero-enter mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]"
                style={{ "--dt-delay": "60ms" } as React.CSSProperties}
              >
                Verified Campus Jobs with One-Click Applications.
              </h1>
              <p
                className="dt-hero-enter mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground"
                style={{ "--dt-delay": "120ms" } as React.CSSProperties}
              >
                Every company on <span translate="no">HiLabs Careers</span> is verified before it
                can post. Search open roles, apply with your saved resume, and track every stage in
                one place.
              </p>

              <HeroSearchForm />

              <div
                className="dt-hero-enter mt-6 flex flex-wrap items-center gap-x-6 gap-y-3"
                style={{ "--dt-delay": "240ms" } as React.CSSProperties}
              >
                <HeroPrimaryAction />
                <Link
                  href="/company/register"
                  className="dt-link inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground hover:text-foreground sm:min-h-0"
                >
                  Hiring? Register Company
                  <DrawnArrow />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <HeroPortalFrame />
            </div>
          </div>
        </div>
      </section>

      {/* Screen 2: Trust pillars & Featured Open Roles */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="heading-underline text-2xl font-bold tracking-tight sm:text-3xl">
              Featured Roles
            </h2>
          </div>
          <Link href="/jobs" className="dt-link text-sm font-semibold text-brand">
            Browse All Roles
            <DrawnArrow />
          </Link>
        </div>

        <ul
          aria-label="Platform verification guarantees"
          className="mt-6 grid gap-3 sm:grid-cols-3"
        >
          {TRUST_PILLARS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2.5 rounded-lg border bg-secondary/35 px-3.5 py-2.5 text-sm font-medium text-foreground"
            >
              <Icon className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <FeaturedRolesSection />
        </div>
      </section>

      {/* Screen 3: 3-Step Funnel Workflow with step mini-CTAs */}
      <PinnedWorkflowMoment />

      {/* Screen 4: Employer CTA band */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl bg-foreground px-8 py-12 text-background sm:px-12">
          <h2 className="max-w-xl text-3xl font-bold tracking-tight">
            Hiring? Connect with Verified Student Talent.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-background/70">
            Register your company with an invitation link from <span translate="no">HiLabs</span>,
            verify your domain, and invite your recruiting team to publish jobs and review
            candidates.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/company/register"
              className="dt-btn inline-flex min-h-11 items-center justify-center rounded-md bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-background/90 sm:min-h-10"
            >
              Register Your Company
            </Link>
            <Link
              href="/login"
              className="dt-btn inline-flex min-h-11 items-center justify-center rounded-md border border-background/30 px-5 py-2.5 text-sm font-semibold text-background hover:bg-background/10 sm:min-h-10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
