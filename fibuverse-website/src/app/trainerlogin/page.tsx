"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginTrainer } from "@/api/trainer"; // ✅ import your centralized API function

export default function TrainerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginTrainer(email, password);

      // ✅ Save tokens and user info
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("trainer_user", JSON.stringify(data.user));

      router.push("/trainer/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="min-h-screen flex flex-col bg-gray-900 text-white px-4 relative overflow-hidden">
    {/* 🌟 Floating Dots Background */}
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(35)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 blur-[1px]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `gentle-drift ${20 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>

    {/* 🔙 Top-left back button */}
    <div className="flex items-center justify-start py-2 relative z-10">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="bg-gray-600 hover:bg-gray-500 transition rounded-md px-3 py-1.5 text-xs font-medium"
      >
        ← Back
      </button>
    </div>

    {/* 🧠 Centered login form */}
    <div className="flex-1 flex items-center justify-center relative z-10">
      <div className="bg-gray-800 rounded-xl shadow-md p-6 w-full max-w-sm text-center border border-gray-700/50">
        <h1 className="text-xl font-bold mb-4">Trainer Portal</h1>

        <form onSubmit={handleLogin} className="space-y-3">
          {/* Email */}
          <div>
            <label className="block text-gray-400 mb-1 text-left text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full p-2.5 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-400 mb-1 text-left text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full p-2.5 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-md py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>

    {/* 🌬️ Gentle drift animation */}
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
