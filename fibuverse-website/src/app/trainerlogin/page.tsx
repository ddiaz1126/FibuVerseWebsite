"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginTrainer } from "@/api/trainer"; // ✅ import your centralized API function

export default function TrainerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fixed typo (was "cconst")
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginTrainer(email, password);

      // ✅ Save tokens and user info in localStorage
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("trainer_user", JSON.stringify(data.user));

      // Redirect to dashboard
      router.push("/trainer/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Safe access to .message
        alert(err.message);
      } else {
        // Fallback for non-Error throws
        alert("An unknown error occurred");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white px-6">
      {/* Top-left back button */}
      <div className="flex items-center justify-start py-4">
        <button
          type="button"
          onClick={() => router.push("/")} // always goes to fibu/
          className="bg-gray-600 hover:bg-gray-500 transition rounded-lg px-4 py-2 font-semibold"
        >
          ← Back
        </button>
      </div>

      {/* Centered login form */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Trainer Portal</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-3 font-semibold"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
