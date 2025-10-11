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
<div className="flex-none w-1/3 md:w-1/4 lg:w-1/5 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 p-3 flex flex-col rounded-xl m-2">
      {/* Add Agent Button */}
      {/* <button
        className="mb-3 flex-shrink-0 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-3 py-2 text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20 transform hover:scale-[1.02]"
        onClick={() => router.push("/developer/agent/create")}
      >
        + Add Agent
      </button> */}

      {/* Search Input */}
      <div className="relative mb-3 flex-shrink-0">
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 pl-8 text-sm rounded-lg bg-gray-900/50 border border-gray-700 placeholder-gray-400 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        />
        <svg
          className="w-4 h-4 text-gray-500 absolute left-2.5 top-2.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Scrollable agent list */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0">
        {sortedMetaCategories.length === 0 ? (
          <div className="text-center text-gray-400 mt-4 text-sm animate-pulse">
            Loading agents...
          </div>
        ) : (
          sortedMetaCategories.map((meta) => {
            const subCategories = Object.keys(groupedAgents[meta]).sort();
            return (
              <div key={meta} className="divide-y divide-gray-700/30">
                {/* Meta Category */}
                <div className="text-gray-400 font-semibold uppercase text-xs px-3 py-1.5">
                  {meta}
                </div>

                {subCategories.map((sub) => (
                  <div key={sub} className="mb-2">
                    {/* Subcategory */}
                    <div className="text-blue-400 font-semibold uppercase text-[10px] px-4 py-1">
                      {sub}
                    </div>

                    {/* Agents */}
                    {groupedAgents[meta][sub]
                      .filter(agent => agent.name.toLowerCase().includes(search.toLowerCase()))
                      .map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => onSelectAgent(agent)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-700/30 transition-all truncate text-sm ${
                            selectedAgent?.id === agent.id
                              ? "bg-gray-700/50 border-l-2 border-l-blue-500 font-semibold"
                              : ""
                          }`}
                        >
                          {agent.name}
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
