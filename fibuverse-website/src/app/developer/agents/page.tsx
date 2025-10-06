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
    <div className="flex h-full">
      <AgentSidebar
        groupedAgents={groupedAgents}
        sortedMetaCategories={sortedMetaCategories}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
      />
      
      <div className="flex-1 p-6 overflow-auto">
        {selectedAgent ? (
          <>
            <h1 className="text-2xl font-bold mb-6">{selectedAgent.name}</h1>
            
            <SubAgentNetworkGraph agent={selectedAgent} />
            
            <div className="mt-6 space-y-4">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-300">{selectedAgent.description}</p>
              </div>

              {/* Test SubAgent Section - NOW INSIDE selectedAgent block */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h2 className="text-lg font-semibold mb-4">Test SubAgent</h2>
                
                {/* Inputs Section */}
                <div className="mb-6">
                  <h3 className="text-base font-medium mb-3">Inputs</h3>
                  <div className="space-y-3">
                    {Object.entries(selectedAgent.inputs ?? {}).map(([key, spec]) => (
                      <div key={key}>
                        <label className="block text-sm text-gray-300 mb-1">
                          {key}
                          {spec.required && <span className="text-red-400 ml-1">*</span>}
                          {spec.description && (
                            <span className="text-gray-500 text-xs ml-2">
                              ({spec.description})
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          placeholder={`Enter ${key} (${spec.type})`}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                          value={inputValues[key] || ""}
                          onChange={(e) => {
                            setInputValues(prev => ({...prev, [key]: e.target.value}))
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={handleRunAgent}
                    disabled={isRunning}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    {isRunning ? "Running..." : "Run Agent"}
                  </button>
                </div>

                {/* Outputs Section */}
                <div>
                  <h3 className="text-base font-medium mb-3">Outputs</h3>
                  {agentOutput ? (
                    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 space-y-3">
                      {Object.entries(agentOutput).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm text-gray-400 mb-1">
                            {key}
                          </label>
                          <div className="bg-black/30 rounded px-3 py-2 text-sm text-gray-300 font-mono overflow-auto max-h-96">
                            {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? "N/A")}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-lg border border-gray-700 border-dashed p-8 text-center">
                      <p className="text-gray-500 text-sm">
                        No output yet. Run the agent to see results.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">Select an sub agent to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}