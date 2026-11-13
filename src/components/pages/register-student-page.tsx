"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/shared/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestStudentRegistration } from "@/lib/api/endpoints";

export function RegisterStudentPage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const emailInvalid =
    touched && email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter your college or allowlisted email address.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const { data } = await requestStudentRegistration(trimmed);
      setSentMessage(data.message);
      toast.success("Registration request sent");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2">
        <div>
          <h1 className="heading-underline text-3xl font-extrabold tracking-tight">
            Create your student account
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Student accounts use HiLabs email allowlisting. Enter your enrolled or placement-support
            email to receive a private registration link.
          </p>

          {sentMessage ? (
            <div className="mt-8 max-w-md rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 font-semibold text-success">
                <MailCheck className="h-5 w-5" />
                Check your inbox
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{sentMessage}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Open the link in your email to confirm your name and choose your password on{" "}
                <span className="font-medium text-foreground">/register/complete</span>.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSentMessage(null)}
              >
                Use another email
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-8 max-w-sm space-y-4">
              <div>
                <Label htmlFor="email" className="mb-1.5 block">
                  Student email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="done"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  onBlur={() => setTouched(true)}
                  aria-invalid={emailInvalid || undefined}
                  placeholder="you@college.edu"
                  required
                />
                {emailInvalid ? (
                  <p className="mt-1 text-xs text-destructive">Enter a valid email address.</p>
                ) : null}
              </div>
              {error ? (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {error}
                </p>
              ) : null}
              <Button type="submit" size="lg" className="w-full" disabled={pending}>
                {pending ? "Sending link…" : "Send registration link"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-sm text-muted-foreground">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <aside className="rounded-xl border bg-card p-6">
          <p className="font-semibold">How student onboarding works</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>• Your HiLabs coordinator adds your email and program cohort to the allowlist.</li>
            <li>• Request a private registration link using the form on this page.</li>
            <li>• Set your password (at least 12 characters) and start uploading your resume.</li>
            <li>• Apply to verified employers and track application stages in real time.</li>
          </ul>
        </aside>
      </div>
    </SiteLayout>
  );
}
