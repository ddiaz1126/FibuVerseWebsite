// DeveloperPortalSection.tsx
import React, { useState, useEffect } from 'react';
import { Mail, Code, GitBranch, Cpu, Network, Zap, Play, Book, Layers } from 'lucide-react';

export default function DeveloperPortalSection() {
  const [agents, setAgents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    // Create AI agent nodes
    const agentNodes = [
      { id: 0, x: 50, y: 30, type: 'fitness', active: false, delay: '0s' },
      { id: 1, x: 20, y: 60, type: 'nutrition', active: false, delay: '0.5s' },
      { id: 2, x: 80, y: 60, type: 'wellness', active: false, delay: '1s' },
      { id: 3, x: 35, y: 80, type: 'coach', active: false, delay: '1.5s' },
      { id: 4, x: 65, y: 80, type: 'analytics', active: false, delay: '2s' },
      { id: 5, x: 50, y: 50, type: 'core', active: true, delay: '0s' }, // Central hub
    ];

    // Create connections between agents
    const agentConnections = [
      { from: 5, to: 0, delay: '0s' },
      { from: 5, to: 1, delay: '0.3s' },
      { from: 5, to: 2, delay: '0.6s' },
      { from: 5, to: 3, delay: '0.9s' },
      { from: 5, to: 4, delay: '1.2s' },
      { from: 0, to: 1, delay: '1.5s' },
      { from: 1, to: 3, delay: '1.8s' },
      { from: 2, to: 4, delay: '2.1s' },
      { from: 3, to: 4, delay: '2.4s' },
    ];

    setAgents(agentNodes);
    setConnections(agentConnections);

    // Auto-cycle through nodes
    const interval = setInterval(() => {
      setActiveNode(prev => (prev + 1) % agentNodes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getAgentColor = (type, isActive) => {
    const colors = {
      fitness: isActive ? 'bg-blue-400' : 'bg-blue-600/50',
      nutrition: isActive ? 'bg-green-400' : 'bg-green-600/50',
      wellness: isActive ? 'bg-purple-400' : 'bg-purple-600/50',
      coach: isActive ? 'bg-orange-400' : 'bg-orange-600/50',
      analytics: isActive ? 'bg-cyan-400' : 'bg-cyan-600/50',
      core: isActive ? 'bg-yellow-400' : 'bg-yellow-500/70'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getAgentIcon = (type) => {
    const icons = {
      fitness: '💪',
      nutrition: '🥗',
      wellness: '🧘',
      coach: '👨‍💼',
      analytics: '📊',
      core: '🧠'
    };
    return icons[type] || '🤖';
  };

  const features = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "Agent Builder SDK",
      description: "Create custom AI agents with our comprehensive development toolkit"
    },
    {
      icon: <Network className="w-6 h-6" />,
      title: "Ecosystem Integration",
      description: "Connect your agents to the broader Fibu network for enhanced capabilities"
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "AI Model Access",
      description: "Leverage pre-trained models or bring your own for specialized use cases"
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: "Version Control",
      description: "Manage agent versions, rollbacks, and deployments seamlessly"
    }
  ];

  return (
    <section className="relative w-full py-20 px-8 bg-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Neural network background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, #facc15 1px, transparent 1px),
                radial-gradient(circle at 80% 20%, #3b82f6 1px, transparent 1px),
                radial-gradient(circle at 20% 80%, #8b5cf6 1px, transparent 1px),
                radial-gradient(circle at 80% 80%, #10b981 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px',
            }}
          />
        </div>

        {/* Corner circuit patterns */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
          <div className="absolute inset-0 border-l-2 border-t-2 border-yellow-400/50" />
          <div className="absolute top-4 left-4 w-4 h-4 border border-yellow-400/50" />
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <div className="absolute inset-0 border-r-2 border-t-2 border-blue-400/50" />
          <div className="absolute top-4 right-4 w-4 h-4 border border-blue-400/50" />
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Layers className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-4xl font-bold text-white">Developer Portal</h2>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
            Build, test, and extend the Fibu ecosystem — integrate AI agents into your apps, 
            explore APIs, and experiment in a secure sandbox environment.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Left Side - AI Agent Network Visualization */}
          <div className="relative">
            <div className="relative w-full h-96 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/50 p-8 backdrop-blur-sm overflow-hidden">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">AI Agent Ecosystem</h3>
              
              {/* SVG for connections */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                {connections.map((connection, idx) => {
                  const fromAgent = agents.find(a => a.id === connection.from);
                  const toAgent = agents.find(a => a.id === connection.to);
                  if (!fromAgent || !toAgent) return null;
                  
                  return (
                    <line
                      key={idx}
                      x1={`${fromAgent.x}%`}
                      y1={`${fromAgent.y}%`}
                      x2={`${toAgent.x}%`}
                      y2={`${toAgent.y}%`}
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      className="opacity-60"
                      style={{
                        animation: `connection-pulse 3s ease-in-out infinite`,
                        animationDelay: connection.delay,
                      }}
                    />
                  );
                })}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Agent Nodes */}
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ 
                    left: `${agent.x}%`, 
                    top: `${agent.y}%`,
                    zIndex: 2
                  }}
                  onClick={() => setActiveNode(agent.id)}
                >
                  {/* Node */}
                  <div className={`w-12 h-12 rounded-full ${getAgentColor(agent.type, activeNode === agent.id)} 
                    border-2 border-white/20 flex items-center justify-center text-lg
                    transition-all duration-300 group-hover:scale-110 shadow-lg
                    ${activeNode === agent.id ? 'animate-pulse scale-110 border-white/60' : ''}`}
                  >
                    {getAgentIcon(agent.type)}
                  </div>
                  
                  {/* Label */}
                  <div className="absolute top-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded capitalize whitespace-nowrap">
                      {agent.type} Agent
                    </div>
                  </div>

                  {/* Pulse rings for active node */}
                  {activeNode === agent.id && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-yellow-400/50 animate-ping" />
                      <div className="absolute -inset-2 rounded-full border border-yellow-400/30 animate-ping" style={{ animationDelay: '0.5s' }} />
                    </>
                  )}
                </div>
              ))}

              {/* Data flow indicators */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Active Connections: {connections.length}</span>
              </div>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="space-y-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl bg-gray-900/50 border border-gray-700/50 hover:border-yellow-500/40 transition-all duration-300 hover:bg-gray-900/70 hover:shadow-lg hover:shadow-yellow-500/10"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-800/50 group-hover:bg-yellow-500/20 transition-colors duration-300">
                    <div className="text-gray-400 group-hover:text-yellow-400 transition-colors duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors duration-300 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300">Ready to shape the future of fitness AI?</span>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-600/30 transform hover:scale-105 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            Request Access
            </button>
        </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes connection-pulse {
          0%, 100% { opacity: 0.3; stroke-width: 1px; }
          50% { opacity: 0.8; stroke-width: 3px; }
        }
      `}</style>
    </section>
  );
}