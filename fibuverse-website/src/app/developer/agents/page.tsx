"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSubAgents } from "@/api/developer"; // ✅ import your API helper
import AgentSidebar from "@/components/agents/AgentSidebar"
import { SubAgentNetworkGraph } from "@/components/agents/SubAgentNetworkGraph"

interface SubAgent {
  id: number;
  name: string;
  filename: string;
  description: string;
  inputs: Record<string, { type: string; required?: boolean; description?: string }>;
  outputs: Record<string, { type: string; description?: string }>;
  allow_frontend: boolean;

  // New fields
  meta_category: "food" | "cardio" | "weights" | "other";
  sub_category:
    | "embedding"
    | "detection"
    | "aggregation"
    | "analysis"
    | "retrieval"
    | "api"
    | "orchestrator"
    | "classifier"
    | "structure"
    | "monitoring";
}

export default function DeveloperAgentsView() {
  const router = useRouter();
  const [agents, setAgents] = useState<SubAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SubAgent | null>(null);
  const [search,] = useState("");

  useEffect(() => {
    async function loadAgents() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/developer/login");
          return;
        }
        const fetched = await fetchSubAgents();

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

  // First, sort and group the agents
  const groupedAgents = filteredAgents
    .sort((a, b) => a.name.localeCompare(b.name)) // sort by name first
    .reduce<Record<string, Record<string, SubAgent[]>>>((acc, agent) => {
      const meta = agent.meta_category || "Other";
      const sub = agent.sub_category || "Other";

      if (!acc[meta]) acc[meta] = {};
      if (!acc[meta][sub]) acc[meta][sub] = [];

      acc[meta][sub].push(agent);
      return acc;
    }, {});

  // Sort categories and subcategories alphabetically
  const sortedMetaCategories = Object.keys(groupedAgents).sort();

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <AgentSidebar
        groupedAgents={groupedAgents}
        sortedMetaCategories={sortedMetaCategories}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
      />
      {/* Right content */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedAgent ? (
          <>
            <h1 className="text-2xl font-bold mb-6">{selectedAgent.name}</h1>
            
            {/* Network Visualization */}
            <SubAgentNetworkGraph agent={selectedAgent} />
            
            {/* Additional details or actions */}
            <div className="mt-6 space-y-4">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-300">{selectedAgent.description}</p>
              </div>
              
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">Select an agent to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}