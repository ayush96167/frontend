"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteLayout } from "@/components/shared/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/api/auth";

export default function JoinCompanyPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [token, setToken] = useState("");

  const openInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;
    router.push(`/company/hr-invitation?token=${encodeURIComponent(trimmed)}`);
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 className="heading-underline text-3xl font-extrabold tracking-tight">
          Join a company as HR
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Recruiters join a verified company via a private HR invitation sent by that company&apos;s
          administrator.
        </p>

        {user ? (
          <div className="mt-6 rounded-xl border bg-secondary/40 p-4 text-sm">
            <p>
              Signed in as <strong>{user.email}</strong>.
              {user.memberships.length > 0
                ? " Your company membership is currently awaiting approval or inactive."
                : " No active company membership is linked to this account yet."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void logout().then(() => router.replace("/login"))}
            >
              Sign out
            </Button>
          </div>
        ) : null}

        <form onSubmit={openInvite} className="mt-8 space-y-4 rounded-xl border bg-card p-6">
          <div>
            <Label htmlFor="inviteToken" className="mb-1.5 block">
              Have an HR invitation token?
            </Label>
            <Input
              id="inviteToken"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste invitation token…"
              spellCheck={false}
            />
          </div>
          <Button type="submit" disabled={token.trim().length < 8}>
            Open HR invitation
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/company/register" className="font-semibold text-brand hover:underline">
            Register an invited company owner
          </Link>
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Return to sign in
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
