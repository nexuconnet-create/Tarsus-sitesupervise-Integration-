import axios, { type AxiosInstance } from "axios";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:8000";
const PROJECT_ID = process.env.TEST_PROJECT_ID ?? "6ac9b447-2f3f-434f-9989-bd7fbd8b91f0";

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Unwrap { status, message, data } envelope
api.interceptors.response.use((response) => {
  if (
    response.data &&
    typeof response.data === "object" &&
    "status" in response.data &&
    "data" in response.data
  ) {
    response.data = response.data.data;
  }
  return response;
});

export const projectId = PROJECT_ID;
export const baseUrl = BASE_URL;

/** Inject the Bearer token (obtained once by globalSetup) into the shared api instance */
export function setupAuth(): void {
  const token = process.env.TEST_TOKEN;
  if (!token) throw new Error("TEST_TOKEN not set — ensure globalSetup ran and TEST_PASSWORD is provided");
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

/** Build a project-scoped URL */
export function url(path: string): string {
  return `/api/v1/projects/${projectId}${path}`;
}

/** Track created resources for cleanup */
const cleanupQueue: { fn: () => Promise<void> }[] = [];

export function trackCleanup(fn: () => Promise<void>) {
  cleanupQueue.push({ fn });
}

/** Cleanup all tracked resources (LIFO order) */
export async function runCleanup() {
  for (let i = cleanupQueue.length - 1; i >= 0; i--) {
    try {
      await cleanupQueue[i].fn();
    } catch { /* ok */ }
  }
  cleanupQueue.length = 0;
}

/** Create a PO and return its UUID (works around backend id:"" bug) */
export async function createPOAndGetId(payload: Record<string, unknown>): Promise<string> {
  await api.post(url("/inventory/purchase-orders/"), payload);
  // List POs (newest first) and find by supplier_name
  const res = await api.get(url("/inventory/purchase-orders/"), {
    params: { page_size: 5 },
  });
  const targetName = payload.supplier_name as string;
  const matched = res.data.results.find(
    (po: Record<string, unknown>) => {
      const supplier = po.supplier as Record<string, unknown> | undefined;
      return supplier?.name === targetName;
    },
  );
  if (!matched) throw new Error("Failed to find created PO after creation");
  return matched.id;
}
