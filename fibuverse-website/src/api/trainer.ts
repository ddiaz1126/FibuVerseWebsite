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
