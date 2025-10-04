"use client";

import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchSubAgents, createWorkflow } from "@/api/developer"; // ✅ API helper
import AgentSidebar from "@/components/agents/AgentSidebar"
import AgentGoalEditor from "@/components/agents/AgentGoalEditor"
import { SubAgentNetworkGraph } from "@/components/agents/SubAgentNetworkGraph"

// interface Agent {
//   id: number;
//   name: string;
// }
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

interface Layer {
  id: string;
  nodes: number[]; // store agent ids
}

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
}

export default function CreateWorkflowPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [layers, setLayers] = useState<Layer[]>([
    { id: "layer-1", nodes: [] },
    { id: "layer-2", nodes: [] },
    { id: "layer-3", nodes: [] },
  ]);
  const [loading, setLoading] = useState(false);

  // fetched agents from backend
  const [agents, setAgents] = useState<SubAgent[]>([]);
  
  // optional: track a selected agent object (not strictly needed)
  const [selectedAgent, setSelectedAgent] = useState<SubAgent | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  // const [selectedLayer, setSelectedLayer] = useState<string>(layers[0]?.id || "");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const minLayers = 2;
  const maxLayers = 8;

  // refs for DOM measurement
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // positions keyed by "col-nodeIndex-agentId"
  const [positions, setPositions] = useState<Record<string, Rect>>({});

  // Searching
  const [search,] = useState("");

  // Markdown Section
  const [agentGoal, setAgentGoal] = useState('');

  // load agents on mount
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

  // helper: find agent by id
  const findAgent = (id: number) => agents.find((a) => a.id === id) ?? null;

  // helper: is agent already in workflow?
  const isInWorkflow = (agentId: number) =>
    layers.some((layer) => layer.nodes.includes(agentId));

  // layer controls
  const addLayer = () => {
    if (layers.length >= maxLayers) return;
    setLayers((prev) => [...prev, { id: `layer-${prev.length + 1}`, nodes: [] }]);
  };

  const removeLayer = () => {
    if (layers.length <= minLayers) return;
    setLayers((prev) => prev.slice(0, -1));
  };

  // Add node (by agent id) to layer
  const addNodeToLayer = (layerId: string, agentId: number) => {
    if (isInWorkflow(agentId)) {
      alert(`${findAgent(agentId)?.name ?? agentId} is already in the workflow.`);
      return;
    }
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, nodes: [...layer.nodes, agentId] } : layer
      )
    );
  };

  const removeNodeFromLayer = (layerId: string, agentId: number) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, nodes: layer.nodes.filter((n) => n !== agentId) } : layer
      )
    );
    // positions and refs will be recomputed by layout effect
  };

  // Recompute node positions after render / when layers change / on resize
  useLayoutEffect(() => {
    const compute = () => {
      const container = containerRef.current;
      if (!container) return;
      const contRect = container.getBoundingClientRect();

      const newPositions: Record<string, Rect> = {};
      Object.entries(nodeRefs.current).forEach(([key, el]) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        newPositions[key] = {
          left: r.left - contRect.left,
          right: r.right - contRect.left,
          top: r.top - contRect.top,
          bottom: r.bottom - contRect.top,
          width: r.width,
          height: r.height,
          cx: r.left - contRect.left + r.width / 2,
          cy: r.top - contRect.top + r.height / 2,
        };
      });

      setPositions(newPositions);
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [layers, agents]); // recompute when layers or agents change

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!name) return;

      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No access token");

      // Transform layers to string[][] as expected by the API
      const apiLayers: string[][] = layers.map(layer =>
        layer.nodes.map(nodeId => {
          const agent = findAgent(nodeId);
          if (!agent) throw new Error(`Agent with ID ${nodeId} not found`);
          return agent.name; // use name instead of ID
        })
      );
      const payload = {
        name,
        description,
        layers: apiLayers,
      };

      const result = await createWorkflow(payload);
      console.log("Workflow created:", result);

      router.push("/developer/workflow"); // navigate after success
    } catch (err) {
      console.error("Failed to create workflow:", err);
    } finally {
      setLoading(false);
    }
  };

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

  // function formatAgentName(name: string) {
  //   return name
  //     .split("_")
  //     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(" ");
  // }

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <AgentSidebar
        groupedAgents={groupedAgents}
        sortedMetaCategories={sortedMetaCategories}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
      />

    {/* Right Panel */}
    <div className="flex-1 flex flex-col p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Workflow</h1>
      <AgentGoalEditor 
          goal={agentGoal}
          onGoalChange={setAgentGoal}
      />

    {/* Agent Analysis Section */}
    <div className="flex-1 flex flex-col p-4 border-b border-gray-700">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Agent Analysis</h2>
        {selectedAgent && (
          <div className="relative">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition flex items-center gap-2"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              Add to Workflow
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded shadow-lg z-50">
                {layers.map((layer) => (
                  <button
                    key={layer.id}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition"
                    onClick={() => {
                      addNodeToLayer(layer.id, selectedAgent.id);
                      setDropdownOpen(false); // close after adding
                    }}
                  >
                    {layer.id}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>


      {/* Network Visualization + Details */}
      <div className="flex-1 flex flex-col overflow-auto">
        {selectedAgent ? (
          <>

            <div className="flex-1 min-h-0">
              <SubAgentNetworkGraph agent={selectedAgent} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">Select an agent to view details</p>
          </div>
        )}
      </div>
    </div>

      {/* Layer buttons */}
      <div className="flex justify-end gap-2 mb-2">
        {layers.length > minLayers && (
          <button
            onClick={removeLayer}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            - Remove Layer
          </button>
        )}
        {layers.length < maxLayers && (
          <button
            onClick={addLayer}
            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-500"
          >
            + Add Layer
          </button>
        )}
      </div>

      {/* Workflow Columns */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[350px] mb-4 border-2 border-gray-600 rounded-lg bg-gray-800 flex gap-4 overflow-x-auto p-4"
      >
        {/* Arrows SVG */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
          <defs>
            <marker
              id="arrow"
              markerWidth="12"
              markerHeight="12"
              refX="8"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,8 L10,4 z" fill="#10b981" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {layers.map((layer, i) => {
            if (i === layers.length - 1) return null;
            const nextLayer = layers[i + 1];

            return (
              <g key={`g-${i}`}>
                {layer.nodes.map((agentId, rowIndex) =>
                  nextLayer.nodes.map((nextAgentId, nextRowIndex) => {
                    const aKey = `${i}-${rowIndex}-${agentId}`;
                    const bKey = `${i + 1}-${nextRowIndex}-${nextAgentId}`;
                    const a = positions[aKey];
                    const b = positions[bKey];
                    
                    // Only render if both positions exist
                    if (!a || !b) return null;

                    const x1 = a.right;
                    const y1 = a.cy;
                    const x2 = b.left;
                    const y2 = b.cy;

                    const offset = 8;
                    const sx = x1 + offset;
                    const ex = x2 - offset;

                    return (
                      <line
                        key={`${i}-${rowIndex}-${nextRowIndex}-${agentId}-${nextAgentId}`}
                        x1={sx}
                        y1={y1}
                        x2={ex}
                        y2={y2}
                        stroke="#10b981"
                        strokeWidth={3}
                        markerEnd="url(#arrow)"
                        filter="url(#glow)"
                        opacity={0.8}
                      />
                    );
                  })
                )}
              </g>
            );
          })}
        </svg>

        {/* Columns */}
        {layers.map((layer, colIndex) => (
          <div
            key={layer.id}
            className="flex flex-col gap-3 min-w-[200px] flex-1 p-3 border-l-2 border-gray-600 z-10 relative bg-gray-800/50 rounded"
          >
            <h3 className="text-gray-300 font-bold text-center mb-2 pb-2 border-b border-gray-700">
              Layer {colIndex + 1}
            </h3>

            {layer.nodes.length === 0 && (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-4 text-gray-500 text-sm">
                Empty layer
              </div>
            )}

            {layer.nodes.map((agentId, nodeIndex) => {
              const agent = findAgent(agentId);
              const key = `${colIndex}-${nodeIndex}-${agentId}`;
              const isHovered = hoveredAgent === key;
              
              return (
                <div key={key} className="relative">
                  <div
                    ref={(el) => {
                      nodeRefs.current[key] = el;
                    }}
                    onMouseEnter={() => setHoveredAgent(key)}
                    onMouseLeave={() => setHoveredAgent(null)}
                    className={`node bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 rounded-lg flex justify-between items-center text-sm shadow-lg transition-all duration-200 cursor-pointer ${
                      isHovered ? 'scale-105 shadow-2xl ring-2 ring-green-400' : ''
                    }`}
                  >
                    <span className="truncate mr-2 font-medium">
                      {agent ? agent.name : `Agent ${agentId}`}
                    </span>
                    <button
                      type="button"
                      title="Remove node"
                      className="ml-1 bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-xs font-bold transition-colors"
                      onClick={() => removeNodeFromLayer(layer.id, agentId)}
                    >
                      ×
                    </button>
                  </div>

                  {/* Hover Tooltip with Inputs/Outputs */}
                  {isHovered && agent && (
                    <div 
                      className="absolute left-full ml-4 top-0 z-30 w-72 bg-gray-900 border-2 border-green-500 rounded-lg shadow-2xl p-4"
                      style={{
                        animation: 'fadeIn 0.2s ease-out'
                      }}
                    >
                      <div className="absolute -left-2 top-4 w-4 h-4 bg-gray-900 border-l-2 border-t-2 border-green-500 transform rotate-[-45deg]" />
                      
                      <div className="font-bold text-white mb-2 text-base">{agent.name}</div>
                      <div className="text-gray-400 text-xs mb-3">{agent.description}</div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-semibold text-blue-400 mb-1.5 flex items-center gap-1">
                            <span>📥</span> INPUTS
                          </div>
                          <div className="space-y-1">
                            {Object.entries(agent.inputs).map(([key, meta]) => (
                              <div key={key} className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
                                • {key} {meta.required ? "(required)" : "(optional)"}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs font-semibold text-green-400 mb-1.5 flex items-center gap-1">
                            <span>📤</span> OUTPUTS
                          </div>
                            <div className="space-y-1">
                              {Object.entries(agent.outputs).map(([key, meta]) => (
                                <div key={key} className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
                                  • {key} - {meta.type}{meta.description ? `: ${meta.description}` : ""}
                                </div>
                              ))}
                            </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-1">Workflow Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push("/developer/workflow")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            {loading ? "Creating..." : "Create Workflow"}
          </button>
        </div>
      </form>
    </div>

    {/* Add this CSS to your component or global styles */}
    <style jsx>{`
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateX(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `}</style>
  </div>
  );
}
