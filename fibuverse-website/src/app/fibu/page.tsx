"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import { fetchPublicCompositeAgents, runPublicCompositeAgent } from "@/api/public";
import { useSearchParams } from "next/navigation";

interface SubAgent {
  id: number;
  name: string;
  filename: string;
  description: string;
  inputs: Record<string, { type: string; required?: boolean; description?: string }>;
  outputs: Record<string, { type: string; description?: string }>;
  input_examples?: any[];
  output_examples?: any[];
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
  requires_auth?: boolean;
  auth_type?: "none" | "credentials" | "oauth2" | "apikey";
  
  // Add these for visualization
  layers: CompositeLayer[];  // ordered list of layers with their subagents
  subagents: SubAgent[];     // flat list of all subagents (optional, for convenience)
  
  // Optional metadata
  inputs?: Record<string, { type: string; required?: boolean }>;
  outputs?: Record<string, any>;
  public?: boolean;
  allow_frontend?: boolean;
}

// Network Visualization Component
// Network Visualization Component - Horizontal Layout
function AgentNetworkGraph({ agent }: { agent: CompositeAgent }) {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate connections between layers
  const generateConnections = () => {
    const connections = [];
    for (let i = 0; i < agent.layers.length - 1; i++) {
      const currentLayer = agent.layers[i];
      const nextLayer = agent.layers[i + 1];
      
      currentLayer.subagents.forEach((fromAgent, fromIdx) => {
        nextLayer.subagents.forEach((toAgent, toIdx) => {
          connections.push({
            from: `layer-${i}-agent-${fromIdx}`,
            to: `layer-${i + 1}-agent-${toIdx}`,
            delay: `${Math.random() * 2}s`
          });
        });
      });
    }
    return connections;
  };

  const connections = generateConnections();

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

// Input Form Component
function AgentInputForm({ 
  agent, 
  inputValues, 
  onInputChange, 
  onSubmit, 
  loading 
}: { 
  agent: CompositeAgent;
  inputValues: Record<string, string>;
  onInputChange: (key: string, value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Inputs</h3>
      
      <div className="space-y-4">
        {Object.entries(agent.inputs || {}).map(([key, meta]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {key}
              {meta.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {meta.description && (
              <p className="text-xs text-gray-400 mb-2">{meta.description}</p>
            )}
            <input
              type={meta.type === "password" ? "password" : "text"}
              placeholder={`Enter ${key}`}
              value={inputValues[key] || ""}
              onChange={(e) => onInputChange(key, e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required={meta.required}
            />
          </div>
        ))}

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {loading ? "Running..." : "Run Agent"}
        </button>
      </div>
    </div>
  );
}

// Output Display Component
function AgentOutput({ output, loading }: { output: any; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Output</h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Processing...</span>
        </div>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Output</h3>
        <p className="text-gray-500 text-center py-12">
          Run the agent to see output here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Output</h3>
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
          {JSON.stringify(output, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function FibuPage() {
  const [agents, setAgents] = useState<CompositeAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<CompositeAgent | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<any>(null);
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
        const agent = data.find(a => a.id === parseInt(initialAgentId));
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
  const handleInputChange = (key: string, value: string) => {
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
                  {/* <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {agent.description}
                  </div> */}
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