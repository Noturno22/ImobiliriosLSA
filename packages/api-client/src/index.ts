import type { PropertySummary, PropertyWithMedia } from "@regis/domain";
import type { PropertySearchInput, LeadCreateInput } from "@regis/validation";
import { createHttpClient, type HttpClient, type HttpClientContext } from "./http";

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PropertyApi {
  list(input?: PropertySearchInput, signal?: AbortSignal): Promise<Paginated<PropertySummary>>;
  featured(limit?: number, signal?: AbortSignal): Promise<PropertySummary[]>;
  getBySlug(slug: string, signal?: AbortSignal): Promise<PropertyWithMedia>;
}

export interface LeadApi {
  create(input: LeadCreateInput, signal?: AbortSignal): Promise<{ id: string }>;
}

export interface ApiClient {
  http: HttpClient;
  properties: PropertyApi;
  leads: LeadApi;
}

export function createApiClient(ctx: HttpClientContext): ApiClient {
  const http = createHttpClient(ctx);

  return {
    http,
    properties: {
      list: (input, signal) =>
        http.get<Paginated<PropertySummary>>("/api/properties", input as Record<string, unknown>, { signal }),
      featured: async (limit = 6, signal) => {
        const res = await http.get<Paginated<PropertySummary>>(
          "/api/properties",
          { featured: true, pageSize: limit, sort: "FEATURED" },
          { signal },
        );
        return res.items;
      },
      getBySlug: (slug, signal) =>
        http.get<PropertyWithMedia>(`/api/properties/${encodeURIComponent(slug)}`, undefined, { signal }),
    },
    leads: {
      create: (input, signal) => http.post<{ id: string }>("/api/leads", input, { signal }),
    },
  };
}
