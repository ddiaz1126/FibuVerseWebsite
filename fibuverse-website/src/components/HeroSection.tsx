"use client";

import React, { useState, useEffect } from 'react';

interface CompositeAgent {
  id: number;
  name: string;
  description: string;
}

interface HeroSectionProps {
  agentCount: number;
  agents?: CompositeAgent[];
  loading?: boolean;
  onTryAgent?: (agentId: number) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  agentCount, 
  agents = [], 
  loading = false, 
  onTryAgent 
}) => {
  const [displayCount, setDisplayCount] = useState(0);
  const [particles, setParticles] = useState<{left: string, top: string, duration: string, delay: string}[]>([]);
  const [networkNodes, setNetworkNodes] = useState<{x: number, y: number, size: number, delay: string}[]>([]);

  useEffect(() => {
    // Animate agent count
    const duration = 2000;
    const increment = agentCount / (duration / 50);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= agentCount) {
        current = agentCount;
        clearInterval(timer);
      }
      setDisplayCount(Math.floor(current));
    }, 50);

    return () => clearInterval(timer);
  }, [agentCount]);

  useEffect(() => {
    // Initialize particles
    setParticles([...Array(90)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${12 + Math.random() * 25}s`,
      delay: `${Math.random() * 15}s`
    })));

    // Initialize network nodes
    setNetworkNodes([...Array(18)].map(() => ({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 3 + Math.random() * 4,
      delay: `${Math.random() * 4}s`
    })));
  }, []);

return (
  <section className="relative w-full min-h-screen flex flex-col overflow-hidden bg-black">
    {/* Extended background for entire section */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-gray-900" />

      {/* Continuous tech grid */}
      {/* <div className="absolute inset-0 opacity-15">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #facc15 1px, transparent 1px),
              linear-gradient(to bottom, #facc15 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            animation: 'grid-drift 30s linear infinite',
          }}
        />
      </div> */}

      {/* Enhanced fitness silhouettes */}
      <div className="absolute bottom-0 left-0 w-full h-60 opacity-8">
        <div className="absolute bottom-0 left-10 w-24 h-36 bg-gradient-to-t from-blue-500/60 to-transparent rounded-t-full transform -skew-x-12 blur-sm" />
        <div className="absolute bottom-0 right-16 w-20 h-32 bg-gradient-to-t from-purple-500/60 to-transparent rounded-t-full transform skew-x-12 blur-sm" />
        <div className="absolute bottom-0 left-1/3 w-28 h-36 bg-gradient-to-t from-cyan-500/60 to-transparent rounded-t-full blur-sm" />
        <div className="absolute bottom-0 right-1/3 w-24 h-28 bg-gradient-to-t from-emerald-500/60 to-transparent rounded-t-full transform -skew-x-8 blur-sm" />
      </div>

      {/* Ambient glow effects */}
      <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-yellow-400/5 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-blue-400/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-2/3 right-1/5 w-40 h-40 bg-purple-400/6 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
      
      {/* Bottom gradient to black */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black via-black/80 to-transparent" />
    </div>

    {/* Hero Content */}
    <div className="relative z-10 flex flex-col md:flex-row justify-center items-center px-4 py-12 min-h-[300px]">
      {/* Left content */}
      <div className="flex-1 relative">
        <h1 className="text-2xl font-bold mb-2 max-w-2xl text-white">
          Welcome to FibuVerse!
        </h1>
        <p className="text-sm text-gray-300 max-w-2xl mb-4 text-left">
          An ecosystem of fitness-tech tools to inspire growth, discovery, and transformation.        
          </p>
      </div>

      {/* Right agent count */}
      <div className="flex-1 flex justify-center md:justify-end mt-6 md:mt-0 relative">
        <div className="bg-gray-900/70 border border-yellow-500/30 rounded-xl p-4 text-center shadow-md backdrop-blur-sm w-52 relative overflow-hidden">
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, #facc15 50%, transparent 70%)',
              animation: 'border-glow 3s linear infinite',
              opacity: 0.3,
            }}
          />
          <div className="relative">
            <div className="text-4xl font-bold text-yellow-400">
              {displayCount.toLocaleString()}
            </div>
            <div className="text-gray-300 mt-1 text-sm">Active Agents</div>
          </div>
        </div>
      </div>
    </div>

    {/* Agents Section - Full width with scrollable cards */}
    {agents.length > 0 && (
      <div className="relative z-10 w-full px-4 pb-12">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/5 to-transparent blur-2xl pointer-events-none" />
        
        {/* Header */}
        <div className="mb-3 max-w-full">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent flex-1 max-w-[50px]" />
            <h2 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AI Agents
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent flex-1 max-w-[50px]" />
          </div>
        </div>


          {/* Agents Scroll Container */}
          {loading ? (
            <div className="w-full flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-10 h-10 border-2 border-yellow-400/30 rounded-full animate-ping"></div>
                </div>
                <p className="text-gray-400 text-xs font-medium">Summoning agents...</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Scroll indicators */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-full bg-gradient-to-r from-black to-transparent pointer-events-none z-20" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-full bg-gradient-to-l from-black to-transparent pointer-events-none z-20" />
              
              <div className="flex gap-4 overflow-x-auto pb-6 pt-3 scrollbar-hide scroll-smooth">
                {agents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="group min-w-[240px] max-w-[280px] h-auto flex-shrink-0"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative h-full bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-4 shadow-lg hover:shadow-yellow-400/20 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
                      
                      {/* Floating particles effect */}
                      <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <div className="absolute -top-3 -right-3 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-1000" />
                        <div className="absolute -bottom-3 -left-3 w-24 h-24 bg-blue-400/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-1000 delay-200" />
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Avatar and Status */}
                        <div className="relative mb-4">
                          <div className="relative inline-block">
                            {/* Avatar glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                            
                            {/* Avatar */}
                            <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                              <span className="text-black font-bold text-lg">
                                {agent.name[0].toUpperCase()}
                              </span>
                            </div>
                            
                            {/* Status indicator */}
                            <div className="absolute -top-1 -right-1 flex items-center justify-center">
                              <div className="absolute w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                              <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                            </div>
                          </div>
                        </div>

                        {/* Agent Info */}
                        <div className="flex-1 mb-4">
                          <h3 className="text-base font-bold text-white mb-1 group-hover:text-yellow-300 transition-colors duration-300">
                            {agent.name}
                          </h3>
                          
                          {/* Role/Category tag */}
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/30 rounded-full mb-2">
                            <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                            <span className="text-[10px] text-yellow-300 font-medium">AI Specialist</span>
                          </div>
                          
                          <p className="text-gray-300 text-xs leading-snug line-clamp-3">
                            {agent.description}
                          </p>
                        </div>

                        {/* Stats or Features */}
                        <div className="flex gap-3 mb-4 pt-2 border-t border-gray-700/50 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-800/80 rounded-lg flex items-center justify-center">
                              <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-800/80 rounded-lg flex items-center justify-center">
                              <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="text-[10px] text-gray-400">Verified</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        {onTryAgent && (
                          <button
                            onClick={() => onTryAgent(agent.id)}
                            className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 p-[1px] shadow-md group/btn hover:shadow-yellow-400/40 transition-all duration-300"
                          >
                            <div className="relative flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 transition-all duration-300 group-hover/btn:bg-transparent">
                              <span className="font-semibold text-xs text-white group-hover/btn:text-black transition-colors duration-300">
                                Launch Agent
                              </span>
                              <svg className="w-3 h-3 text-white group-hover/btn:text-black transition-all duration-300 group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Floating particles - Extended */}
      <div className="absolute inset-0">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-60"
            style={{
              left: p.left,
              top: p.top,
              animation: `float ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
              boxShadow: '0 0 10px rgba(250, 204, 21, 0.4)',
            }}
          />
        ))}
      </div>

      {/* Network nodes - Extended */}
      <div className="absolute inset-0 opacity-30">
        {networkNodes.map((node, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-yellow-400 shadow-lg"
            style={{
              animationName: 'node-pulse',
              animationDuration: `${2 + Math.random()}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: node.delay,
            }}
          />
        ))}
        
        {/* Smart network connections */}
        <svg className="absolute inset-0 w-full h-full">
          {networkNodes.map((node, i) => 
            networkNodes.slice(i + 1).map((otherNode, j) => {
              const distance = Math.sqrt(
                Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
              );
              
              if (distance < 30) {
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={`${node.x}%`}
                    y1={`${node.y}%`}
                    x2={`${otherNode.x}%`}
                    y2={`${otherNode.y}%`}
                    stroke="#facc15"
                    strokeWidth="3"
                    opacity="0.8"
                    style={{
                      animation: `connection-fade ${3 + Math.random() * 2}s ease-in-out infinite`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                );
              }
              return null;
            })
          )}
        </svg>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes grid-drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(100px, 100px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(10px) translateX(-10px); }
          75% { transform: translateY(-10px) translateX(5px); }
        }
        @keyframes node-pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.6; 
          }
          50% { 
            transform: scale(1.3); 
            opacity: 0.9; 
          }
        }
        @keyframes connection-fade {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
        @keyframes border-glow {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
        }
        
        /* Hide scrollbar */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;