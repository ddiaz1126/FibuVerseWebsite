"use client";

import { useState, useEffect } from "react";

export default function DeveloperDashboard() {
  const [metrics, setMetrics] = useState({
    activeAgents: 0,
    workflows: 0,
    apiCallsToday: 0,
    errorsToday: 0,
  });

  useEffect(() => {
    // TODO: Replace with real API call to fetch developer stats
    setMetrics({
      activeAgents: 12,
      workflows: 5,
      apiCallsToday: 340,
      errorsToday: 3,
    });
  }, []);

  return (
    <div className="p-8 flex-1 overflow-auto">
      <h1 className="text-3xl font-bold mb-6">Developer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Agents */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h2 className="text-gray-400 text-sm mb-2">Active Agents</h2>
          <p className="text-2xl font-bold">{metrics.activeAgents}</p>
        </div>

        {/* Workflows */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h2 className="text-gray-400 text-sm mb-2">Workflows</h2>
          <p className="text-2xl font-bold">{metrics.workflows}</p>
        </div>

        {/* API Calls Today */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h2 className="text-gray-400 text-sm mb-2">API Calls Today</h2>
          <p className="text-2xl font-bold">{metrics.apiCallsToday}</p>
        </div>

        {/* Errors Today */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow hover:shadow-lg transition">
          <h2 className="text-gray-400 text-sm mb-2">Errors Today</h2>
          <p className="text-2xl font-bold text-red-500">{metrics.errorsToday}</p>
        </div>
      </div>

      {/* Placeholder for other dashboard widgets */}
      <div className="mt-8 space-y-6">
        <div className="bg-gray-800 p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-2">Recent Activity</h3>
          <p className="text-gray-400">You can add logs, recent API calls, or workflow changes here.</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-2">Quick Links</h3>
          <p className="text-gray-400">Links to agent creation, workflow editor, or documentation.</p>
        </div>
      </div>
    </div>
  );
}
