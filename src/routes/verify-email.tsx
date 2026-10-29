import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteLayout } from "@/components/shared/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/mock/auth";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  head: () => ({
    meta: [
      { title: "Verify your email — HiLabs Careers" },
      { name: "description", content: "Verify your email address to activate your HiLabs Careers account." },
      { property: "og:title", content: "Verify your email — HiLabs Careers" },
      { property: "og:description", content: "Verify your email address to activate your HiLabs Careers account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerifyEmail,
});

function VerifyEmail() {
  const { email: initialEmail } = Route.useSearch();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.replace(/\D/g, "").length !== 6) {
      setError("Enter the 6-digit code from your inbox.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const user = await verifyEmail(email.trim().toLowerCase());
      toast.success("Email verified", { description: "You're all set — sign in to continue." });
      await navigate({ to: "/login", search: { redirect: undefined } });
      void user;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <h1 className="heading-underline text-3xl font-extrabold tracking-tight">Verify your email</h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          We sent a 6-digit code to your inbox. This is a demo — any 6 digits will verify.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email" className="mb-1.5 block">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="code" className="mb-1.5 block">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="text-center text-lg font-bold tracking-[0.5em]"
              required
            />
          </div>
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Verifying…" : "Verify email"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          Already verified? <Link to="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </SiteLayout>
  );
}
