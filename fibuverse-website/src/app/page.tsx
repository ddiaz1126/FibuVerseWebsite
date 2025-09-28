// src/app/page.tsx
"use client";

import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { fetchPublicCompositeAgents, fetchCompositeAgentCount } from "@/api/public"; // ✅ API helper
import HeroSection from "@/components/HeroSection";
import FibuAppSection from "@/components/FibuAppSection";
import TrainerPortalSection from "@/components/TrainerPortalSection";
import DeveloperPortalSection from "@/components/DeveloperPortalSection";

interface CompositeAgent {
  id: number;
  name: string;
  description: string;
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

  // Load agent count
  useEffect(() => {
    async function loadAgentCount() {
      const count = await fetchCompositeAgentCount();
      setAgentCount(count);
    }
    loadAgentCount();
  }, []);

  // Link to Fibu Agents
  const handleTryAgent = (agentId: number) => {
    // Pass the agentId as a query parameter
    router.push(`/fibu/?agentId=${agentId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header logoSrc="/images/logo.png" />

      <HeroSection 
        agentCount={agentCount}
        agents={agents}
        loading={loading}
        onTryAgent={handleTryAgent}
      />      

      {/* Application Section */}
      <FibuAppSection />

      {/* Trainer Portal Highlights */}
      <TrainerPortalSection />

      {/* Developer Access Highlights */}
      <DeveloperPortalSection />

      {/* Footer */}
      <footer className="w-full py-12 px-8 bg-black border-t border-gray-800 text-gray-400 flex flex-col md:flex-row justify-between items-center">
        <div>© 2025 FibuVerse</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#">Docs</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}

