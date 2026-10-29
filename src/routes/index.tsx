import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/shared/site";
import { JobCard } from "@/components/shared/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompanies, usePublishedJobs } from "@/lib/mock/queries";

export default function Landing() {
  const jobs = usePublishedJobs();
  const companies = useCompanies();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const featured = (jobs.data ?? []).slice(0, 3);
  const companyCount = companies.data?.filter((c) => c.status === "APPROVED").length ?? 0;

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-bold uppercase tracking-widest text-brand">HiLabs Careers</p>
          <h1 className="heading-underline mt-5 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Launch your career with employers you can trust.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Every company on HiLabs Careers is verified before it can post. Search open roles,
            apply in one click with your saved resume, and track every application in one place.
          </p>

          <form
            className="mt-10 flex max-w-xl items-center gap-2 rounded-xl border bg-card p-2 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/jobs", search: query.trim() ? { search: query.trim() } : {} });
            }}
          >
            <Search className="ml-2 h-4.5 w-4.5 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles, skills, or companies…"
              className="border-0 shadow-none focus-visible:ring-0"
              aria-label="Search jobs"
            />
            <Button type="submit" className="shrink-0">Search jobs</Button>
          </form>

          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-8">
            {[
              { value: `${jobs.data?.length ?? 0}`, label: "Open roles" },
              { value: `${companyCount}`, label: "Verified companies" },
              { value: "1-click", label: "Applications" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-3xl font-extrabold tracking-tight text-brand sm:text-4xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="heading-underline text-2xl font-extrabold tracking-tight sm:text-3xl">
              Featured roles
            </h2>
          </div>
          <Link to="/jobs" className="text-sm font-semibold text-brand hover:underline">
            View all jobs →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featured.map((job) => (
            <JobCard key={job.id} job={job} company={companies.data?.find((c) => c.id === job.companyId)} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="heading-underline text-2xl font-extrabold tracking-tight sm:text-3xl">
            How HiLabs Careers works
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Build your profile",
                body: "Create your account, add your skills and upload a resume. We parse it so recruiters see a complete picture.",
              },
              {
                step: "02",
                title: "Apply in one click",
                body: "Verified companies post open roles. Apply with your default resume and a short cover letter — no forms on repeat.",
              },
              {
                step: "03",
                title: "Track everything",
                body: "Follow every application from Applied to Offered in your dashboard, with notifications at each step.",
              },
            ].map((item) => (
              <div key={item.step}>
                <span className="text-sm font-bold text-brand">{item.step}</span>
                <h3 className="mt-2 text-lg font-bold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl bg-foreground px-8 py-12 text-background sm:px-12">
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight">
            Hiring? Get in front of verified student talent.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-background/70">
            Register your company, get verified by the HiLabs team, and start posting roles the
            same day. Invite your HR team to manage applications together.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register/company-owner"
              className="inline-flex items-center justify-center rounded-md bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-background/90"
            >
              Register your company
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md border border-background/30 px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-background/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
