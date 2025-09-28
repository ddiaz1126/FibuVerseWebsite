const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ------------------ Refresh Token API Wrapper Functions
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

// API Calls
export async function loginTrainer(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: 1 }), // hardcoded trainer role
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

// ✅ New function to fetch clients for the logged-in trainer
export async function getTrainerClients() {
  try {
    const data = await fetchWithAutoRefresh("/trainers/get-trainer-clients-full-data/");
    return data;
  } catch (err: any) {
    console.error("[getTrainerClients] error:", err);
    throw err;
  }
}

export async function getTrainerWorkouts() {
  try {
    const data = await fetchWithAutoRefresh("/trainers/trainer-workouts/");
    return data;
  } catch (err: any) {
    console.error("[getTrainerWorkouts] error:", err);
    throw err;
  }
}

// ✅ New logout function
export async function logoutTrainer(refreshToken: string, accessToken?: string) {
  const res = await fetch(`${API_URL}/api/logout/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Logout failed");
  return data;
}

export async function getTrainerChatHistory() {
  try {
    const data = await fetchWithAutoRefresh("/chat/trainer_chat_history/");
    console.log("Fetched chat history:", data);
    return data;
  } catch (err: any) {
    console.error("[getTrainerChatHistory] error:", err);
    throw err;
  }
}
export async function getTrainerDashboardMetrics() {
  try {
    const data = await fetchWithAutoRefresh("/trainers/get-trainer-metrics/");
    console.log("Fetched Trainer Dashboard Metrics Data:", data);
    return data;
  } catch (err: any) {
    console.error("[getTrainerDashboardMetrics] error:", err);
    throw err;
  }
}
export async function getTrainerPrograms() {
  try {
    const data = await fetchWithAutoRefresh("/trainers/get-programs/");
    console.log("Fetched programs:", data);
    return data;
  } catch (err: any) {
    console.error("[getTrainerPrograms] error:", err);
    throw err;
  }
}

export async function getClientWeightsMetaData(client_id: number) {
  try {
    const data = await fetchWithAutoRefresh(`/trainers/get-client-weights-metadata/${client_id}/`);
    console.log("Fetched client weights metadata:", data);
    return data;
  } catch (err: any) {
    console.error("[getClientWeightsMetaData] error:", err);
    throw err;
  }
}

export async function getClientWeightsSessionData(client_id: number) {
  try {
    const data = await fetchWithAutoRefresh(`/trainers/get-client-weights-session-insights/${client_id}/`);
    console.log("Fetched client weights session data:", data);
    return data;
  } catch (err: any) {
    console.error("[getClientWeightsSessionData] error:", err);
    throw err;
  }
}

export async function getClientCardioMetaData(client_id: number) {
  try {
    const data = await fetchWithAutoRefresh(`/trainers/get-client-cardio-metadata/${client_id}/`);
    console.log("Fetched client cardio metadata:", data);
    return data;
  } catch (err: any) {
    console.error("[getClientCardioMetaData] error:", err);
    throw err;
  }
}

export async function getClientCardioSessionData(client_id: number) {
  try {
    const data = await fetchWithAutoRefresh(`/trainers/get-client-cardio-session-insights/${client_id}/`);
    console.log("Fetched client cardio session data:", data);
    return data;
  } catch (err: any) {
    console.error("[getClientCardioSessionData] error:", err);
    throw err;
  }
}

export async function getClientNutrittionData(client_id: number) {
  try {
    const data = await fetchWithAutoRefresh(`/trainers/get-client-nutrition-data/${client_id}/`);
    console.log("Fetched client nutrition:", data);
    return data;
  } catch (err: any) {
    console.error("[getClientNutritionData] error:", err);
    throw err;
  }
}

// Metrics
export async function getClientMetricsData(client_id: number) {
  try {
    const data = await fetchWithAutoRefresh(`/trainers/get-specific-client-metrics/${client_id}/`);
    console.log("Fetched client metrics:", data);
    return data;
  } catch (err: any) {
    console.error("[getClientMetricsData] error:", err);
    throw err;
  }
}
// Fetch Alerts for Trainer
export async function getTrainerAlerts() {
  try {
    const data = await fetchWithAutoRefresh(`/trainers/get-trainer-alerts/`);
    console.log("Fetched trainer alerts:", data);
    return data;
  } catch (err: any) {
    console.error("[getTrainerAlerts] error:", err);
    throw err;
  }
}
// Post Body Measurements
export async function sendBodyMeasurementData(
  payload: { client_id?: number; [key: string]: any }
) {
  try {
    const data = await postWithAutoRefresh(
      "/clients/add-body-measurement/",
      payload
    );
    console.log("Send body measurement metrics:", data);
    return data;
  } catch (err: any) {
    console.error("[sendBodyMeasurementData] error:", err);
    throw err;
  }
}

// Post Health Metrics
export async function sendHealthMetricsData(
  payload: { client_id?: number; [key: string]: any }
) {
  try {
    const data = await postWithAutoRefresh(
      "/clients/add-health-metric/",
      payload
    );
    console.log("Send health metrics:", data);
    return data;
  } catch (err: any) {
    console.error("[sendHealthMetricsData] error:", err);
    throw err;
  }
}

// Post Body Fat Skinfolds
export async function sendBodyFatData(
  payload: { client_id?: number; [key: string]: any }
) {
  try {
    const data = await postWithAutoRefresh(
      "/clients/add-body-fat-skinfolds/",
      payload
    );
    console.log("Send Body Fat Skinfolds:", data);
    return data;
  } catch (err: any) {
    console.error("[sendBodyFatData] error:", err);
    throw err;
  }
}

// Crete Client
export async function createClient(payload: { [key: string]: any }) {
  try {
    const data = await postWithAutoRefresh("/trainers/add-client/", payload);
    console.log("Client created successfully:", data);
    return data;
  } catch (err: any) {
    console.error("[createClient] error:", err);
    throw err;
  }
}
