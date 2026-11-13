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
import { activateAccount, getActivationPreview } from "@/lib/api/endpoints";

export function AccountActivationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applySessionToken } = useAuth();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [tokenInput, setTokenInput] = useState(tokenFromUrl);
  const [activeToken, setActiveToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const preview = useQuery({
    queryKey: ["account-activation-preview", activeToken],
    queryFn: async () => (await getActivationPreview(activeToken)).data,
    enabled: Boolean(activeToken),
    retry: false,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeToken) {
      setError("Activation token is required.");
      return;
    }
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const { data } = await activateAccount(activeToken, password);
      const user = await applySessionToken(data.accessToken);
      toast.success("Account activated!");
      router.replace(homeForRole(user));
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
          Activate your account
        </h1>
        <p className="mt-5 text-sm text-muted-foreground">
          Choose a password for your invited HiLabs portal account.
        </p>

        {!activeToken ? (
          <div className="mt-8 rounded-xl border bg-card p-6">
            <Label htmlFor="activationToken" className="mb-1.5 block">
              Activation token
            </Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="activationToken"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste activation token from email…"
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
          <div className="mt-8 h-48 animate-pulse rounded-xl border bg-muted/40" />
        ) : preview.isError || !preview.data ? (
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive-soft p-6 text-sm text-destructive">
            <p className="font-semibold">Activation link is invalid or expired.</p>
            <p className="mt-1">
              {(preview.error as Error)?.message ?? "Please request a new link."}
            </p>
            <Link href="/login" className="mt-4 inline-block text-xs font-semibold underline">
              Return to sign in
            </Link>
          </div>
        ) : (
          <form
            onSubmit={submit}
            noValidate
            className="mt-8 space-y-5 rounded-xl border bg-card p-6"
          >
            <div className="rounded-lg bg-secondary/40 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Account:</span>{" "}
                <strong className="text-foreground">{preview.data.email}</strong>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Role: <strong className="text-foreground">{preview.data.role}</strong>
                {preview.data.companyName ? ` · ${preview.data.companyName}` : ""}
              </p>
            </div>

            <div>
              <Label htmlFor="password" className="mb-1.5 block">
                Set password (12+ characters)
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
              {pending ? "Activating…" : "Activate account"}
            </Button>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
