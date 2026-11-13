import type { PageInfo } from "./types";

const configuredBase = process.env["NEXT_PUBLIC_API_URL"]?.trim();
const RAW_BASE =
  configuredBase &&
  configuredBase.length > 0 &&
  !configuredBase.includes("77jw") &&
  !configuredBase.includes("i06h")
    ? configuredBase
    : "/api/v1";
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export interface ProblemFieldError {
  field?: string;
  code?: string;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  detail: string;
  errors?: ProblemFieldError[] | undefined;
  requestId?: string | undefined;

  constructor(opts: {
    status: number;
    code: string;
    detail: string;
    errors?: ProblemFieldError[] | undefined;
    requestId?: string | undefined;
  }) {
    super(opts.detail);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.detail = opts.detail;
    this.errors = opts.errors;
    this.requestId = opts.requestId;
  }
}

export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `idem_${crypto.randomUUID()}`;
  }
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function newRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `req_${crypto.randomUUID()}`;
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | string[] | undefined | null>,
): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${cleanPath}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== "") {
          params.append(key, String(item));
        }
      }
    } else {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  const requestId = response.headers.get("x-request-id") ?? undefined;
  let body: Record<string, unknown> = {};
  try {
    const text = await response.text();
    if (text) {
      body = JSON.parse(text) as Record<string, unknown>;
    }
  } catch {
    body = {};
  }

  const errors = Array.isArray(body["errors"])
    ? (body["errors"] as ProblemFieldError[])
    : undefined;
  const firstFieldMessage = errors?.[0]?.message;
  const rawDetail =
    typeof body["detail"] === "string"
      ? body["detail"]
      : typeof body["message"] === "string"
        ? body["message"]
        : response.statusText || "Request failed.";

  const detail =
    firstFieldMessage && rawDetail === "One or more fields are invalid."
      ? firstFieldMessage
      : rawDetail;

  return new ApiError({
    status: response.status,
    code: typeof body["code"] === "string" ? body["code"] : `HTTP_${response.status}`,
    detail,
    errors,
    requestId: typeof body["requestId"] === "string" ? body["requestId"] : requestId,
  });
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Request-ID": newRequestId(),
        },
      });
      if (!response.ok) {
        clearAccessToken();
        return null;
      }
      const json = (await response.json()) as { data?: { accessToken?: string } };
      const token = json.data?.accessToken ?? null;
      setAccessToken(token);
      return token;
    } catch {
      clearAccessToken();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | string[] | undefined | null> | undefined;
  body?: unknown;
  headers?: Record<string, string> | undefined;
  skipAuth?: boolean | undefined;
  idempotent?: boolean | undefined;
  idempotencyKey?: string | undefined;
  ifMatch?: string | undefined;
  signal?: AbortSignal | undefined;
}

export interface ApiResult<T> {
  data: T;
  page?: PageInfo | undefined;
  meta?: Record<string, unknown> | undefined;
  etag: string | null;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
  retried = false,
): Promise<ApiResult<T>> {
  const method = options.method ?? "GET";
  const url = buildUrl(path, options.query);
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Request-ID", headers.get("X-Request-ID") || newRequestId());

  if (options.idempotent || options.idempotencyKey) {
    headers.set("Idempotency-Key", options.idempotencyKey ?? newIdempotencyKey());
  }
  if (options.ifMatch) {
    headers.set("If-Match", options.ifMatch);
  }

  let bodyInit: BodyInit | undefined;
  if (options.body !== undefined) {
    if (options.body instanceof FormData || typeof options.body === "string") {
      bodyInit = options.body;
    } else {
      headers.set("Content-Type", "application/json");
      bodyInit = JSON.stringify(options.body);
    }
  }

  if (!options.skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: bodyInit ?? null,
    credentials: "include",
    ...(options.signal ? { signal: options.signal } : {}),
  });

  if (response.status === 401 && !options.skipAuth && !retried) {
    const freshToken = await refreshAccessToken();
    if (freshToken) {
      return apiRequest<T>(path, options, true);
    }
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  const etag = response.headers.get("etag");
  if (response.status === 204) {
    return { data: undefined as T, etag };
  }

  const text = await response.text();
  if (!text) {
    return { data: undefined as T, etag };
  }

  const parsed = JSON.parse(text) as {
    data?: T;
    page?: PageInfo;
    meta?: Record<string, unknown>;
  };

  return {
    data: ("data" in parsed ? parsed.data : (parsed as unknown)) as T,
    page: parsed.page,
    meta: parsed.meta,
    etag,
  };
}
