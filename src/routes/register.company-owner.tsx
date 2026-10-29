import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteLayout } from "@/components/shared/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/mock/auth";

export const Route = createFileRoute("/register/company-owner")({
  head: () => ({
    meta: [
      { title: "Register your company — HiLabs Careers" },
      { name: "description", content: "Register your company on HiLabs Careers, get verified, and start hiring student talent." },
      { property: "og:title", content: "Register your company — HiLabs Careers" },
      { property: "og:description", content: "Register your company on HiLabs Careers, get verified, and start hiring student talent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterCompany,
});

function RegisterCompany() {
  const { registerOwner } = useAuth();
  const navigate = useNavigate();
  const [owner, setOwner] = useState({ firstName: "", lastName: "", email: "" });
  const [company, setCompany] = useState({ name: "", location: "", website: "", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.name.trim() || !company.location.trim()) {
      setError("Company name and location are required.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await registerOwner({
        owner: { firstName: owner.firstName, lastName: owner.lastName, email: owner.email },
        company: {
          name: company.name,
          location: company.location,
          website: company.website,
          description: company.description,
        },
      });
      toast.success("Company registered", {
        description: "Verify your email. The HiLabs team reviews new companies within 1–2 days.",
      });
      await navigate({ to: "/verify-email", search: { email: owner.email.trim().toLowerCase() } });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="heading-underline text-3xl font-extrabold tracking-tight">Register your company</h1>
        <p className="mt-5 max-w-xl text-sm text-muted-foreground">
          The HiLabs team verifies every company before its jobs go live. You can draft jobs
          immediately — they publish once your company is approved.
        </p>

        <form onSubmit={submit} className="mt-10 space-y-8 rounded-xl border bg-card p-6 sm:p-8">
          <fieldset className="space-y-4">
            <legend className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Owner account
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName" className="mb-1.5 block">First name</Label>
                <Input id="firstName" value={owner.firstName} onChange={(e) => setOwner({ ...owner, firstName: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="lastName" className="mb-1.5 block">Last name</Label>
                <Input id="lastName" value={owner.lastName} onChange={(e) => setOwner({ ...owner, lastName: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label htmlFor="ownerEmail" className="mb-1.5 block">Work email</Label>
              <Input id="ownerEmail" type="email" value={owner.email} onChange={(e) => setOwner({ ...owner, email: e.target.value })} placeholder="you@company.com" required />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Company
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="companyName" className="mb-1.5 block">Company name</Label>
                <Input id="companyName" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="companyLocation" className="mb-1.5 block">Headquarters</Label>
                <Input id="companyLocation" value={company.location} onChange={(e) => setCompany({ ...company, location: e.target.value })} placeholder="e.g. Bengaluru, India" required />
              </div>
            </div>
            <div>
              <Label htmlFor="companyWebsite" className="mb-1.5 block">Website</Label>
              <Input id="companyWebsite" type="url" value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} placeholder="https://company.com" />
            </div>
            <div>
              <Label htmlFor="companyDescription" className="mb-1.5 block">What does your company do?</Label>
              <Textarea id="companyDescription" rows={3} value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} />
            </div>
          </fieldset>

          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Registering…" : "Register company"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          Already registered? <Link to="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </SiteLayout>
  );
}
