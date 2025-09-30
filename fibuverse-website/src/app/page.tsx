// src/app/page.tsx
"use client";

import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

import { fetchPublicCompositeAgents, fetchCompositeAgentCount } from "@/api/public"; // ✅ API helper
import HeroSection from "@/components/HeroSection";
import FibuAppSection from "@/components/FibuAppSection";
import TrainerPortalSection from "@/components/TrainerPortalSection";
import DeveloperPortalSection from "@/components/DeveloperPortalSection";

interface SubAgent {
  id: number;
  name: string;
  filename: string;
  description: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  input_examples?: any[];
  output_examples?: any[];
}

interface CompositeLayer {
  layer_index: number;
  subagents: SubAgent[];
  allow_parallel: boolean;
}

interface CompositeAgent {
  id: number;
  name: string;
  description: string;
  requires_auth: boolean;
  auth_type: "none" | "credentials" | "oauth2" | "apikey";
  oauth_url?: string | null;
  oauth_scopes?: any;
  public: boolean;
  
  // Network structure
  layers: CompositeLayer[];
  subagents: SubAgent[];  // Flat list of all subagents
  
  // Merged inputs from all subagents (added by your view)
  inputs: Record<string, any>;
  
  // Optional outputs if your backend provides it
  outputs?: Record<string, any>;
}

// Create a reusable animated section component
function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 80, scale: 0.95 }}
      transition={{ 
        duration: 0.9, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing curve
      }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const router = useRouter();
  const [agents, setAgents] = useState<CompositeAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentCount, setAgentCount] = useState<number>(0);

  useEffect(() => {
    async function loadAgents() {
      const data = await fetchPublicCompositeAgents();
      setAgents(data);
      setLoading(false);
    }
    loadAgents();
  }, []);

  useEffect(() => {
    async function loadAgentCount() {
      const count = await fetchCompositeAgentCount();
      setAgentCount(count);
    }
    loadAgentCount();
  }, []);

  const handleTryAgent = (agentId: number) => {
    router.push(`/fibu/?agentId=${agentId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - no animation needed */}
      <Header logoSrc="/images/logo.png" />

      {/* Hero - can add stagger effect internally */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <HeroSection 
          agentCount={agentCount}
          agents={agents}
          loading={loading}
          onTryAgent={handleTryAgent}
        />
      </motion.div>

      {/* Sections with scroll animations */}
      <AnimatedSection delay={0}>
        <FibuAppSection />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <TrainerPortalSection />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <DeveloperPortalSection />
      </AnimatedSection>

      {/* Footer */}
      <AnimatedSection delay={0}>
        <footer className="w-full py-12 px-8 bg-black border-t border-gray-800 text-gray-400 flex flex-col md:flex-row justify-between items-center">
          <div>© 2025 FibuVerse</div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </footer>
      </AnimatedSection>
    </div>
  );
}