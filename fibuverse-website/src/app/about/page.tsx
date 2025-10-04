"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import Header from '@/components/Header';

export default function AboutPage() {
  // const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [, setActiveSection] = useState('hero');

  // const toggleSection = (section: string) => {
  //   setExpandedSection(expandedSection === section ? null : section);
  // };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'problem', 'solution', 'how-we-help', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
  <div className="min-h-screen bg-black text-white">
    {/* Global Header at very top */}
    <Header logoSrc="/images/logo.png" />

    <div className="flex">
      {/* Main Content - offset by sidebar width */}
      <div className="flex-1">
        {/* Animated Hero */}
        <section id="hero" className="relative w-full h-[600px] flex flex-col justify-center items-center overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-gray-900" />
            
            {/* Tech grid */}
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

            {/* Silhouettes */}
            <div className="absolute bottom-0 left-0 w-full h-80 opacity-8">
              <div className="absolute bottom-0 left-10 w-32 h-48 bg-gradient-to-t from-blue-500/60 to-transparent rounded-t-full transform -skew-x-12 blur-sm" />
              <div className="absolute bottom-0 right-20 w-28 h-40 bg-gradient-to-t from-purple-500/60 to-transparent rounded-t-full transform skew-x-12 blur-sm" />
              <div className="absolute bottom-0 left-1/3 w-36 h-44 bg-gradient-to-t from-cyan-500/60 to-transparent rounded-t-full blur-sm" />
              <div className="absolute bottom-0 right-1/3 w-30 h-36 bg-gradient-to-t from-emerald-500/60 to-transparent rounded-t-full transform -skew-x-8 blur-sm" />
            </div>

            {/* Ambient glows */}
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-blue-400/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-2/3 right-1/5 w-56 h-56 bg-purple-400/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
            
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center px-6 max-w-4xl">
            <div className="inline-block px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full mb-6 animate-fadeIn">
              <span className="text-yellow-400 text-sm font-bold tracking-wide">FITNESS-TECH ECOSYSTEM</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              Welcome to FibuVerse
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              All your efforts, connected behind the scenes.
            </p>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-yellow-400" />
          </div>
        </section>

        {/* The Problem */}
        <section id="problem" className="relative py-20 px-6 md:px-20 bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-red-400 text-sm font-bold tracking-wider uppercase">The Problem</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">Fitness is stuck in the past, trapped in closed apps and platforms.</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Time-Consuming Card */}
              <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/20 rounded-2xl p-8 hover:border-red-500/60 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2">
                <div className="relative h-32 mb-6 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-red-500/30 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-transparent border-t-red-500 rounded-full animate-spin group-hover:animate-none transition-all duration-500"></div>
                      <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center text-2xl group-hover:opacity-0 transition-opacity duration-500">⏱️</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-2">
                    <div className="w-16 h-12 bg-gray-700 rounded-lg animate-pulse" style={{animationDelay: '0s'}}></div>
                    <div className="w-16 h-12 bg-gray-700 rounded-lg animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-16 h-12 bg-gray-700 rounded-lg animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-red-400">Trainers: Time-Consuming</h3>
                <p className="text-gray-400 leading-relaxed">
                  Trainers spend hours creating plans and adapting to multiple apps and tools.
                </p>
              </div>

              {/* Disconnected Apps Card */}
              <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/20 rounded-2xl p-8 hover:border-red-500/60 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2">
                <div className="relative h-32 mb-6 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                    <div className="w-14 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center text-2xl group-hover:translate-x-8 group-hover:-translate-y-4 group-hover:rotate-12 transition-all duration-500">📱</div>
                    <div className="w-14 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center text-2xl group-hover:-translate-x-8 group-hover:-translate-y-4 group-hover:-rotate-12 transition-all duration-500">📊</div>
                    <div className="w-14 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg flex items-center justify-center text-2xl group-hover:translate-y-6 transition-all duration-500">⌚</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-red-400">Disconnected Apps</h3>
                <p className="text-gray-400 leading-relaxed">
                  Juggling multiple apps results in scattered health and fitness information.
                </p>
              </div>

              {/* AI Myth Card */}
              <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/20 rounded-2xl p-8 hover:border-red-500/60 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2">
                <div className="relative h-32 mb-6 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="text-5xl opacity-100 group-hover:opacity-0 transition-opacity duration-500">🤖</div>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col gap-1 items-center justify-center">
                        <div className="w-24 h-2 bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-20 h-2 bg-gray-700 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-28 h-2 bg-gray-700 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="text-4xl mt-2 text-red-500/50">≠</div>
                        <div className="text-3xl mt-1">💪</div>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-red-400">AI Myth: AI vs Trainers</h3>
                <p className="text-gray-400 leading-relaxed">
                  AI tools help, but trainers provide irreplaceable expertise.
                </p>
              </div>
            </div>

          </div>
        </section>

{/* The Solution */}
        <section id="solution" className="relative py-20 px-6 md:px-20 bg-gradient-to-b from-black via-blue-950/20 to-black overflow-hidden">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="text-blue-400 text-sm font-bold tracking-wider uppercase">The Solution</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">Meet Fibu</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
                Not just another AI chatbot. Fibu is an <span className="text-blue-400 font-semibold">intelligent orchestrator</span> that coordinates a specialized ecosystem of agents and tools.
              </p>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Think of it as your fitness business&apos;s central nervous system—routing tasks to expert agents, managing workflows, and delivering results seamlessly.
              </p>
            </div>

            <div className="relative">
              {/* Central Orchestration Hub */}
              <div className="flex justify-center mb-16">
                <div className="relative">
                  {/* Pulsing Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ width: '600px', height: '400px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                        <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[0, 1, 2, 3].map((i) => (
                      <line
                        key={i}
                        x1="300"
                        y1="200"
                        x2={300 + Math.cos((i * Math.PI) / 2) * 180}
                        y2={200 + Math.sin((i * Math.PI) / 2) * 180}
                        stroke="url(#lineGradient)"
                        strokeWidth="2"
                        className="animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </svg>

                  {/* Central Fibu Hub */}
                  <div className="relative z-10">
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-300/50">
                      <Sparkles className="w-16 h-16 text-black" />
                    </div>
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <span className="text-yellow-400 font-bold text-sm">Orchestration Engine</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6 mb-12">
                <h3 className="text-2xl font-bold mb-4 text-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    How Fibu Orchestrates
                  </span>
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-sm font-semibold text-blue-300 mb-1">1. Understands Context</div>
                    <div className="text-xs text-gray-400">Analyzes your request and client needs</div>
                  </div>
                  <div>
                    <div className="text-3xl mb-2">🔀</div>
                    <div className="text-sm font-semibold text-purple-300 mb-1">2. Routes to Specialists</div>
                    <div className="text-xs text-gray-400">Delegates to the right agent or tool</div>
                  </div>
                  <div>
                    <div className="text-3xl mb-2">✨</div>
                    <div className="text-sm font-semibold text-yellow-300 mb-1">3. Delivers Results</div>
                    <div className="text-xs text-gray-400">Combines outputs into actionable insights</div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-12 text-center">
                <p className="text-gray-400 text-sm">
                  <span className="text-blue-400 font-semibold">Multi-agent architecture</span> means Fibu gets smarter and more capable over time—new specialized agents can be added to expand functionality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How We Help You */}
        <section id="how-we-help" className="relative py-20 px-6 md:px-20 bg-gradient-to-b from-black via-green-950/20 to-black">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-green-400 text-sm font-bold tracking-wider uppercase">How We Help</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">Built for everyone in fitness</h2>
            </div>

          </div>
        </section>

        {/* Contact CTA */}
        <section id="contact" className="relative py-20 px-6 md:px-20 bg-gradient-to-b from-black via-purple-950/20 to-black">
          <div className="max-w-4xl mx-auto text-center">

            <div className="border-t border-gray-800 pt-8 mt-12">
              <h3 className="text-2xl font-bold mb-4 text-gray-300">Get in Touch</h3>
              <div className="flex flex-col sm:flex-row gap-6 justify-center text-gray-400">
                <a href="mailto:support@fibuverse.com" className="hover:text-yellow-400 transition-colors">
                  support@fibuverse.com
                </a>
                <span className="hidden sm:inline">•</span>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Developer Docs
                </a>
                <span className="hidden sm:inline">•</span>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  API Access
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes grid-drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(100px, 100px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
    </div>
  );
}