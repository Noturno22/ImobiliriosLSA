export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  /** Set to false to receive the raw Response instead of parsed JSON. */
  parse?: boolean;
  cache?: RequestCache;
}

export interface HttpClient {
  get<T>(path: string, query?: Record<string, unknown>, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T>(path: string, options?: RequestOptions): Promise<T>;
}

export interface HttpClientContext {
  baseUrl: string;
  /** Returns headers to attach to each request (e.g. auth cookies/tokens). */
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  fetchImpl?: typeof fetch;
}

function buildQuery(query?: Record<string, unknown>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function createHttpClient(ctx: HttpClientContext): HttpClient {
  const doFetch = ctx.fetchImpl ?? fetch;

  async function request<T>(
    method: string,
    path: string,
    body: unknown,
    query: Record<string, unknown> | undefined,
    options: RequestOptions = {},
  ): Promise<T> {
    const base = ctx.getHeaders ? await ctx.getHeaders() : {};
    const res = await doFetch(`${ctx.baseUrl}${path}${buildQuery(query)}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...base,
        ...options.headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: options.signal,
      cache: options.cache ?? "no-store",
    });

    const isJson = res.headers.get("content-type")?.includes("application/json") ?? false;
    const payload = options.parse === false ? res : isJson ? await res.json().catch(() => null) : null;

    if (!res.ok) {
      const err = payload as { message?: string; code?: string; details?: unknown } | null;
      throw new ApiError(
        res.status,
        err?.message ?? `Pedido falhou (${res.status})`,
        err?.code,
        err?.details,
      );
    }
    return payload as T;
  }

  return {
    get: (path, query, options) => request("GET", path, undefined, query, options),
    post: (path, body, options) => request("POST", path, body, undefined, options),
    patch: (path, body, options) => request("PATCH", path, body, undefined, options),
    delete: (path, options) => request("DELETE", path, undefined, undefined, options),
  };
}
