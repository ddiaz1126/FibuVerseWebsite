"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchWorkflows,
  runCompositeAgentFormData,
  RunCompositeResponse,
  fetchWorkflowHistory,
} from "@/api/developer";

interface SubAgent {
  id: number;
  name: string;
  filename: string;
  description: string;
  // flexible inputs & outputs
  inputs?: Record<string, { type: string; required?: boolean; description?: string; default?: unknown }>;
  outputs?: Record<string, { type: string; description?: string }>;
  allow_frontend: boolean;
}
interface CompositeLayer { id: number; layer_index: number; allow_parallel: boolean; subagents: SubAgent[]; }
interface Workflow { id: number; name: string; description: string; layers: CompositeLayer[]; }

interface WorkflowRun {
  id: number;
  workflow_id?: number;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  created_at: string; // or started_at
  status: "pending" | "running" | "success" | "failed" | string;
  error_message?: string;
}

export type RunStatus = "pending" | "running" | "succeeded" | "failed" | (string & {});

/** Input/output are opaque JSON objects for now — safer than `any` */
export type JsonObject = Record<string, unknown>;

export interface RunRecord {
  id: number;
  status: RunStatus;           // e.g. run.status.lower()
  inputs: JsonObject | null;   // your run.inputs
  outputs: JsonObject | null;  // your run.outputs
  started_at: string;          // ISO datetime string
  finished_at: string | null;  // ISO datetime string or null
}

// fetch history helper
interface NormalizedRunRecord extends Omit<RunRecord, "inputs" | "outputs"> {
  created_at: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
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

export default function DeveloperWorkflowView() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Searching
  const [search, setSearch] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [positions, setPositions] = useState<Record<string, Rect>>({});

  // Run Workflow state
  const [inputs, setInputs] = useState<Record<string, unknown>>({});
  const [output, setOutput] = useState<Record<string, unknown> | null>(null);
  const [running, setRunning] = useState(false);

  // History
  const [history, setHistory] = useState<WorkflowRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [showRunModal, setShowRunModal] = useState(false);
  
  // Load workflows
  useEffect(() => {
    async function loadWorkflows() {
      try {
        setLoading(true);

        const data = (await fetchWorkflows()) as Workflow[]; // ✅ cast here
        setWorkflows(data);

        if (data.length > 0) {
          setSelectedWorkflow(data[0]);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error fetching workflows:", err.message);
        } else {
          console.error("Error fetching workflows (unexpected):", err);
        }
        setError("Failed to load workflows");
      } finally {
        setLoading(false);
      }
    }

    loadWorkflows();
  }, []);

  // compute node positions for arrows (kept from your code)
  useLayoutEffect(() => {
    const compute = () => {
      const container = containerRef.current;
      if (!container) return;
      const contRect = container.getBoundingClientRect();
      
      const newPositions: Record<string, Rect> = {}; // ✅ proper type

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
  }, [selectedWorkflow]);
  // Initialize inputs when workflow changes & load history
  useEffect(() => {
    if (!selectedWorkflow) return;

    // init inputs from first subagent's schema (as before)
    const firstSubagentInputs = selectedWorkflow.layers[0]?.subagents[0]?.inputs ?? {};
    const initInputs: Record<string, unknown> = {};
    Object.keys(firstSubagentInputs).forEach((k) => {
      initInputs[k] = firstSubagentInputs[k].default ?? "";
    });
    setInputs(initInputs);

    // load history for this workflow
    loadHistory(selectedWorkflow.id);
  }, [selectedWorkflow]);

  const loadHistory = async (workflowId: number) => {
    try {
      const runs = await fetchWorkflowHistory(workflowId);

      // Normalize runs: prefer finished_at -> started_at -> fallback to now
      const normalized: NormalizedRunRecord[] = runs.map((r) => ({
        ...r,
        created_at: r.finished_at ?? r.started_at ?? new Date().toISOString(),
        inputs: r.inputs ?? {},   // ensure Record<string, unknown>
        outputs: r.outputs ?? {}, // ensure Record<string, unknown>
      }));

      // Sort descending by created_at
      normalized.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setHistory(normalized); // now compatible with WorkflowRun[]
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Failed to load history:", err.message);
      } else {
        console.error("Failed to load history (unexpected):", err);
      }
    }
  };

  // Handle input change
  const handleInputChange = (key: string, value: string | File | null) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Type coercion helper (kept)
  // const coerceType = (value: any, type?: string) => {
  //   if (value == null) return value;
  //   switch (type) {
  //     case "int": return parseInt(value, 10);
  //     case "float": return parseFloat(value);
  //     case "bool": return value === "true" || value === true;
  //     case "string":
  //     default: return value.toString();
  //   }
  // };

  // Run workflow
  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkflow) return;

    try {
      setRunning(true);

      const formData = new FormData();
      formData.append("id", selectedWorkflow.id.toString());

      // Loop over all subagents in the first layer
      const subagents = selectedWorkflow.layers[0]?.subagents || [];
      subagents.forEach((subagent: SubAgent) => {
        if (!subagent.inputs) return;

        Object.entries(subagent.inputs).forEach(([key, meta]) => {
          const typedMeta = meta as { type: string }; // ✅ cast to proper type
          const value = inputs[key];
          if (value === undefined || value === null) return;

          if (typedMeta.type === "file" && value instanceof File) {
            formData.append(key, value);
          } else if (typedMeta.type === "Dict" || typedMeta.type === "dict") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        });
      });

      const res: RunCompositeResponse = await runCompositeAgentFormData(formData);
      setOutput(res.outputs ?? null);

      await loadHistory(selectedWorkflow.id);
    } catch (err) {
      console.error("Workflow run failed:", err);
      if (selectedWorkflow) loadHistory(selectedWorkflow.id);
    } finally {
      setRunning(false);
    }
  };

  // click handler to show run details
  const openRunDetails = (run: WorkflowRun) => {
    setSelectedRun(run);
    setShowRunModal(true);
  };

  const closeRunDetails = () => {
    setSelectedRun(null);
    setShowRunModal(false);
  };

  if (loading) return <div className="p-6 text-gray-400">Loading workflows...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
<div className="flex-none w-1/3 md:w-1/4 lg:w-1/5 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 p-3 flex flex-col rounded-xl m-2">        {/* Create New Workflow Button */}
        <button
          className="mb-3 flex-shrink-0 w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 px-3 py-2 text-[10px] font-medium rounded-lg transition-all shadow-lg shadow-green-500/20 transform hover:scale-[1.02]"
          onClick={() => router.push("/developer/workflow/create")}
        >
          + New Workflow
        </button>

        {/* Search Input */}
        <div className="relative mb-3 flex-shrink-0">
          <input
            type="text"
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 pl-8 text-xs rounded-lg bg-gray-900/50 border border-gray-700 placeholder-gray-400 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
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

        {/* Workflow list */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-0">
          {loading ? (
            <div className="text-center text-gray-400 mt-4 text-xs">
              <div className="animate-pulse">Loading workflows...</div>
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center text-gray-500 mt-4 text-xs">
              <p>No workflows yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/30">
              {workflows
                .filter((workflow) =>
                  workflow.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((workflow) => (
                  <button
                    key={workflow.id}
                    onClick={() => setSelectedWorkflow(workflow)}
                    className={`w-full text-left px-3 py-2.5 hover:bg-gray-700/30 transition-all ${
                      selectedWorkflow?.id === workflow.id
                        ? "bg-gray-700/50 border-l-2 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {workflow.name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>


      {/* Main */}
      <div className="flex-1 p-6 overflow-auto">
        {selectedWorkflow ? (
          <>
            <h1 className="text-2xl font-bold mb-6">{selectedWorkflow.name}</h1>
            <p className="text-gray-400 mb-6">{selectedWorkflow.description}</p>

            {/* Diagram */}
            <div
              ref={containerRef}
              className="relative w-full h-[300px] mb-6 border border-gray-600 rounded bg-gray-800 flex gap-6 overflow-x-auto"
            >
              {/* SVG arrows */}
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

                {selectedWorkflow.layers.map((layer, i) => {
                  if (i === selectedWorkflow.layers.length - 1) return null;
                  const nextLayer = selectedWorkflow.layers[i + 1];
                  return (
                    <g key={`g-${i}`}>
                      {layer.subagents.map((a, rowIndex) =>
                        nextLayer.subagents.map((b, nextRowIndex) => {
                          const aKey = `${i}-${rowIndex}-${a.id}`;
                          const bKey = `${i + 1}-${nextRowIndex}-${b.id}`;
                          const posA = positions[aKey];
                          const posB = positions[bKey];
                          if (!posA || !posB) return null;
                          return (
                            <line
                              key={`${a.id}-${b.id}`}
                              x1={posA.right + 6}
                              y1={posA.cy}
                              x2={posB.left - 6}
                              y2={posB.cy}
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

              {selectedWorkflow.layers.map((layer, i) => (
                    <div
                      key={`layer-${layer.id || i}`}
                      className="flex flex-col gap-3 min-w-[200px] p-3 border-l border-gray-600 z-10 relative"
                    >
                  <h3 className="text-gray-300 font-semibold mb-2">
                    Layer {layer.layer_index}
                  </h3>
                  {layer.subagents.map((sub, idx) => {
                    const key = `sub-${layer.id}-${sub.id || idx}`;
                    return (
                      <div
                        key={key}
                        ref={(el) => {
                          nodeRefs.current[key] = el;
                        }}
                        className="bg-green-600 text-white p-2 rounded shadow-md text-center"
                      >
                        {sub.name}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Inputs & Run */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Inputs</h2>
              <form className="flex flex-col gap-3 max-w-lg" onSubmit={handleRun}>
                {(() => {
                  const seenKeys = new Set<string>();
                  const dedupedInputs: Array<[string, unknown]> = [];

                  selectedWorkflow.layers[0]?.subagents?.forEach((subagent: SubAgent) => {
                    if (!subagent.inputs) return;

                    Object.entries(subagent.inputs).forEach(([key, meta]) => {
                      if (!seenKeys.has(key)) {
                        seenKeys.add(key);
                        dedupedInputs.push([key, meta]);
                      }
                    });
                  });

                  return dedupedInputs.map(([key, meta]) => {
                    const inputMeta = meta as { type: string; required?: boolean; description?: string };

                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-gray-300 font-medium">
                          {key} {!inputMeta.required && "(Optional)"} {inputMeta.type && `- Type: ${inputMeta.type}`}
                        </label>

                        {inputMeta.type === "file" ? (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleInputChange(key, e.target.files?.[0] ?? null)}
                            className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : inputMeta.type === "Dict" || inputMeta.type === "dict" ? (
                          // Dict input rendering code here...
                          <div>Dict UI</div>
                        ) : (
                          <input
                            type="text"
                            value={String(inputs[key] ?? "")} // <- cast to string
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            placeholder={`Enter ${key}${inputMeta.type ? ` (${inputMeta.type})` : ""}`}
                            className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        )}
                      </div>
                    );
                  });

                })()}

                <button
                  type="submit"
                  disabled={running}
                  className="self-start bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                >
                  {running ? "Running..." : "Run"}
                </button>
              </form>
            </div>

            {/* Output */}
              <div className="p-4 bg-gray-700 text-white rounded border border-gray-600 mb-6">
                {output && Object.keys(output).length > 0 ? (
                  (() => {
                    const keys = Object.keys(output);
                    const lastKey = keys[keys.length - 1];
                    const value = output[lastKey];

                    // Format objects nicely, otherwise show as string
                    const displayValue =
                      typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);

                    return (
                      <pre className="overflow-x-auto max-w-full break-words whitespace-pre-wrap">
                        {displayValue}
                      </pre>
                    );
                  })()
                ) : (
                  <p>No output yet. Run the workflow to see results.</p>
                )}
              </div>
              
              {/* Run Modal */}
              <div className="flex h-screen bg-gray-900 text-white p-6">
              <div className="w-full max-w-4xl mx-auto">
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {history.length === 0 && (
                      <li className="text-gray-400 text-sm text-center py-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        No runs yet.
                      </li>
                    )}

                    {history
                      .slice(-5) // show last 5 runs
                      .reverse() // newest first
                      .map((run) => (
                        <li
                          key={run.id}
                          className="p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-gray-200 flex justify-between items-center hover:bg-gray-700/50 hover:border-gray-600 cursor-pointer transition-all shadow-lg"
                          onClick={() => openRunDetails(run)}
                        >
                          <div>
                            <div className="font-medium text-sm">{new Date(run.created_at).toLocaleString()}</div>
                            <div className="text-xs text-gray-400">
                              {run.workflow_id ? `Workflow ${run.workflow_id}` : ""}
                            </div>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-lg text-xs font-medium shadow-lg ${
                              run.status === "success"
                                ? "bg-green-600 shadow-green-500/20"
                                : run.status === "failed"
                                ? "bg-red-600 shadow-red-500/20"
                                : "bg-yellow-600 shadow-yellow-500/20"
                            }`}
                          >
                            {run.status}
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Run Modal */}
            {showRunModal && selectedRun && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 text-white rounded-xl p-4 w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
                    <h3 className="text-lg font-semibold">
                      Run #{selectedRun.id} — {new Date(selectedRun.created_at).toLocaleString()}
                    </h3>
                    <div className="flex gap-2 items-center">
                      <div
                        className={`px-2 py-1 rounded-lg text-xs font-medium shadow-lg ${
                          selectedRun.status === "success"
                            ? "bg-green-600 shadow-green-500/20"
                            : selectedRun.status === "failed"
                            ? "bg-red-600 shadow-red-500/20"
                            : "bg-yellow-600 shadow-yellow-500/20"
                        }`}
                      >
                        {selectedRun.status}
                      </div>
                      <button 
                        onClick={closeRunDetails} 
                        className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-xs transition-colors border border-gray-600"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-gray-300">Inputs</h4>
                      <div className="max-h-64 overflow-auto bg-gray-900/50 border border-gray-700 p-3 rounded-lg">
                        <pre className="whitespace-pre-wrap break-words text-xs text-gray-200">{JSON.stringify(selectedRun.inputs, null, 2)}</pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-gray-300">Outputs</h4>
                      <div className="max-h-64 overflow-auto bg-gray-900/50 border border-gray-700 p-3 rounded-lg">
                        <pre className="whitespace-pre-wrap break-words text-xs text-gray-200">{JSON.stringify(selectedRun.outputs, null, 2)}</pre>
                      </div>
                    </div>

                    {selectedRun.error_message && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm text-gray-300">Error</h4>
                        <div className="max-h-64 overflow-auto bg-red-900/20 border border-red-700/50 p-3 rounded-lg">
                          <pre className="whitespace-pre-wrap break-words text-xs text-red-200">{selectedRun.error_message}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-400">No workflows available</div>
        )}
      </div>
    </div>
  );
}