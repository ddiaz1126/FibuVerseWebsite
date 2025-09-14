"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSubAgents } from "@/api/developer"; // ✅ import your API helper

interface Agent {
  id: number;
  name: string;
}

export default function DeveloperAgentsView() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadAgents() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/developer/login");
          return;
        }
        const fetched = await fetchSubAgents(token);

        setAgents(fetched);
        if (fetched.length) setSelectedAgent(fetched[0]);
      } catch (err) {
        console.error("Failed to load subagents:", err);
      }
    }

    loadAgents();
  }, [router]);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <div className="w-1/4 border-r border-gray-700 bg-gray-800 p-4 flex flex-col h-screen">
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none mb-2"
        />

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {filteredAgents.map(agent => (
            <button
              key={agent.id}
              className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition ${
                selectedAgent?.id === agent.id ? "bg-gray-700 font-semibold" : ""
              }`}
              onClick={() => setSelectedAgent(agent)}
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">{selectedAgent?.name || "Select an Agent"}</h1>
        <p>
          This is the placeholder area for <strong>{selectedAgent?.name}</strong> details.
        </p>

        {selectedAgent && (
          <div className="mt-4 space-y-4">
            <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
              Edit Agent
            </button>
            <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
              Delete Agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
