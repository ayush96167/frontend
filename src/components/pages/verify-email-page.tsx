"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/shared/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { confirmEmailVerification, resendEmailVerification } from "@/lib/api/endpoints";

export function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const initialEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [confirmState, setConfirmState] = useState<"idle" | "verifying" | "verified" | "error">(
    token ? "verifying" : "idle",
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [resendPending, setResendPending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ranTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token || ranTokenRef.current === token) return;
    ranTokenRef.current = token;
    queueMicrotask(() => setConfirmState("verifying"));
    confirmEmailVerification(token)
      .then(({ data }) => {
        setConfirmState("verified");
        setStatusMessage(data.message);
        if (data.email) setEmail(data.email);
        toast.success("Email verified");
      })
      .catch((err: Error) => {
        setConfirmState("error");
        setStatusMessage(err.message);
      });
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setResendPending(true);
    setError(null);
    try {
      const { data } = await resendEmailVerification(trimmed);
      setResendMessage(data.message);
      toast.success("Verification link sent if eligible");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setResendPending(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <h1 className="heading-underline text-3xl font-extrabold tracking-tight">
          Verify your email
        </h1>

        {confirmState === "verifying" ? (
          <div className="mt-8 rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            Confirming your email verification link…
          </div>
        ) : confirmState === "verified" ? (
          <div className="mt-8 rounded-xl border border-success/30 bg-success-soft p-6">
            <div className="flex items-center gap-2 font-semibold text-success">
              <CheckCircle2 className="h-5 w-5" />
              Email confirmed
            </div>
            <p className="mt-2 text-sm text-foreground">{statusMessage}</p>
            <Link
              href="/login"
              className="mt-5 inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <>
            {confirmState === "error" && statusMessage ? (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-destructive/30 bg-destructive-soft p-4 text-sm text-destructive"
              >
                {statusMessage}
              </div>
            ) : null}

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Need a fresh verification link? Enter your email address below and we&apos;ll send one
              if verification is still pending.
            </p>

            {resendMessage ? (
              <div className="mt-6 rounded-xl border bg-card p-5 text-sm">
                <div className="flex items-center gap-2 font-semibold text-success">
                  <MailCheck className="h-4.5 w-4.5" />
                  Request processed
                </div>
                <p className="mt-2 text-muted-foreground">{resendMessage}</p>
              </div>
            ) : null}

            <form onSubmit={handleResend} noValidate className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email" className="mb-1.5 block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {error ? (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {error}
                </p>
              ) : null}
              <Button type="submit" size="lg" className="w-full" disabled={resendPending}>
                {resendPending ? "Sending…" : "Resend verification link"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Already verified?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </SiteLayout>
  );
}
