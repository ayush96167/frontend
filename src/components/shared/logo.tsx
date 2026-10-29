import { Link } from "@tanstack/react-router";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link to={href} className="inline-flex items-center gap-2.5" aria-label="HiLabs Careers home">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-sm font-black text-background">
        Hi
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        HiLabs <span className="text-brand">Careers</span>
      </span>
    </Link>
  );
}
