"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginDeveloper } from "@/api/developer"; // ✅ import your API helper

export default function DeveloperLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const data = await loginDeveloper(email, password);

      // Store tokens and user info
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("developer_user", JSON.stringify(data.user));

      // Redirect to developer dashboard
      router.push("/developer/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Login failed:", err.message);
        alert(err.message || "Login failed");
      } else {
        console.error("Login failed (unexpected):", err);
        alert("Login failed (unexpected error)");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white px-6">
      <div className="flex items-center justify-start py-4">
        <button
          type="button"
          onClick={() => router.push("/fibu/")} // main site
          className="bg-gray-600 hover:bg-gray-500 transition rounded-lg px-4 py-2 font-semibold"
        >
          ← Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-6">Developer Portal</h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-6 rounded bg-gray-700 border border-gray-600 text-white"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition rounded-lg py-3 font-semibold"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}
