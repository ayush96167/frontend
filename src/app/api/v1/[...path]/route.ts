import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_API_BASE_URL = "https://job-portal-api-0zl4.onrender.com/api/v1";
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "authorization",
  "content-type",
  "idempotency-key",
  "if-match",
  "user-agent",
  "x-request-id",
];
const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "etag",
  "idempotent-replayed",
  "ratelimit-limit",
  "ratelimit-remaining",
  "ratelimit-reset",
  "retry-after",
  "x-request-id",
];

function getUpstreamBaseUrl(): string {
  const configured = process.env["API_BASE_URL"]?.trim();
  if (
    configured &&
    configured.length > 0 &&
    !configured.includes("77jw") &&
    !configured.includes("i06h")
  ) {
    return configured.replace(/\/+$/, "");
  }
  return DEFAULT_API_BASE_URL.replace(/\/+$/, "");
}

function adaptIncomingCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const adapted = new Set<string>(parts);
  for (const part of parts) {
    if (part.startsWith("refresh=")) {
      adapted.add(`__Host-refresh=${part.slice("refresh=".length)}`);
    }
  }
  return Array.from(adapted).join("; ");
}

function adaptSetCookieForHttpDev(setCookie: string): string {
  return setCookie.replace(/^__Host-refresh=/i, "refresh=").replace(/;\s*Secure\b/gi, "");
}

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await context.params;

  if (MUTATING_METHODS.has(request.method.toUpperCase())) {
    const originHeader = request.headers.get("origin");
    if (originHeader) {
      try {
        const originUrl = new URL(originHeader);
        const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host");
        const originHost = originUrl.host.toLowerCase();
        const requestHost = request.nextUrl.host.toLowerCase();
        const forwardedHost = hostHeader
          ? (hostHeader.split(",")[0]?.trim().toLowerCase() ?? null)
          : null;

        const isSameHost =
          originHost === requestHost ||
          (forwardedHost !== null && originHost === forwardedHost) ||
          originUrl.origin === request.nextUrl.origin;

        if (!isSameHost) {
          return NextResponse.json(
            {
              type: "https://api.example.com/problems/forbidden",
              title: "Forbidden",
              status: 403,
              code: "CSRF_ORIGIN_MISMATCH",
              detail: "Cross-origin state-changing requests to the proxy are not allowed.",
            },
            { status: 403 },
          );
        }
      } catch {
        return NextResponse.json(
          {
            type: "https://api.example.com/problems/forbidden",
            title: "Forbidden",
            status: 403,
            code: "CSRF_ORIGIN_INVALID",
            detail: "Invalid Origin header.",
          },
          { status: 403 },
        );
      }
    }
  }

  const sanitizedSegments = path.filter((segment) => segment !== "." && segment !== "..");
  const upstreamUrl = new URL(`${getUpstreamBaseUrl()}/${sanitizedSegments.join("/")}`);
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) {
      headers.set(name, value);
    }
  }

  const forwardedCookie = adaptIncomingCookieHeader(request.headers.get("cookie"));
  if (forwardedCookie) {
    headers.set("cookie", forwardedCookie);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method.toUpperCase());
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : null,
      redirect: "manual",
      cache: "no-store",
    });
  } catch (error) {
    return NextResponse.json(
      {
        type: "https://api.example.com/problems/service-unavailable",
        title: "Upstream API unreachable",
        status: 503,
        code: "UPSTREAM_UNAVAILABLE",
        detail:
          error instanceof Error
            ? `Unable to reach the backend API (${error.message}).`
            : "Unable to reach the backend API.",
      },
      { status: 503 },
    );
  }

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstreamResponse.headers.get(name);
    if (value !== null) {
      responseHeaders.set(name, value);
    }
  }
  responseHeaders.set("Cache-Control", "no-store");

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const isHttpOrigin = (forwardedProto ?? request.nextUrl.protocol.replace(":", "")) === "http";
  const getSetCookie = (upstreamResponse.headers as Headers & { getSetCookie?: () => string[] })
    .getSetCookie;
  const cookies =
    typeof getSetCookie === "function"
      ? getSetCookie.call(upstreamResponse.headers)
      : upstreamResponse.headers.get("set-cookie")
        ? [upstreamResponse.headers.get("set-cookie")!]
        : [];
  for (const cookie of cookies) {
    responseHeaders.append("Set-Cookie", isHttpOrigin ? adaptSetCookieForHttpDev(cookie) : cookie);
  }

  if (upstreamResponse.status === 204 || upstreamResponse.status === 304) {
    return new NextResponse(null, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  }

  const payload = await upstreamResponse.arrayBuffer();
  return new NextResponse(payload, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const HEAD = handleProxy;
export const OPTIONS = handleProxy;
