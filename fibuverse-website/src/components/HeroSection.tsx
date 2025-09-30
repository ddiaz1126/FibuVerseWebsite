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
        <div className="absolute inset-0 opacity-15">
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
        </div>

        {/* Enhanced fitness silhouettes */}
        <div className="absolute bottom-0 left-0 w-full h-80 opacity-8">
          <div className="absolute bottom-0 left-10 w-32 h-48 bg-gradient-to-t from-blue-500/60 to-transparent rounded-t-full transform -skew-x-12 blur-sm" />
          <div className="absolute bottom-0 right-20 w-28 h-40 bg-gradient-to-t from-purple-500/60 to-transparent rounded-t-full transform skew-x-12 blur-sm" />
          <div className="absolute bottom-0 left-1/3 w-36 h-44 bg-gradient-to-t from-cyan-500/60 to-transparent rounded-t-full blur-sm" />
          <div className="absolute bottom-0 right-1/3 w-30 h-36 bg-gradient-to-t from-emerald-500/60 to-transparent rounded-t-full transform -skew-x-8 blur-sm" />
        </div>

        {/* Ambient glow effects */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-blue-400/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 right-1/5 w-56 h-56 bg-purple-400/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Bottom gradient to black */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col md:flex-row justify-center items-center px-8 py-16 min-h-[500px]">
        {/* Left content */}
        <div className="flex-1 relative">
          <h1 className="text-5xl font-bold mb-4 max-w-3xl text-white">
            Welcome to FibuVerse!
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mb-6 text-left">
          An AI ecosystem built to empower trainers — turning data into actionable insights, without ever replacing the human touch.
          </p>
        </div>

        {/* Right agent count */}
        <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0 relative">
          <div className="bg-gray-900/70 border border-yellow-500/40 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm w-64 relative overflow-hidden">
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, #facc15 50%, transparent 70%)',
                animation: 'border-glow 3s linear infinite',
                opacity: 0.3,
              }}
            />
            <div className="relative">
              <div className="text-5xl font-bold text-yellow-400">
                {displayCount.toLocaleString()}
              </div>
              <div className="text-gray-300 mt-2">Active Agents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Section - Full width with scrollable cards */}
      {agents.length > 0 && (
        <div className="relative z-10 w-full px-8 pb-16">
          {/* Header */}
          <div className="mb-6 max-w-full">
            <h2 className="text-4xl font-bold text-white mb-2">
              AI Agents
            </h2>
            {/* <p className="text-gray-300 text-lg max-w-3xl">
              Try our collection of specialized AI agents, each designed to solve specific challenges in fitness and wellness.
            </p> */}
          </div>

          {/* Agents Scroll Container */}
          {loading ? (
            <div className="w-full flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-300">Loading agents...</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-8 pt-4 scrollbar-hide">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="group min-w-[280px] max-w-[320px] h-auto bg-gray-900/60 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 flex-shrink-0 shadow-xl hover:shadow-2xl hover:border-yellow-400/30 transition-all duration-300 hover:scale-105 relative overflow-hidden"
                >
                  {/* Card glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Avatar */}
                    <div className="relative mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center text-black font-bold text-xl shadow-lg">
                        {agent.name[0].toUpperCase()}
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 mb-6">
                      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-yellow-300 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {agent.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    {onTryAgent && (
                      <button
                        onClick={() => onTryAgent(agent.id)}
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-semibold px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg shadow-yellow-400/25"
                      >
                        Try Agent →
                      </button>
                    )}
                  </div>
                </div>
              ))}
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