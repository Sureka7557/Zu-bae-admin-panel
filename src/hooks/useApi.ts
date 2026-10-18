import { useMemo, useRef } from "react";
import { useAuth } from "@clerk/react";
import { API_BASE } from "../api/endpoints";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Authenticated fetch helpers for the server API.
 * Sends the admin Clerk session token as a Bearer token; the server verifies
 * it against the admin Clerk app (see requireAdmin.ts).
 */
export function useApi() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  return useMemo(() => {
    async function request<T = unknown>(method: Method, path: string, body?: unknown): Promise<ApiResponse<T>> {
      const token = await getTokenRef.current();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      let payload: BodyInit | undefined;
      if (body instanceof FormData) {
        payload = body; // the browser sets the multipart boundary
      } else if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        payload = JSON.stringify(body);
      }

      let res: Response;
      try {
        res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload });
      } catch {
        throw new Error("Can't reach the server. Check that the API is running and VITE_API_URL is correct.");
      }

      const json = await res.json().catch(() => null);
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message ?? `Request failed (${res.status})`);
      }
      return json as ApiResponse<T>;
    }

    return {
      get: <T = unknown>(path: string) => request<T>("GET", path),
      post: <T = unknown>(path: string, body?: unknown) => request<T>("POST", path, body),
      put: <T = unknown>(path: string, body?: unknown) => request<T>("PUT", path, body),
      patch: <T = unknown>(path: string, body?: unknown) => request<T>("PATCH", path, body),
      del: <T = unknown>(path: string) => request<T>("DELETE", path),
    };
  }, []);
}
