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
export async function runPublicCompositeAgent(agentId: number, inputs: Record<string, string>) {
  if (!API_URL) {
    throw new Error("API_URL is not defined in environment variables.");
  }

  try {
    const payload = {
      id: agentId,
      ...inputs,
    };

    const response = await fetch(`${API_URL}/developer/run-public-composite-agent/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to run public composite agent.");
    }

    return data; // { run_id, status, outputs }
  } catch (error) {
    console.error("Error running public composite agent:", error);
    throw error;
  }
}