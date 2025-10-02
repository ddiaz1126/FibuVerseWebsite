"use client";

import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchSubAgents, createWorkflow } from "@/api/developer"; // ✅ API helper

interface Agent {
  id: number;
  name: string;
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
  const [agents, setAgents] = useState<Agent[]>([]);
  // optional: track a selected agent object (not strictly needed)
  const [, setSelectedAgent] = useState<Agent | null>(null);

  const minLayers = 2;
  const maxLayers = 8;

  // refs for DOM measurement
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // positions keyed by "col-nodeIndex-agentId"
  const [positions, setPositions] = useState<Record<string, Rect>>({});

  // Searching
  const [search, setSearch] = useState("");

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
        // Normalize fetched data safely
        const normalized: Agent[] = (fetched ?? []).map((a: unknown) => {
          const agent = a as Partial<Agent>; // assert partial Agent
          return {
            id: agent.id ?? 0,
            name: agent.name ?? "Unknown",
          };
        });

        setAgents(normalized);
        setSelectedAgent(normalized.length ? normalized[0] : null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Failed to load subagents:", err.message);
        } else {
          console.error("Failed to load subagents (unexpected error):", err);
        }
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

  return (
    <div className="flex h-full">
      <div className="w-1/4 border-r border-gray-700 bg-gray-800 p-4 flex flex-col gap-4">
        <h2 className="font-semibold text-lg">Agents</h2>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-700 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {agents.length === 0 ? (
            <div className="text-gray-400">No agents available</div>
          ) : (
            agents
              .filter((agent) =>
                agent.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((agent) => {
                const used = isInWorkflow(agent.id);
                return (
                  <div
                    key={agent.id}
                    className={`flex justify-between items-center px-3 py-2 rounded cursor-default ${
                      used
                        ? "bg-gray-600 text-gray-200"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    <span className="truncate">{agent.name}</span>

                    {used ? (
                      <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded text-xs">
                        Added
                      </span>
                    ) : (
                      <select
                        className="ml-2 bg-gray-700 text-white px-1 py-0.5 rounded cursor-pointer"
                        defaultValue=""
                        onChange={(e) => {
                          const layerId = e.target.value;
                          if (!layerId) return;
                          addNodeToLayer(layerId, agent.id);
                          e.target.value = "";
                        }}
                      >
                        <option value="" disabled>
                          + Add
                        </option>
                        {layers.map((layer, i) => (
                          <option key={layer.id} value={layer.id}>
                            Layer {i + 1}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Create New Workflow</h1>

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
          className="relative w-full h-[300px] mb-4 border border-gray-600 rounded bg-gray-800 flex gap-4 overflow-x-auto"
        >
          {/* Arrows SVG */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <defs>
              <marker
                id="arrow"
                markerWidth="10"
                markerHeight="10"
                refX="6"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
              </marker>
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
                      if (!a || !b) return null;

                      // start at right edge center of a, end at left edge center of b
                      const x1 = a.right;
                      const y1 = a.cy;
                      const x2 = b.left;
                      const y2 = b.cy;

                      const offset = 6;
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
                          strokeWidth={2}
                          markerEnd="url(#arrow)"
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
              className="flex flex-col gap-2 min-w-[150px] flex-1 p-2 border-l border-gray-600 z-10 relative"
            >
              <h3 className="text-gray-300 font-semibold mb-2 text-center">Layer {colIndex + 1}</h3>

              {layer.nodes.map((agentId, nodeIndex) => {
                const agent = findAgent(agentId);
                const key = `${colIndex}-${nodeIndex}-${agentId}`;
                return (
                  <div
                    key={key}
                      ref={(el) => {
                        nodeRefs.current[key] = el;
                      }}
                    className="node bg-green-600 text-white p-1 rounded flex justify-between items-center text-sm"
                  >
                    <span className="truncate mr-2">{agent ? agent.name : `Agent ${agentId}`}</span>
                    <button
                      type="button"
                      title="Remove node"
                      className="ml-1 bg-red-600 px-1 py-0.5 rounded hover:bg-red-700 text-xs"
                      onClick={() => removeNodeFromLayer(layer.id, agentId)}
                    >
                      ×
                    </button>
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
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/developer/workflow")}
              className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            >
              {loading ? "Creating..." : "Create Workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
