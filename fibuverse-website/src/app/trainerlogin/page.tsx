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
    <div className="min-h-screen flex flex-col bg-gray-900 text-white px-6 relative overflow-hidden">
      {/* 🌟 Floating Dots Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full opacity-30 blur-[1px]"
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
      <div className="flex items-center justify-start py-4 relative z-10">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="bg-gray-600 hover:bg-gray-500 transition rounded-lg px-4 py-2 font-semibold text-sm"
        >
          ← Back
        </button>
      </div>

      {/* 🧠 Centered login form */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md text-center border border-gray-700/50">
          <h1 className="text-2xl font-bold mb-6">Trainer Portal</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-gray-400 mb-1 text-left">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 mb-1 text-left">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(10px) translateX(-10px); }
          75% { transform: translateY(-15px) translateX(5px); }
        }
      `}</style>
    </div>
  );
}
