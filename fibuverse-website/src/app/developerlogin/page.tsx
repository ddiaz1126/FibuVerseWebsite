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
    <div className="min-h-screen flex flex-col bg-gray-900 text-white px-6 relative overflow-hidden">
      {/* Floating dots background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `gentle-drift ${20 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-start py-4 relative z-10">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="bg-gray-600 hover:bg-gray-500 transition rounded-lg px-4 py-2 text-sm font-semibold"
        >
          ← Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6">Developer Portal</h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 mb-4 text-sm rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 mb-6 text-sm rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes gentle-drift {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(10px) translateX(-10px); }
          75% { transform: translateY(-15px) translateX(5px); }
        }
      `}</style>
    </div>
  );
}