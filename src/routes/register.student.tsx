import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteLayout } from "@/components/shared/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/mock/auth";

export const Route = createFileRoute("/register/student")({
  head: () => ({
    meta: [
      { title: "Create your student account — HiLabs Careers" },
      { name: "description", content: "Create a free HiLabs Careers account and apply to verified jobs in one click." },
      { property: "og:title", content: "Create your student account — HiLabs Careers" },
      { property: "og:description", content: "Create a free HiLabs Careers account and apply to verified jobs in one click." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterStudent,
});

function RegisterStudent() {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await registerStudent(form);
      toast.success("Account created", { description: "Verify your email to finish setting up." });
      await navigate({ to: "/verify-email", search: { email: form.email.trim().toLowerCase() } });
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
          <form onSubmit={submit} className="mt-8 max-w-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="mb-1.5 block">First name</Label>
                <Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="lastName" className="mb-1.5 block">Last name</Label>
                <Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="mb-1.5 block">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@college.edu" required />
            </div>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
          </p>
        </div>

        <aside className="rounded-xl border bg-card p-6">
          <p className="font-semibold">What you get</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>• A parsed, versioned resume library — always apply with your best one.</li>
            <li>• One-click applications to verified companies only.</li>
            <li>• Live status tracking from Applied to Offered.</li>
            <li>• Saved jobs and notifications in one dashboard.</li>
          </ul>
        </aside>
      </div>
    </SiteLayout>
  );
}
