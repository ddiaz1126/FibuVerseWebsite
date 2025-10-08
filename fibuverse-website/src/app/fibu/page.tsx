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
        <aside className="w-60 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
          <h2 className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-2">
            Available Agents
          </h2>

          {loadingAgents ? (
            <p className="text-gray-500 text-xs">Loading agents...</p>
          ) : (
            <nav className="flex flex-col gap-1.5">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent)}
                  className={`text-left px-3 py-2 rounded-md text-sm transition-all ${
                    selectedAgent?.id === agent.id 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-800 hover:bg-gray-750 text-gray-300"
                  }`}
                >
                  <div className="font-medium truncate">{agent.name}</div>
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
                  <p className="text-gray-400 text-xs leading-snug mt-1 line-clamp-2">
                    {selectedAgent.description}
                  </p>
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
        className="w-full flex items-center justify-between p-3 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">Agent Network</div>
          <div className="text-[10px] text-gray-400 bg-gray-700 px-1.5 py-0.5 rounded">
            {agent.layers.length} Layers • {agent.layers.reduce((total, layer) => total + layer.subagents.length, 0)} SubAgents
          </div>
        </div>
        <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable Content */}
{/* Expandable Content */}
<div className={`transition-all duration-300 ease-in-out ${
  isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
}`}>
  <div className="p-4 pt-2">
    <div className="relative w-full bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl border border-gray-700/50 p-4 backdrop-blur-sm overflow-x-auto min-h-[280px]">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, #facc15 1px, transparent 1px),
              radial-gradient(circle at 80% 80%, #3b82f6 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-between h-full min-h-[250px]">
        {/* Input Node */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-600 border-2 border-white/20 flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-all duration-300">
            📥
          </div>
          <div className="mt-1.5 text-[10px] text-gray-400 font-semibold">Input</div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 px-4 relative">
          <div className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-flow">
            ⟶
          </div>
        </div>

        {/* Layers */}
        {agent.layers.map((layer, layerIdx) => (
          <div key={layer.layer_index} className="flex items-center">
            {/* Layer Column */}
            <div className="flex flex-col items-center gap-3 px-2">
              <div className="text-[10px] text-gray-400 font-semibold mb-1">
                Layer {layer.layer_index}
              </div>
              
              <div className={`flex ${layer.allow_parallel ? 'flex-col gap-3' : 'flex-col gap-2'}`}>
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
                      <div className={`w-10 h-10 rounded-full ${getAgentColor(subagent, isActive)}
                        border-2 border-white/20 flex items-center justify-center text-base
                        transition-all duration-300 group-hover:scale-110 shadow-lg
                        ${isActive ? 'animate-pulse scale-110 border-white/60' : ''}`}
                      >
                        {getAgentIcon(subagent)}
                      </div>

                      {/* Tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                        <div className="bg-black/90 text-white text-[10px] px-2 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                          <div className="font-semibold">{subagent.name}</div>
                          <div className="text-gray-400 mt-0.5 max-w-[180px] truncate">{subagent.description}</div>
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
              <div className="text-[9px] text-gray-500 mt-1">
                {layer.allow_parallel ? '⚡ Parallel' : '→ Sequential'}
              </div>
            </div>

            {/* Arrow to next layer */}
            {layerIdx < agent.layers.length - 1 && (
              <div className="flex-shrink-0 px-4 relative">
                <div className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-flow">
                  ⟶
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Arrow */}
        <div className="flex-shrink-0 px-4 relative">
          <div className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-flow">
            ⟶
          </div>
        </div>

        {/* Output Node */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-green-600 border-2 border-white/20 flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-all duration-300">
            📤
          </div>
          <div className="mt-1.5 text-[10px] text-gray-400 font-semibold">Output</div>
        </div>
      </div>

      {/* Connection indicators */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] text-gray-400 z-10">
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
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

  const formatLabel = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const renderInput = (key: string, meta: AgentInputMeta) => {
    if (meta.type === "textarea") {
      return (
        <textarea
          placeholder={`Enter ${formatLabel(key)}`}
          value={(inputValues[key] as string) || ""}
          onChange={(e) => onInputChange(key, e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-900/80 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 text-white placeholder-gray-500 transition-all duration-200 min-h-[100px] resize-y backdrop-blur-sm"
          required={meta.required}
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
      placeholder={`Enter ${formatLabel(key)}`}
      value={(inputValues[key] as string) || ""}
      onChange={(e) => onInputChange(key, e.target.value)}
      className="w-full p-3 rounded-xl bg-gray-900/80 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 text-white placeholder-gray-500 transition-all duration-200 backdrop-blur-sm"
      required={meta.required}
    />
  );
};

return (
  <div className="relative bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/40 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/30 shadow-2xl overflow-hidden">
    {/* Animated background gradients */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-400/5 rounded-3xl" />
    
    {/* Floating particles effect */}
    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
    </div>

    <div className="relative z-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/30">
        <div className="relative">
          {/* Icon glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-blue-400 rounded-xl blur-lg opacity-40" />
          
          {/* Icon */}
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-blue-400/20 border border-gray-700/50 flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-white">Agent Configuration</h3>
          <p className="text-xs text-gray-400">Configure inputs to launch your agent</p>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {requiredInputs.map(({ key, meta }, idx) => (
          <div key={`required-${key}-${idx}`} className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
              {formatLabel(key)}
              {meta.required && <span className="text-red-400 text-xs">*</span>}
            </label>
            {meta.description && (
              <p className="text-xs text-gray-400 mb-2 leading-relaxed pl-3.5">{meta.description}</p>
            )}
            {renderInput(key, meta)}
          </div>
        ))}

        {optionalInputs.length > 0 && showOptional && optionalInputs.map(({ key, meta }, idx) => (
          <div key={`optional-${key}-${idx}`} className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              {formatLabel(key)}
              <span className="text-xs text-gray-500 font-normal">(optional)</span>
            </label>
            {meta.description && (
              <p className="text-xs text-gray-400 mb-2 leading-relaxed pl-3.5">{meta.description}</p>
            )}
            {renderInput(key, meta)}
          </div>
        ))}
      </div>

      {/* Advanced Options Toggle */}
      {optionalInputs.length > 0 && (
        <div className="mb-6">
          <button
            type="button"
            className="group/toggle flex items-center gap-2 text-sm text-blue-400 hover:text-yellow-300 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-800/50"
            onClick={() => setShowOptional(!showOptional)}
          >
            <div className="w-6 h-6 rounded-lg bg-gray-800/80 flex items-center justify-center group-hover/toggle:bg-gray-800 transition-colors">
              <svg 
                className={`w-3.5 h-3.5 transition-transform duration-300 ${showOptional ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span>{showOptional ? "Hide Advanced Options" : "Show Advanced Options"}</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-800/80 text-xs text-gray-400">
              {optionalInputs.length}
            </span>
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={loading}
        className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 p-[1px] shadow-lg hover:shadow-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group/btn"
      >
        <div className="relative flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-3.5 transition-all duration-300 group-hover/btn:bg-transparent">
          {loading ? (
            <>
              <div className="relative">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <span className="font-semibold text-sm text-white">Processing Agent...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-white group-hover/btn:text-black transition-all duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-sm text-white group-hover/btn:text-black transition-colors duration-300">
                Launch Agent
              </span>
              <svg className="w-4 h-4 text-white group-hover/btn:text-black transition-all duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </div>
      </button>
    </div>
  </div>
);}