import React, { useState, useEffect } from 'react';
import { Monitor, BarChart3, Brain, Users, Zap } from 'lucide-react';

interface Particle {
  id: number;
  left: string;
  top: string;
  duration: string;
  delay: string;
}

export default function TrainerPortalSection() {
  const [activeCard, setActiveCard] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Initialize subtle floating particles
  setParticles([...Array(30)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: `${12 + Math.random() * 8}s`,
    delay: `${Math.random() * 6}s`,
  })));

    // Auto-cycle through cards
    const interval = setInterval(() => {
      setActiveCard(prev => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const highlights = [
    {
      icon: <Monitor className="w-8 h-8" />,
      title: "Programming Interface",
      description: "Create and manage client workouts and plans efficiently with a desktop-optimized interface.",
      features: ["Drag & drop workout builder", "Template library", "Progress tracking"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Powerful Dashboards",
      description: "Visualize client progress and key metrics at a glance for smarter coaching decisions.",
      features: ["Real-time analytics", "Custom reports", "Performance insights"]
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Tools",
      description: "Use AI assistance to provide insights, recommendations, and optimize client results.",
      features: ["Smart recommendations", "Automated insights", "Predictive analytics"]
    }
  ];

  return (
<section className="relative w-full py-20 px-8 bg-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Floating particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-30"
            style={{
              left: particle.left,
              top: particle.top,
              animation: `gentle-drift ${particle.duration} ease-in-out infinite`,
              animationDelay: particle.delay,
            }}
          />
        ))}

        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Users className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-4xl font-bold text-white">Desktop Trainer Portal</h2>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Giving trainers a streamlined workspace to coach smarter 
            and track progress effortlessly with AI-powered insights.
          </p>
        </div>

        {/* Enhanced Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className={`group relative cursor-pointer transition-all duration-500 ${
                activeCard === idx ? 'transform scale-105' : ''
              }`}
              onMouseEnter={() => setActiveCard(idx)}
            >
              {/* Card Background */}
              <div className={`relative p-8 rounded-2xl border transition-all duration-500 ${
                activeCard === idx
                  ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-yellow-500/50 shadow-2xl shadow-yellow-500/20'
                  : 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600/60 hover:bg-gray-800/80'
              }`}>
                
                {/* Glowing effect for active card */}
                {activeCard === idx && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 rounded-2xl blur opacity-75" />
                )}

                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-xl mb-6 transition-all duration-300 ${
                    activeCard === idx 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-700/70 group-hover:text-gray-300'
                  }`}>
                    {item.icon}
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
                    activeCard === idx ? 'text-yellow-400' : 'text-white group-hover:text-gray-200'
                  }`}>
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {item.description}
                  </p>

                  {/* Feature List */}
                  <div className="space-y-2">
                    {item.features.map((feature, featureIdx) => (
                      <div 
                        key={featureIdx}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                          activeCard === idx ? 'bg-yellow-400' : 'bg-gray-500'
                        }`} />
                        <span className="text-sm text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corner decoration */}
                <div className={`absolute top-4 right-4 w-12 h-12 rounded-full border transition-all duration-300 ${
                  activeCard === idx 
                    ? 'border-yellow-400/30 bg-yellow-400/5' 
                    : 'border-gray-600/30 bg-gray-600/5 group-hover:border-gray-500/40'
                }`}>
                  <div className={`absolute inset-3 rounded-full transition-all duration-300 ${
                    activeCard === idx ? 'bg-yellow-400/20' : 'bg-gray-500/10'
                  }`} />
                </div>
              </div>

              {/* Active indicator */}
              {activeCard === idx && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-yellow-400 to-blue-400 rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Ready to transform your training business?</span>
            </div>
            <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/30 transform hover:scale-105">
              Request Access
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gentle-drift {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(10px) translateX(-10px); }
          75% { transform: translateY(-15px) translateX(5px); }
        }
      `}</style>
    </section>
  );
}