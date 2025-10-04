// public.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
/**
 * Fetch all public composite agents from the backend.
 * Returns an array of CompositeAgent objects.
 */
export async function fetchPublicCompositeAgents() {
  if (!API_URL) {
    throw new Error("API_URL is not defined in environment variables.");
  }

  try {
    const response = await fetch(`${API_URL}/developer/fetch-public-composite-agents/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch public composite agents: ${response.status}`);
    }

    const data = await response.json();
    return data; // array of composite agents
  } catch (error) {
    console.error("Error fetching public composite agents:", error);
    return [];
  }
}

export async function postFormData<T = unknown>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    body: formData,
    // No Authorization header needed
  });

  const text = await res.text();
  let data: T;

  try {
    data = text ? JSON.parse(text) : ({} as T);
  } catch {
    console.warn("[postFormData] response is not valid JSON:", text);
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
 * Fetch count composite agents from the backend.
 * Returns an integer.
 */
export async function fetchCompositeAgentCount(): Promise<number> {
  if (!API_URL) {
    throw new Error("API_URL is not defined in environment variables.");
  }

  try {
    const response = await fetch(`${API_URL}/developer/fetch-composite-agent-count/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch composite agent count: ${response.status}`);
    }

    const data = await response.json();
    return data.count; // <-- extract the count
  } catch (error) {
    console.error("Error fetching composite agent count:", error);
    return 0; // default fallback
  }
}

/**
 * Run a public composite agent with given inputs.
 * Returns the workflow run result including run_id and outputs.
 */
export async function runPublicCompositeAgent(
  agentId: number,
  inputs: Record<string, string | File | null>
) {
  const formData = new FormData();

  // Append the agent ID to the POST body
  formData.append("id", agentId.toString());

  // Append other inputs
  for (const [key, value] of Object.entries(inputs)) {
    if (value instanceof File) {
      formData.append(key, value); // ✅ append file
    } else if (value !== null) {
      formData.append(key, value); // ✅ append string
    }
  }

  return await postFormData(
    `/developer/run-public-composite-agent/`, // ✅ no ID in path
    formData
  );
}
