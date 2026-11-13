"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/shared/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCompanyRegistrationInvitation,
  registerCompanyWithInvitation,
} from "@/lib/api/endpoints";

export function RegisterCompanyOwnerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [tokenInput, setTokenInput] = useState(tokenFromUrl);
  const [activeToken, setActiveToken] = useState(tokenFromUrl);

  const preview = useQuery({
    queryKey: ["company-invite", activeToken],
    queryFn: async () => (await getCompanyRegistrationInvitation(activeToken)).data,
    enabled: Boolean(activeToken),
    retry: false,
  });

  const [form, setForm] = useState({
    name: "",
    website: "",
    location: "",
    linkedinUrl: "",
    gstin: "",
    emailDomains: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const companyNameValue = form.name || preview.data?.proposedCompanyName || "";
  const adminEmailValue = form.adminEmail || preview.data?.contactEmail || "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeToken) {
      setError("A valid company registration invitation token is required.");
      return;
    }
    if (!companyNameValue.trim() || !form.adminName.trim() || !adminEmailValue.trim()) {
      setError("Company name, administrator name, and administrator email are required.");
      return;
    }
    if (form.adminPassword.length < 12) {
      setError("Administrator password must be at least 12 characters.");
      return;
    }

    const emailDomains = form.emailDomains
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    setPending(true);
    setError(null);
    try {
      const { data } = await registerCompanyWithInvitation({
        invitationToken: activeToken,
        name: companyNameValue.trim(),
        ...(form.website.trim() ? { website: form.website.trim() } : {}),
        ...(form.location.trim() ? { location: form.location.trim() } : {}),
        ...(form.linkedinUrl.trim() ? { linkedinUrl: form.linkedinUrl.trim() } : {}),
        ...(form.gstin.trim() ? { gstin: form.gstin.trim().toUpperCase() } : {}),
        ...(emailDomains.length ? { emailDomains } : {}),
        adminName: form.adminName.trim(),
        adminEmail: adminEmailValue.trim().toLowerCase(),
        adminPassword: form.adminPassword,
      });

      toast.success("Company registration submitted", {
        description: data.adminEmailVerificationRequired
          ? "Check your inbox to verify your work email."
          : "Your registration has been received. You can sign in now.",
      });
      router.push(
        data.adminEmailVerificationRequired
          ? `/verify-email?email=${encodeURIComponent(adminEmailValue.trim().toLowerCase())}`
          : "/login",
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="heading-underline text-3xl font-extrabold tracking-tight">
          Register your company
        </h1>
        <p className="mt-5 max-w-xl text-sm text-muted-foreground">
          Company onboarding requires a private invitation from the HiLabs team. Open the link from
          your invitation email or paste your invitation token below.
        </p>

        {!activeToken ? (
          <div className="mt-8 rounded-xl border bg-card p-6">
            <Label htmlFor="inviteToken" className="mb-1.5 block">
              Invitation token
            </Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="inviteToken"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste invitation token from HiLabs email…"
                spellCheck={false}
              />
              <Button
                type="button"
                onClick={() => setActiveToken(tokenInput.trim())}
                disabled={tokenInput.trim().length < 16}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : preview.isLoading ? (
          <div className="mt-8 h-64 animate-pulse rounded-xl border bg-muted/40" />
        ) : preview.isError ? (
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive-soft p-6 text-sm text-destructive">
            <p className="font-semibold">Invitation link is invalid or expired.</p>
            <p className="mt-1">{(preview.error as Error).message}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setActiveToken("");
                setTokenInput("");
              }}
            >
              Try another token
            </Button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            noValidate
            className="mt-8 space-y-8 rounded-xl border bg-card p-6 sm:p-8"
          >
            <fieldset className="space-y-4">
              <legend className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Administrator account
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="adminName" className="mb-1.5 block">
                    Full name
                  </Label>
                  <Input
                    id="adminName"
                    autoComplete="name"
                    value={form.adminName}
                    onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                    placeholder="Priya Sharma"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail" className="mb-1.5 block">
                    Work email
                  </Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    autoComplete="email"
                    spellCheck={false}
                    value={adminEmailValue}
                    onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="adminPassword" className="mb-1.5 block">
                  Password (12+ characters)
                </Label>
                <div className="relative max-w-sm">
                  <Input
                    id="adminPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    value={form.adminPassword}
                    onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Company profile
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="companyName" className="mb-1.5 block">
                    Company name
                  </Label>
                  <Input
                    id="companyName"
                    autoComplete="organization"
                    value={companyNameValue}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="companyLocation" className="mb-1.5 block">
                    Headquarters
                  </Label>
                  <Input
                    id="companyLocation"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Bengaluru, India"
                  />
                </div>
                <div>
                  <Label htmlFor="companyWebsite" className="mb-1.5 block">
                    Website (https://)
                  </Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://acme.com"
                  />
                </div>
                <div>
                  <Label htmlFor="companyLinkedin" className="mb-1.5 block">
                    LinkedIn URL (https://)
                  </Label>
                  <Input
                    id="companyLinkedin"
                    type="url"
                    value={form.linkedinUrl}
                    onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                    placeholder="https://www.linkedin.com/company/acme"
                  />
                </div>
                <div>
                  <Label htmlFor="companyGstin" className="mb-1.5 block">
                    GSTIN (optional, 15 chars)
                  </Label>
                  <Input
                    id="companyGstin"
                    value={form.gstin}
                    onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                    placeholder="29ABCDE1234F1Z5"
                  />
                </div>
                <div>
                  <Label htmlFor="emailDomains" className="mb-1.5 block">
                    Verified work domains (comma-separated)
                  </Label>
                  <Input
                    id="emailDomains"
                    value={form.emailDomains}
                    onChange={(e) => setForm({ ...form, emailDomains: e.target.value })}
                    placeholder="acme.com"
                    spellCheck={false}
                  />
                </div>
              </div>
            </fieldset>

            {error ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Submitting registration…" : "Complete company registration"}
            </Button>
          </form>
        )}

        <p className="mt-5 text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </SiteLayout>
  );
}
