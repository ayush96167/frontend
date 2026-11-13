"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/shared/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { displayNameForUser, homeForRole, useAuth } from "@/lib/api/auth";

export function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const emailInvalid =
    touchedEmail && email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedEmail(true);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 12) {
      setError("Passwords are at least 12 characters.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const user = await login(trimmedEmail, password);
      toast.success(`Welcome back, ${displayNameForUser(user)}!`);
      const safeRedirect = redirect && redirect.startsWith("/") ? redirect : undefined;
      router.replace(safeRedirect || homeForRole(user));
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
          <h1 className="heading-underline text-3xl font-extrabold tracking-tight">Sign in</h1>
          <p className="mt-5 text-sm text-muted-foreground">
            New student?{" "}
            <Link href="/register/student" className="font-semibold text-brand hover:underline">
              Request registration link
            </Link>{" "}
            or{" "}
            <Link href="/company/register" className="font-semibold text-brand hover:underline">
              register an invited company
            </Link>
            .
          </p>

          <form onSubmit={submit} noValidate className="mt-8 max-w-sm space-y-4">
            <div>
              <Label htmlFor="email" className="mb-1.5 block">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="next"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                onBlur={() => setTouchedEmail(true)}
                aria-invalid={emailInvalid || undefined}
                placeholder="you@example.com"
                required
              />
              {emailInvalid ? (
                <p className="mt-1 text-xs text-destructive">Enter a valid email address.</p>
              ) : null}
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/reset-password"
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  enterKeyHint="done"
                  minLength={12}
                  maxLength={128}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••••••"
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
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <aside className="rounded-xl border bg-card p-6">
          <p className="font-semibold">Portal access</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sign in with your verified HiLabs student, recruiter, or platform staff credentials.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li>
              • <strong className="text-foreground">Students:</strong> Request an allowlist
              registration link with your enrolled or placement-support email.
            </li>
            <li>
              • <strong className="text-foreground">Company owners:</strong> Open the private
              invitation link sent by HiLabs to onboard your company.
            </li>
            <li>
              • <strong className="text-foreground">Recruiters:</strong> Use the HR invitation link
              shared by your company administrator.
            </li>
          </ul>
          <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">
            Need a new verification link?{" "}
            <Link href="/verify-email" className="font-semibold text-brand hover:underline">
              Verify or resend email
            </Link>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
