"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSubAgents, runSubAgentFormData } from "@/api/developer";
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

  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [agentOutput, setAgentOutput] = useState<Record<string, unknown> | null>(null);
  const [isRunning, setIsRunning] = useState(false);

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

  const groupedAgents = filteredAgents
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce<Record<string, Record<string, SubAgent[]>>>((acc, agent) => {
      const meta = agent.meta_category || "Other";
      const sub = agent.sub_category || "Other";

      if (!acc[meta]) acc[meta] = {};
      if (!acc[meta][sub]) acc[meta][sub] = [];

      acc[meta][sub].push(agent);
      return acc;
    }, {});

  const sortedMetaCategories = Object.keys(groupedAgents).sort();

  const handleRunAgent = async () => {
    if (!selectedAgent) return;

    setIsRunning(true);
    setAgentOutput(null);

    try {
      const formData = new FormData();
      formData.append("id", selectedAgent.id.toString());
      Object.entries(inputValues).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const result = await runSubAgentFormData(formData);
      
      console.log("Agent result:", result); // Debug log
      // Check if result has outputs property, otherwise use result directly
      setAgentOutput(result.outputs || result);

    } catch (error) {
      console.error("Error running agent:", error);
      setAgentOutput({ error: "Failed to execute agent" });
    } finally {
      setIsRunning(false);
    }
  };

return (
<div className="flex gap-3 p-3 text-sm bg-gray-950 min-h-screen">
    {/* Sidebar */}
    <AgentSidebar
      groupedAgents={groupedAgents}
      sortedMetaCategories={sortedMetaCategories}
      selectedAgent={selectedAgent}
      onSelectAgent={setSelectedAgent}
    />

    {/* Main Content */}
    <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg">
      {selectedAgent ? (
        <>
          {/* Header */}
          <div className="mb-4 pb-3 border-b border-gray-700">
            <h1 className="text-base font-bold text-white">{selectedAgent.name}</h1>
            <p className="text-xs text-gray-400 mt-1">{selectedAgent.description}</p>
          </div>

          {/* Network Graph */}
          <SubAgentNetworkGraph agent={selectedAgent} />

          {/* Content Sections */}
          <div className="mt-4 space-y-3">
            {/* Test SubAgent Section */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
              <h2 className="text-xs font-semibold mb-3 flex items-center gap-2 text-gray-300">
                <svg
                  className="w-3.5 h-3.5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Test SubAgent
              </h2>

              {/* Inputs */}
              <div className="mb-4">
                <h3 className="text-[10px] font-semibold mb-2 text-gray-400 uppercase tracking-wide">
                  Inputs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(selectedAgent.inputs ?? {}).map(([key, spec]) => (
                    <div key={key}>
                      <label className="block text-[10px] text-gray-300 mb-1">
                        {key}
                        {spec.required && <span className="text-red-400 ml-1">*</span>}
                        {spec.description && (
                          <span className="text-gray-500 text-[10px] ml-2">
                            ({spec.description})
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder={`Enter ${key} (${spec.type})`}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-2 py-1.5 text-[10px] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                        value={inputValues[key] || ""}
                        onChange={(e) =>
                          setInputValues((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleRunAgent}
                  disabled={isRunning}
                  className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg text-[10px] font-medium transition-all shadow-lg shadow-blue-500/20 transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isRunning ? "Running..." : "Run Agent"}
                </button>
              </div>

              {/* Outputs */}
              <div>
                <h3 className="text-[10px] font-semibold mb-2 text-gray-400 uppercase tracking-wide">
                  Outputs
                </h3>
                {agentOutput ? (
                  <div className="bg-black/30 rounded-lg border border-gray-700 p-3 space-y-2">
                    {Object.entries(agentOutput).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-[10px] text-gray-400 mb-1">{key}</label>
                        <div className="bg-gray-900/50 rounded px-2 py-1.5 text-[10px] text-gray-300 font-mono overflow-auto max-h-64">
                          {typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value ?? "N/A")}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900/30 rounded-lg border border-gray-700 border-dashed p-6 text-center">
                    <svg
                      className="w-6 h-6 mx-auto mb-1 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-[10px]">
                      No output yet. Run the agent to see results.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            <p className="text-gray-400 text-xs">Select a sub agent to view details</p>
          </div>
        </div>
      )}
    </div>
  </div>
);

}