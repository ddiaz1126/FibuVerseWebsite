// developer.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
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
export async function fetchWithAutoRefresh(endpoint: string, options: RequestInit = {}) {
  let token = localStorage.getItem("accessToken") ?? null;

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
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.warn("[fetchWithAutoRefresh] response is not valid JSON:", text);
    // If the caller expects JSON, throw. Otherwise return an empty object.
    throw new Error("API did not return valid JSON");
  }

  if (!res.ok) {
    const errMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    throw new Error(errMsg);
  }

  return data;
}

/**
 * POST JSON wrapper with automatic token refresh (tries once).
 */
export async function postWithAutoRefresh(endpoint: string, payload: any, options: RequestInit = {}) {
  let token = localStorage.getItem("accessToken") ?? null;

  // Base headers for JSON POST
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
    // retry with new token
    const retryHeaders = { ...baseHeaders, Authorization: `Bearer ${newToken}` };
    res = await doFetch(retryHeaders);
  }

  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.warn("[postWithAutoRefresh] response is not valid JSON:", text);
    throw new Error("API did not return valid JSON");
  }

  if (!res.ok) {
    const errMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    throw new Error(errMsg);
  }

  return data;
}

/**
 * POST FormData wrapper with auto-refresh (works for file uploads).
 * Does not set Content-Type (browser will set boundary).
 */
export async function postFormDataWithAutoRefresh(endpoint: string, formData: FormData) {
  let token = localStorage.getItem("accessToken") ?? null;

  const doFetch = async (authToken: string | null) => {
    const headers: Record<string, string> = {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      // intentionally DO NOT set Content-Type
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
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.warn("[postFormDataWithAutoRefresh] response is not valid JSON:", text);
    throw new Error("API did not return valid JSON");
  }

  if (!res.ok) {
    const errMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
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

export async function fetchSubAgents() {
  const data = await fetchWithAutoRefresh("/developer/fetch-sub-agents/", {
    method: "GET",
  });

  console.log("Parsed JSON:", data); // optional debug log
  return data.subagents; // backend returns { subagents: [...] }
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

export interface RunCompositeResponse {
  run_id: number;
  status: string;
  outputs: Record<string, any>;
  history_id?: number;
}
export async function runCompositeAgentFormData(
  formData: FormData
): Promise<RunCompositeResponse> {
  const data = await postFormDataWithAutoRefresh("/developer/run-composite-agent/", formData);

  console.log("Workflow run results:", data);
  return data;
}

export interface WorkflowRun {
  id: number;                     // history entry ID
  workflow_id: number;            // which workflow / composite agent
  inputs: Record<string, any>;    // inputs used
  outputs: Record<string, any>;   // outputs produced
  started_at: string;             // timestamp
  finished_at?: string;           // optional timestamp
  status: "pending" | "running" | "success" | "failed";  
  error_message?: string;         // optional error message
}

export async function fetchWorkflowHistory(workflowId: number) {
  const data = await fetchWithAutoRefresh(
    `/developer/fetch-composite-agent-history/?composite_agent_id=${workflowId}`,
    { method: "GET" }
  );

  console.log("Fetched workflow history:", data);
  // backend should return { runs: [...] }, fallback to []
  return data.runs ?? [];
}
