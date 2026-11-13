"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/shared/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { acceptHrInvitation, getHrInvitationPreview } from "@/lib/api/endpoints";

export function HrInvitationPage() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [tokenInput, setTokenInput] = useState(tokenFromUrl);
  const [activeToken, setActiveToken] = useState(tokenFromUrl);

  const preview = useQuery({
    queryKey: ["hr-invitation-preview", activeToken],
    queryFn: async () => (await getHrInvitationPreview(activeToken)).data,
    enabled: Boolean(activeToken),
    retry: false,
  });

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ status: string; emailVerified: boolean } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeToken || !preview.data) {
      setError("A valid HR invitation token is required.");
      return;
    }
    if (!name.trim()) {
      setError("Your full name is required.");
      return;
    }
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const { data } = await acceptHrInvitation(activeToken, {
        name: name.trim(),
        password,
        ...(designation.trim() ? { designation: designation.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      });
      setDone({ status: data.status, emailVerified: data.emailVerified });
      toast.success("HR invitation accepted");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <h1 className="heading-underline text-3xl font-extrabold tracking-tight">
          Join company as HR
        </h1>
        <p className="mt-5 text-sm text-muted-foreground">
          Accept your company HR invitation to collaborate on job postings and candidate review.
        </p>

        {done ? (
          <div className="mt-8 rounded-xl border bg-card p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div className="text-sm">
                <p className="font-semibold">Invitation submitted ({done.status})</p>
                <p className="mt-1 text-muted-foreground">
                  {done.status === "APPROVED"
                    ? "Your company membership is approved. Sign in once your email is verified."
                    : "Your request was sent to the company administrator for final approval."}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={done.emailVerified ? "/login" : "/verify-email"}
                className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/85"
              >
                {done.emailVerified ? "Continue to sign in" : "Verify email"}
              </Link>
            </div>
          </div>
        ) : !activeToken ? (
          <div className="mt-8 rounded-xl border bg-card p-6">
            <Label htmlFor="hrToken" className="mb-1.5 block">
              Invitation token
            </Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="hrToken"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste invitation token…"
                spellCheck={false}
              />
              <Button
                type="button"
                onClick={() => setActiveToken(tokenInput.trim())}
                disabled={tokenInput.trim().length < 12}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : preview.isLoading ? (
          <div className="mt-8 h-52 animate-pulse rounded-xl border bg-muted/40" />
        ) : preview.isError || !preview.data ? (
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive-soft p-6 text-sm text-destructive">
            <p className="font-semibold">Invitation is invalid or expired.</p>
            <p className="mt-1">
              {(preview.error as Error)?.message ?? "Ask your company admin for a fresh invite."}
            </p>
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
            className="mt-8 space-y-4 rounded-xl border bg-card p-6"
          >
            <div className="rounded-lg bg-secondary/40 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Company:</span>{" "}
                <strong className="text-foreground">{preview.data.companyName}</strong>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Invited email: <strong className="text-foreground">{preview.data.email}</strong>
              </p>
            </div>

            <div>
              <Label htmlFor="name" className="mb-1.5 block">
                Full name
              </Label>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="designation" className="mb-1.5 block">
                  Designation (optional)
                </Label>
                <Input
                  id="designation"
                  autoComplete="organization-title"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Talent Lead"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="mb-1.5 block">
                  Phone (optional)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="mb-1.5 block">
                Password (12+ characters)
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
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

            {error ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Joining…" : "Accept invitation"}
            </Button>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
