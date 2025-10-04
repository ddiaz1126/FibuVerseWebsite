// SubAgentNetworkGraph.tsx
"use client"; // if it uses state/hooks

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

export function SubAgentNetworkGraph({ agent }: { agent: SubAgent }) {
  const [hoveredInput, setHoveredInput] = useState<string | null>(null);
  const [hoveredOutput, setHoveredOutput] = useState<string | null>(null);

  const inputKeys = Object.keys(agent.inputs);
  const outputKeys = Object.keys(agent.outputs);

  const getInputColor = (key: string) => {
    const required = agent.inputs[key].required;
    return required ? 'bg-orange-500/80' : 'bg-blue-500/80';
  };

  const getOutputColor = () => 'bg-green-500/80';

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden p-6">
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
          {/* Input Nodes */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-xs text-gray-400 font-semibold mb-2">
              Inputs
            </div>
            
            <div className="flex flex-col gap-3">
              {inputKeys.map((key) => {
                const input = agent.inputs[key];
                const isHovered = hoveredInput === key;
                
                return (
                  <div
                    key={key}
                    className="group relative cursor-pointer"
                    onMouseEnter={() => setHoveredInput(key)}
                    onMouseLeave={() => setHoveredInput(null)}
                  >
                    {/* Input Node */}
                    <div className={`px-4 py-2 rounded-full ${getInputColor(key)}
                      border-2 border-white/20 flex items-center justify-center text-sm font-medium
                      transition-all duration-300 group-hover:scale-105 shadow-lg
                      ${isHovered ? 'scale-105 border-white/60' : ''} min-w-[120px]`}
                    >
                      {key}
                      {input.required && <span className="ml-1 text-red-300">*</span>}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                      <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
                        <div className="font-semibold whitespace-nowrap">{key}</div>
                        <div className="text-gray-400 mt-1 whitespace-nowrap">Type: {input.type}</div>
                        {input.required && <div className="text-orange-400 mt-1 whitespace-nowrap">Required</div>}
                        {input.description && (
                          <div className="text-gray-400 mt-1 max-w-[200px] line-clamp-6">
                            {input.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pulse rings for hovered node */}
                    {isHovered && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/50 animate-ping" />
                        <div className="absolute -inset-1 rounded-full border border-yellow-400/30 animate-ping" style={{ animationDelay: '0.5s' }} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-sm text-gray-500 mt-2">
              <span className="text-orange-400 text-base font-semibold">*</span> Required
            </div>

          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 px-8 relative">
            <div className="text-4xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-flow">
              ⟶
            </div>
          </div>

          {/* Agent Node */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-400 font-semibold mb-2">
              Agent
            </div>
            
            <div className="group relative cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-purple-600 border-2 border-white/20 flex items-center justify-center text-3xl shadow-lg hover:scale-110 transition-all duration-300">
                🤖
              </div>

              {/* Agent Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
                  <div className="font-semibold whitespace-nowrap">{agent.name}</div>
                  <div className="text-gray-400 mt-1 max-w-[250px] line-clamp-6">{agent.description}</div>
                  <div className="text-gray-500 mt-1 text-[10px] whitespace-nowrap">{agent.filename}</div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-300 font-medium">{agent.name}</div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 px-8 relative">
            <div className="text-4xl font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-flow">
              ⟶
            </div>
          </div>

          {/* Output Nodes */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-xs text-gray-400 font-semibold mb-2">
              Outputs
            </div>
            
            <div className="flex flex-col gap-3">
              {outputKeys.map((key) => {
                const output = agent.outputs[key];
                const isHovered = hoveredOutput === key;
                
                return (
                  <div
                    key={key}
                    className="group relative cursor-pointer"
                    onMouseEnter={() => setHoveredOutput(key)}
                    onMouseLeave={() => setHoveredOutput(null)}
                  >
                    {/* Output Node */}
                    <div className={`px-4 py-2 rounded-full ${getOutputColor()}
                      border-2 border-white/20 flex items-center justify-center text-sm font-medium
                      transition-all duration-300 group-hover:scale-105 shadow-lg
                      ${isHovered ? 'scale-105 border-white/60' : ''} min-w-[120px]`}
                    >
                      {key}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                      <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
                        <div className="font-semibold whitespace-nowrap">{key}</div>
                        <div className="text-gray-400 mt-1 whitespace-nowrap">Type: {output.type}</div>
                        {output.description && (
                          <div className="text-gray-400 mt-1 max-w-[200px] line-clamp-6">
                            {output.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pulse rings for hovered node */}
                    {isHovered && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/50 animate-ping" />
                        <div className="absolute -inset-1 rounded-full border border-yellow-400/30 animate-ping" style={{ animationDelay: '0.5s' }} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Connection indicators */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-gray-400 z-10">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>
            {inputKeys.length} Input{inputKeys.length !== 1 ? 's' : ''} • {' '}
            {outputKeys.length} Output{outputKeys.length !== 1 ? 's' : ''}
            {agent.allow_frontend && ' • Frontend Enabled'}
          </span>
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