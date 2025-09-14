const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
export async function getTrainerClients(token: string) {
  const res = await fetch(`${API_URL}/trainers/get-trainer-clients-full-data/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // assuming JWT auth
    },
  });

  // Log the status and headers
  console.log("Status:", res.status);
  console.log("Content-Type:", res.headers.get("Content-Type"));

  // Get the raw text first
  const text = await res.text();
  console.log("Raw response:", text);

  // Now try parsing JSON
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    throw new Error("API did not return valid JSON");
  }

  if (!res.ok) throw new Error(data.error || "Failed to fetch clients");

  // Log parsed JSON
  console.log("Parsed JSON:", data);

  return data;
}

export async function getTrainerWorkouts(token: string) {
  const res = await fetch(`${API_URL}/trainers/trainer-workouts/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch workouts");
  return data;
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

export async function getTrainerChatHistory(token: string) {
  const res = await fetch(`${API_URL}/chat/trainer_chat_history/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // assuming JWT auth
    },
  });

  // Log status & raw response
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Raw response:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    throw new Error("API did not return valid JSON");
  }

  if (!res.ok) throw new Error(data.error || "Failed to fetch chat history");

  console.log("Parsed chat history:", data);
  return data;
}

export async function getTrainerPrograms(token: string) {
  const res = await fetch(`${API_URL}/trainers/get-programs/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // JWT from loginTrainer
    },
  });

  // Debugging logs
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Raw response:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    throw new Error("API did not return valid JSON");
  }

  if (!res.ok) throw new Error(data.error || "Failed to fetch programs");

  console.log("Parsed programs:", data);
  return data;
}
