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
  <div className="min-h-screen flex flex-col bg-gray-900 text-white px-4 relative overflow-hidden">
    {/* Floating dots background */}
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `gentle-drift ${15 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>

    {/* Back button */}
    <div className="flex items-center justify-start py-2 relative z-10">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="bg-gray-600 hover:bg-gray-500 transition rounded-md px-3 py-1.5 text-xs font-medium"
      >
        ← Back
      </button>
    </div>

    {/* Login card */}
    <div className="flex-1 flex items-center justify-center relative z-10">
      <div className="bg-gray-800 rounded-xl shadow-md p-4 w-full max-w-sm text-center border border-gray-700/50">
        <h1 className="text-xl font-bold mb-4">Developer Portal</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 text-xs rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 text-xs rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 transition rounded-md py-2 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </div>
    </div>

    {/* Gentle drift animation */}
    <style jsx>{`
      @keyframes gentle-drift {
        0%, 100% { transform: translateY(0) translateX(0); }
        25% { transform: translateY(-12px) translateX(6px); }
        50% { transform: translateY(6px) translateX(-6px); }
        75% { transform: translateY(-8px) translateX(4px); }
      }
    `}</style>
  </div>
);

}