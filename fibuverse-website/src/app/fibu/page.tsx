"use client";

import { useState, useEffect, Suspense } from "react";
import Header from "@/components/Header";
import { fetchPublicCompositeAgents, runPublicCompositeAgent } from "@/api/public";
import { useSearchParams } from "next/navigation";
import { AgentOutput } from "@/components/agents/AgentOutput"

interface SubAgent {
  id: number;
  name: string;
  filename: string;
  description: string;
  inputs: Record<string, { type: string; required?: boolean; description?: string }>;
  outputs: Record<string, { type: string; description?: string }>;
  // input_examples?: any[];
  // output_examples?: any[];
  allow_frontend: boolean;
}

interface CompositeLayer {
  id: number;
  layer_index: number;
  subagents: SubAgent[];
  allow_parallel: boolean;
}

interface CompositeAgent {
  id: number;
  name: string;
  description: string;
  layers: CompositeLayer[];
  subagents: SubAgent[];
  
  inputs?: Record<string, { type: string; required?: boolean; description?: string }>;
  outputs?: Record<string, unknown>;
  public?: boolean;
  allow_frontend?: boolean;
}

// Extract the component that uses useSearchParams
function FibuPageContent() {
  const [agents, setAgents] = useState<CompositeAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<CompositeAgent | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string | File | null>>({});
  const [output, setOutput] = useState<unknown>(null);
  const [running, setRunning] = useState(false);

  const searchParams = useSearchParams();
  const initialAgentId = searchParams.get("agentId");

  // Load agents
  useEffect(() => {
    async function loadAgents() {
      const data = await fetchPublicCompositeAgents();
      setAgents(data);
      setLoadingAgents(false);

      if (initialAgentId) {
        const agent = data.find((a: CompositeAgent) => a.id === parseInt(initialAgentId));
        if (agent) handleSelectAgent(agent);
      }
    }
    loadAgents();
  }, [initialAgentId]);

  // Select agent and initialize inputs
  const handleSelectAgent = (agent: CompositeAgent) => {
    setSelectedAgent(agent);
    setOutput(null);
    
    // Initialize input values
    const initialInputs: Record<string, string> = {};
    Object.keys(agent.inputs || {}).forEach((key) => {
      initialInputs[key] = "";
    });
    setInputValues(initialInputs);
  };

  // Handle input change
  const handleInputChange = (key: string, value: string | File | null) => {
    setInputValues(prev => ({ ...prev, [key]: value }));
  };


  // Run agent
  const handleRunAgent = async () => {
    if (!selectedAgent) return;

    setRunning(true);
    setOutput(null);

    try {
      const result = await runPublicCompositeAgent(selectedAgent.id, inputValues);
      console.log("Agent result:", result);
      setOutput(result);
    } catch (err) {
      console.error("Agent run failed:", err);
      setOutput({ error: "Failed to run agent. Please try again." });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <Header logoSrc="/images/logo.png" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-gray-900 border-r border-gray-800 p-6 overflow-y-auto">
          <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-4">
            Available Agents
          </h2>

          {loadingAgents ? (
            <p className="text-gray-500 text-sm">Loading agents...</p>
          ) : (
            <nav className="flex flex-col gap-2">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent)}
                  className={`text-left px-4 py-3 rounded-lg transition-all ${
                    selectedAgent?.id === agent.id 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-800 hover:bg-gray-750 text-gray-300"
                  }`}
                >
                  <div className="font-medium">{agent.name}</div>
                </button>
              ))}
            </nav>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">
          {selectedAgent ? (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Agent Header */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{selectedAgent.name}</h1>
                <p className="text-gray-400">{selectedAgent.description}</p>
              </div>

              {/* Network Visualization */}
              <AgentNetworkGraph agent={selectedAgent} />

              {/* Input Form */}
              <AgentInputForm
                agent={selectedAgent}
                inputValues={inputValues}
                onInputChange={handleInputChange}
                onSubmit={handleRunAgent}
                loading={running}
              />

              {/* Output Section */}
              <AgentOutput output={output} loading={running} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-500 text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-semibold mb-2">Select an Agent</h2>
                <p className="text-gray-400">
                  Choose an agent from the sidebar to get started
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Main export wrapped in Suspense
export default function FibuPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-gray-500 text-6xl mb-4">🤖</div>
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <FibuPageContent />
    </Suspense>
  );
}


// Network Visualization Component - Horizontal Layout
function AgentNetworkGraph({ agent }: { agent: CompositeAgent }) {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const getAgentColor = (subagent: SubAgent, isActive: boolean) => {
    // You can customize colors based on subagent properties
    const colors = [
      isActive ? 'bg-blue-400' : 'bg-blue-600/50',
      isActive ? 'bg-green-400' : 'bg-green-600/50',
      isActive ? 'bg-purple-400' : 'bg-purple-600/50',
      isActive ? 'bg-orange-400' : 'bg-orange-600/50',
      isActive ? 'bg-cyan-400' : 'bg-cyan-600/50',
    ];
    return colors[subagent.id % colors.length];
  };

  const getAgentIcon = (subagent: SubAgent) => {
    // You can map icons based on subagent name or type
    const icons = ['🤖', '⚙️', '🔧', '📊', '🎯', '💡', '🚀'];
    return icons[subagent.id % icons.length];
  };

return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold">Agent Network</div>
          <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
            {agent.layers.length} Layers • {agent.layers.reduce((total, layer) => total + layer.subagents.length, 0)} SubAgents
          </div>
        </div>
        <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 pt-2">
          <div className="relative w-full bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/50 p-8 backdrop-blur-sm overflow-x-auto min-h-[400px]">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 20%, #facc15 1px, transparent 1px),
                    radial-gradient(circle at 80% 80%, #3b82f6 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px',
                }}
              />
            </div>

            <div className="relative z-10 flex items-center justify-between h-full min-h-[350px]">
              {/* Input Node */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 border-2 border-white/20 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-all duration-300">
                  📥
                </div>
                <div className="mt-2 text-xs text-gray-400 font-semibold">Input</div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 px-8 relative">
                <div className="text-4xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-flow">
                  ⟶
                </div>
              </div>

              {/* Layers */}
              {agent.layers.map((layer, layerIdx) => (
                <div key={layer.layer_index} className="flex items-center">
                  {/* Layer Column */}
                  <div className="flex flex-col items-center gap-4 px-4">
                    <div className="text-xs text-gray-400 font-semibold mb-2">
                      Layer {layer.layer_index}
                    </div>
                    
                    <div className={`flex ${layer.allow_parallel ? 'flex-col gap-4' : 'flex-col gap-2'}`}>
                      {layer.subagents.map((subagent, agentIdx) => {
                        const nodeId = `layer-${layerIdx}-agent-${agentIdx}`;
                        const isActive = activeNode === nodeId;
                        
                        return (
                          <div
                            key={subagent.id}
                            className="group relative cursor-pointer"
                            onClick={() => setActiveNode(nodeId)}
                          >
                            {/* Node */}
                            <div className={`w-14 h-14 rounded-full ${getAgentColor(subagent, isActive)}
                              border-2 border-white/20 flex items-center justify-center text-xl
                              transition-all duration-300 group-hover:scale-110 shadow-lg
                              ${isActive ? 'animate-pulse scale-110 border-white/60' : ''}`}
                            >
                              {getAgentIcon(subagent)}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                              <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                                <div className="font-semibold">{subagent.name}</div>
                                <div className="text-gray-400 mt-1 max-w-[200px] truncate">{subagent.description}</div>
                              </div>
                            </div>

                            {/* Pulse rings for active node */}
                            {isActive && (
                              <>
                                <div className="absolute inset-0 rounded-full border-2 border-yellow-400/50 animate-ping" />
                                <div className="absolute -inset-1 rounded-full border border-yellow-400/30 animate-ping" style={{ animationDelay: '0.5s' }} />
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Parallel/Sequential Indicator */}
                    <div className="text-[10px] text-gray-500 mt-2">
                      {layer.allow_parallel ? '⚡ Parallel' : '→ Sequential'}
                    </div>
                  </div>

                  {/* Arrow to next layer */}
                  {layerIdx < agent.layers.length - 1 && (
                    <div className="flex-shrink-0 px-8 relative">
                      <div className="text-4xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-flow">
                        ⟶
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Arrow */}
              <div className="flex-shrink-0 px-8 relative">
                <div className="text-4xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-flow">
                  ⟶
                </div>
              </div>

              {/* Output Node */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-green-600 border-2 border-white/20 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-all duration-300">
                  📤
                </div>
                <div className="mt-2 text-xs text-gray-400 font-semibold">Output</div>
              </div>
            </div>

            {/* Connection indicators */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-gray-400 z-10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>
                {agent.layers.length} Layers • {' '}
                {agent.layers.reduce((total, layer) => total + layer.subagents.length, 0)} SubAgents
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes flow {
          0%, 100% { 
            opacity: 0.5; 
            transform: translateX(-4px);
          }
          50% { 
            opacity: 1; 
            transform: translateX(4px);
          }
        }
        .animate-flow {
          animation: flow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

type AgentInputMeta = {
  type?: string;
  required?: boolean;
  description?: string;
};

function AgentInputForm({ 
  agent, 
  inputValues, 
  onInputChange, 
  onSubmit, 
  loading 
}: { 
  agent: CompositeAgent;
  inputValues: Record<string, string | File | null>;
  onInputChange: (key: string, value: string | File | null) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const [showOptional, setShowOptional] = useState(false);

  if (!agent.inputs) return null;

  // Get inputs from the first layer's subagents only
  const firstLayerSubagents = agent.layers?.[0]?.subagents ?? [];

  // Collect all inputs from first-layer subagents
  const allInputs: Array<{ key: string; meta: AgentInputMeta }> = [];
  firstLayerSubagents.forEach((sub) => {
    if (!sub.inputs) return;
    Object.entries(sub.inputs).forEach(([key, meta]) => {
      allInputs.push({ key, meta: meta as AgentInputMeta });
    });
  });

  // Deduplicate required inputs by key (keep first occurrence)
  const seenRequired = new Set<string>();
  const requiredInputs = allInputs.filter(({ key, meta }) => {
    if (!meta.required) return false;
    if (seenRequired.has(key)) return false;
    seenRequired.add(key);
    return true;
  });

  // Deduplicate optional inputs by key (keep first occurrence) and remove keys already in required
  const seenOptional = new Set<string>();
  const optionalInputs = allInputs.filter(({ key, meta }) => {
    if (meta.required) return false; // already in required
    if (seenRequired.has(key)) return false; // in required inputs
    if (seenOptional.has(key)) return false; // already seen optional
    seenOptional.add(key);
    return true;
  });

  const renderInput = (key: string, meta: AgentInputMeta) => {
    if (meta.type === "file" || key === "ai_image") {
      return (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onInputChange(key, e.target.files?.[0] ?? null)}
          className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        />
      );
    }

    if (meta.type?.toLowerCase() === "dict") {
      return (
        <div className="p-3 rounded-lg bg-gray-900 border border-gray-600 text-gray-400">
          Dict UI (to implement)
        </div>
      );
    }

    return (
      <input
        type={meta.type === "password" ? "password" : "text"}
        placeholder={`Enter ${key}`}
        value={(inputValues[key] as string) || ""}
        onChange={(e) => onInputChange(key, e.target.value)}
        className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        required={meta.required}
      />
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Inputs</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requiredInputs.map(({ key, meta }, idx) => (
          <div key={`required-${key}-${idx}`}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {key}
              {meta.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {meta.description && (
              <p className="text-xs text-gray-400 mb-2">{meta.description}</p>
            )}
            {renderInput(key, meta)}
          </div>
        ))}

        {optionalInputs.length > 0 && showOptional && optionalInputs.map(({ key, meta }, idx) => (
          <div key={`optional-${key}-${idx}`}>
            <label className="block text-sm font-medium text-gray-300 mb-2">{key}</label>
            {meta.description && (
              <p className="text-xs text-gray-400 mb-2">{meta.description}</p>
            )}
            {renderInput(key, meta)}
          </div>
        ))}
      </div>

      {optionalInputs.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            onClick={() => setShowOptional(!showOptional)}
          >
            {showOptional ? "Hide Advanced Inputs" : "Show Advanced Inputs"}
          </button>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
      >
        {loading ? "Running..." : "Run Agent"}
      </button>
    </div>
  );
}




