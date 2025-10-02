// developer.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface RefreshResponse {
  access?: string;
  refresh?: string;
  [key: string]: unknown;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    console.warn("[auth] No refresh token available");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const text = await res.text();
    let data: RefreshResponse = {};
    try {
      data = text ? JSON.parse(text) as RefreshResponse : {};
    } catch {
      console.warn("[auth] refresh returned non-json:", text);
      return null;
    }

    if (!res.ok) {
      console.warn("[auth] refresh failed:", data);
      return null;
    }

    if (data.access) {
      localStorage.setItem("accessToken", data.access);
      console.log("[auth] Obtained new access token");
      return data.access;
    }

    console.warn("[auth] refresh response missing access token:", data);
    return null;
  } catch (err) {
    console.error("[auth] refreshAccessToken error:", err);
    return null;
  }
}

/**
 * Generic JSON fetch wrapper with automatic token refresh (tries once).
 */
export async function fetchWithAutoRefresh<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("accessToken") ?? null;

  // Build headers object we can mutate for retry
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };
  if (token) baseHeaders["Authorization"] = `Bearer ${token}`;

  const doFetch = async (hdrs: Record<string, string>) => {
    const mergedOptions = { ...options, headers: hdrs };
    return await fetch(`${API_URL}${endpoint}`, mergedOptions);
  };

  let res = await doFetch(baseHeaders);

  if (res.status === 401) {
    console.info("[fetchWithAutoRefresh] 401 received, attempting token refresh");
    const newToken = await refreshAccessToken();
    if (!newToken) {
      throw new Error("Access token expired. Please login again.");
    }
    // retry with new token
    const retryHeaders = { ...baseHeaders, Authorization: `Bearer ${newToken}` };
    res = await doFetch(retryHeaders);
  }

  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    console.warn("[fetchWithAutoRefresh] response is not valid JSON:", text);
    throw new Error("API did not return valid JSON");
  }

  if (!res.ok) {
    const errObj = data as { error?: string; message?: string } | undefined;
    const errMsg = errObj?.error || errObj?.message || `Request failed with status ${res.status}`;
    throw new Error(errMsg);
  }

  return data as T;
}


/**
 * POST JSON wrapper with automatic token refresh (tries once).
 */
export async function postWithAutoRefresh<T = unknown>(
  endpoint: string,
  payload: T,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("accessToken") ?? null;

  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };
  if (token) baseHeaders["Authorization"] = `Bearer ${token}`;

  const doFetch = async (hdrs: Record<string, string>) => {
    const mergedOptions: RequestInit = {
      method: "POST",
      ...options,
      headers: hdrs,
      body: JSON.stringify(payload),
    };
    return await fetch(`${API_URL}${endpoint}`, mergedOptions);
  };

  let res = await doFetch(baseHeaders);

  if (res.status === 401) {
    console.info("[postWithAutoRefresh] 401 received, attempting token refresh");
    const newToken = await refreshAccessToken();
    if (!newToken) {
      throw new Error("Access token expired. Please login again.");
    }
    const retryHeaders = { ...baseHeaders, Authorization: `Bearer ${newToken}` };
    res = await doFetch(retryHeaders);
  }

  const text = await res.text();
  let data: T;
  try {
    data = text ? JSON.parse(text) : ({} as T);
  } catch {
    console.warn("[postWithAutoRefresh] response is not valid JSON:", text);
    throw new Error("API did not return valid JSON");
  }

  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;

    if (typeof data === "object" && data !== null) {
      const d = data as Record<string, unknown>;
      if (typeof d.error === "string") errMsg = d.error;
      else if (typeof d.message === "string") errMsg = d.message;
    }

    throw new Error(errMsg);
  }
  return data;
}


/**
 * POST FormData wrapper with auto-refresh (works for file uploads).
 * Does not set Content-Type (browser will set boundary).
 */
export async function postFormDataWithAutoRefresh<T = unknown>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  let token = localStorage.getItem("accessToken") ?? null;

  const doFetch = async (authToken: string | null) => {
    const headers: Record<string, string> = {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      // intentionally DO NOT set Content-Type for FormData
    };
    return await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      body: formData,
      headers,
    });
  };

  let res = await doFetch(token);

  if (res.status === 401) {
    console.info("[postFormDataWithAutoRefresh] 401 received, attempting token refresh");
    const newToken = await refreshAccessToken();
    if (!newToken) {
      throw new Error("Access token expired. Please login again.");
    }
    token = newToken;
    res = await doFetch(token);
  }

  const text = await res.text();
  let data: T;
  try {
    data = text ? JSON.parse(text) : ({} as T);
  } catch {
    console.warn("[postFormDataWithAutoRefresh] response is not valid JSON:", text);
    throw new Error("API did not return valid JSON");
  }

  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;

    if (typeof data === "object" && data !== null) {
      const d = data as Record<string, unknown>;
      if (typeof d.error === "string") errMsg = d.error;
      else if (typeof d.message === "string") errMsg = d.message;
    }

    throw new Error(errMsg);
  }

  return data;
}

/* --- The rest of your API functions (unchanged) --- */

export async function loginDeveloper(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: 2 }), // hardcoded trainer role
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

interface SubAgent {
  id: number;
  name: string;
  filename: string;
  description: string;
  inputs: Record<string, { type: string; required?: boolean; description?: string }>;
  outputs: Record<string, { type: string; description?: string }>;
  allow_frontend: boolean;

  // New fields
  meta_category: "food" | "cardio" | "weights" | "other";
  sub_category:
    | "embedding"
    | "detection"
    | "aggregation"
    | "analysis"
    | "retrieval"
    | "api"
    | "orchestrator"
    | "classifier"
    | "structure"
    | "monitoring";
}

interface FetchSubAgentsResponse {
  subagents: SubAgent[];
}

export async function fetchSubAgents(): Promise<SubAgent[]> {
  // tell TypeScript what the response shape is
  const data = await fetchWithAutoRefresh<FetchSubAgentsResponse>("/developer/fetch-sub-agents/", {
    method: "GET",
  });

  console.log("Parsed JSON:", data);
  return data.subagents;
}

export async function createWorkflow(payload: {
  name: string;
  description?: string;
  layers: string[][];
}) {
  const data = await fetchWithAutoRefresh("/developer/create-composite-agent/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  console.log("Parsed JSON:", data);
  return data; // backend returns { message, id }
}

export async function fetchWorkflows() {
  const data = await fetchWithAutoRefresh("/developer/fetch-composite-agents/", {
    method: "GET",
  });

  console.log("Fetched Workflows:", data); // optional debug
  return data; // backend already returns list of composite agents
}

// Generic JSON-compatible type
export type JsonData = string | number | boolean | null | JsonDataObject | JsonData[];
export interface JsonDataObject {
  [key: string]: JsonData;
}

export interface RunCompositeResponse {
  run_id: number;
  status: string;
  outputs: JsonDataObject;
  history_id?: number;
}

export async function runCompositeAgentFormData(
  formData: FormData
): Promise<RunCompositeResponse> {
  const data = await postFormDataWithAutoRefresh<RunCompositeResponse>(
    "/developer/run-composite-agent/",
    formData
  );

  console.log("Workflow run results:", data);
  return data;
}

export type RunStatus = "pending" | "running" | "succeeded" | "failed" | (string & {});

/** Input/output are opaque JSON objects for now — safer than `any` */
export type JsonObject = Record<string, unknown>;

/** Single run record matching your Python serializer */
export interface RunRecord {
  id: number;
  status: RunStatus;           // e.g. run.status.lower()
  inputs: JsonObject | null;   // your run.inputs
  outputs: JsonObject | null;  // your run.outputs
  started_at: string;          // ISO datetime string
  finished_at: string | null;  // ISO datetime string or null
}

export interface WorkflowHistoryResponse {
  runs: RunRecord[];
}

export async function fetchWorkflowHistory(workflowId: number) {
  const data = await fetchWithAutoRefresh<WorkflowHistoryResponse>(
    `/developer/fetch-composite-agent-history/?composite_agent_id=${workflowId}`,
    { method: "GET" }
  );

  console.log("Fetched workflow history:", data);
  // backend should return { runs: [...] }, fallback to []
  return data.runs ?? [];
}

