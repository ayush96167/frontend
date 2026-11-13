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
import { homeForRole, useAuth } from "@/lib/api/auth";
import { completeStudentRegistration, getStudentRegistrationPreview } from "@/lib/api/endpoints";

export function RegisterCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applySessionToken } = useAuth();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [tokenInput, setTokenInput] = useState(tokenFromUrl);
  const [activeToken, setActiveToken] = useState(tokenFromUrl);

  const preview = useQuery({
    queryKey: ["student-registration-preview", activeToken],
    queryFn: async () => (await getStudentRegistrationPreview(activeToken)).data,
    enabled: Boolean(activeToken),
    retry: false,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const resolvedFirstName = firstName || preview.data?.firstName || "";
  const resolvedLastName = lastName || preview.data?.lastName || "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeToken || !preview.data) {
      setError("Please verify your registration link before submitting.");
      return;
    }
    if (!resolvedFirstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const { data } = await completeStudentRegistration({
        token: activeToken,
        email: preview.data.email,
        password,
        firstName: resolvedFirstName.trim(),
        ...(resolvedLastName.trim() ? { lastName: resolvedLastName.trim() } : {}),
      });
      const user = await applySessionToken(data.accessToken);
      toast.success("Account activated! Welcome to HiLabs Careers.");
      router.replace(homeForRole(user));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 className="heading-underline text-3xl font-extrabold tracking-tight">
          Complete student registration
        </h1>
        <p className="mt-5 text-sm text-muted-foreground">
          Confirm your student details and set a password to activate your account.
        </p>

        {!activeToken ? (
          <div className="mt-8 rounded-xl border bg-card p-6">
            <Label htmlFor="regToken" className="mb-1.5 block">
              Registration token
            </Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="regToken"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste the token from your registration email…"
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
          <div className="mt-8 h-56 animate-pulse rounded-xl border bg-muted/40" />
        ) : preview.isError || !preview.data ? (
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive-soft p-6 text-sm text-destructive">
            <p className="font-semibold">Registration link is invalid or expired.</p>
            <p className="mt-1">
              {(preview.error as Error)?.message ?? "Please request a new link."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveToken("");
                  setTokenInput("");
                }}
              >
                Try another token
              </Button>
              <Link
                href="/register/student"
                className="text-xs font-semibold underline self-center"
              >
                Request new registration link
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={submit}
            noValidate
            className="mt-8 space-y-5 rounded-xl border bg-card p-6"
          >
            <div className="rounded-lg bg-secondary/40 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Student email:</span>{" "}
                <span className="font-semibold">{preview.data.email}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Learner track:{" "}
                <strong className="text-foreground">
                  {preview.data.learnerType === "ENROLLED"
                    ? "Enrolled student"
                    : "Placement support"}
                </strong>
                {preview.data.programCode ? ` · Program ${preview.data.programCode}` : ""}
                {preview.data.cohort ? ` · Cohort ${preview.data.cohort}` : ""}
                {preview.data.batchYear ? ` · Batch ${preview.data.batchYear}` : ""}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName" className="mb-1.5 block">
                  First name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  enterKeyHint="next"
                  value={resolvedFirstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="mb-1.5 block">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  enterKeyHint="next"
                  value={resolvedLastName}
                  onChange={(e) => setLastName(e.target.value)}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  enterKeyHint="done"
                  minLength={12}
                  maxLength={128}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="pr-10"
                  placeholder="Minimum 12 characters"
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
              {pending ? "Activating account…" : "Create student account"}
            </Button>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
