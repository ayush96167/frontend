import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteLayout } from "@/components/shared/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_ACCOUNTS, homeForRole, useAuth } from "@/lib/mock/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — HiLabs Careers" },
      { name: "description", content: "Sign in to HiLabs Careers to manage applications and job postings." },
      { property: "og:title", content: "Sign in — HiLabs Careers" },
      { property: "og:description", content: "Sign in to HiLabs Careers to manage applications and job postings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.firstName}!`);
      await navigate({ to: redirect || homeForRole(user), replace: true });
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
            New here?{" "}
            <Link to="/register/student" className="font-semibold text-brand hover:underline">
              Create a student account
            </Link>{" "}
            or{" "}
            <Link to="/register/company-owner" className="font-semibold text-brand hover:underline">
              register your company
            </Link>
            .
          </p>

          <form onSubmit={submit} className="mt-8 max-w-sm space-y-4">
            <div>
              <Label htmlFor="email" className="mb-1.5 block">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="password" className="mb-1.5 block">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <aside className="rounded-xl border bg-card p-6">
          <p className="font-semibold">Try a demo account</p>
          <p className="mt-1 text-sm text-muted-foreground">
            One click fills the form — any password works in this demo.
          </p>
          <div className="mt-5 space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword("demo1234");
                  setError(null);
                }}
                className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent"
              >
                <span>
                  <span className="block text-sm font-semibold">{account.label}</span>
                  <span className="block text-xs text-muted-foreground">{account.detail}</span>
                </span>
                <span className="text-xs font-medium text-brand">{account.email}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
