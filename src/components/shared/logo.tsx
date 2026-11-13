import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", inverted = false }: { href?: string; inverted?: boolean }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-85 motion-reduce:transition-none"
      aria-label="HiLabs Careers home"
    >
      <span
        translate="no"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold",
          inverted ? "bg-background text-foreground" : "bg-foreground text-background",
        )}
        aria-hidden="true"
      >
        Hi
      </span>
      <span
        translate="no"
        className={cn(
          "text-lg font-bold tracking-tight",
          inverted ? "text-background" : "text-foreground",
        )}
      >
        HiLabs <span className="text-brand">Careers</span>
      </span>
    </Link>
  );
}
