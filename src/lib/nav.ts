/** A nav item is active for its own route and any nested route. */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Cap long counts so badges keep a stable, readable width. */
export function formatBadgeCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}
