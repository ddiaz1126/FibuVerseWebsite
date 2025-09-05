"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Trainer {
  user_id: number;
  email: string;
  username: string;
  roles: number[];
}

export default function TrainerDashboard() {
  const router = useRouter();
  const [trainer, setTrainer] = useState<Trainer | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("trainer_user");
    if (!stored) {
      router.push("/trainer/login");
      return;
    }
    setTrainer(JSON.parse(stored));
  }, [router]);

  if (!trainer) return <div className="p-8 text-white">Loading trainer info...</div>;

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="text-sm text-gray-300">
            Welcome, <strong className="text-white">{trainer.username}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-2">Clients</h2>
            <p>Manage your clients here.</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-2">Workouts</h2>
            <p>Create and analyze workouts.</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-2">Nutrition</h2>
            <p>Track and suggest nutrition plans.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
