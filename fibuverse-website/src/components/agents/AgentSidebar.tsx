"use client";

import { useState } from "react";

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
type AgentSidebarProps = {
  groupedAgents: Record<string, Record<string, SubAgent[]>>; // grouped by meta -> sub
  sortedMetaCategories: string[];
  selectedAgent: SubAgent | null;
  onSelectAgent: (agent: SubAgent) => void;
};

export default function AgentSidebar({
  groupedAgents,
  sortedMetaCategories,
  selectedAgent,
  onSelectAgent,
}: AgentSidebarProps) {
  const [search, setSearch] = useState("");

  return (
    <div className="w-1/4 border-r border-gray-700 bg-gray-800 p-4 flex flex-col h-screen">
      {/* Search */}
      <input
        type="text"
        placeholder="Search agents..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none mb-2"
      />

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {sortedMetaCategories.map((meta) => {
          const subCategories = Object.keys(groupedAgents[meta]).sort();

          return (
            <div key={meta} className="mb-4">
              {/* Meta Category Header */}
              <div className="text-gray-400 font-bold uppercase text-lg px-3 py-1">{meta}</div>

              {subCategories.map((sub) => (
                <div key={sub} className="mb-2">
                  {/* Subcategory Header */}
                  <div className="text-blue-400 font-bold uppercase text-sm px-4 py-1">{sub}</div>

                  {/* Agents */}
                  {groupedAgents[meta][sub]
                    .filter((agent) => agent.name.toLowerCase().includes(search.toLowerCase()))
                    .map((agent) => (
                      <button
                        key={agent.id}
                        className={`w-full text-left px-6 py-2 rounded hover:bg-gray-700 transition ${
                          selectedAgent?.id === agent.id ? "bg-gray-700 font-semibold" : ""
                        }`}
                        onClick={() => onSelectAgent(agent)}
                      >
                        {agent.name}
                      </button>
                    ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
