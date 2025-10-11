"use client";

import DeveloperNavbar from "@/components/DeveloperSidebar";
import FibuChat from "@/components/FibuChat";
import { useState } from "react";
import {
  HomeIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  BookOpenIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(360);

  return (
    // Full viewport height, flex column container
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Top navbar */}
      <DeveloperNavbar onMenuToggle={() => setMobileMenuOpen(m => !m)} />

      {/* Mobile menu dropdown (shown when hamburger is clicked) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-b border-gray-700">
          <div className="flex flex-col">
            {[
              { name: "Dashboard", icon: HomeIcon, href: "/developer/dashboard" },
              { name: "Agents", icon: CubeIcon, href: "/developer/agents" },
              { name: "Sandbox", icon: ArrowsRightLeftIcon, href: "/developer/workflow" },
              { name: "Documentation", icon: BookOpenIcon, href: "/developer/docs" },
              { name: "Settings", icon: CogIcon, href: "/developer/settings" },
              { name: "Help", icon: QuestionMarkCircleIcon, href: "/developer/help" },
            ].map((it) => {
              const Icon = it.icon;
              return (
                <Link
                  key={it.name}
                  href={it.href}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-gray-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 text-gray-300" />
                  <span className="text-sm text-gray-100 font-medium">{it.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main content area - flex row for content + chat */}
      <div className="flex-1 flex min-h-0">
        {/* Scrollable content */}
        <main className="flex-1 overflow-auto p-8 min-h-0">
          {children}
        </main>

        {/* Right-side chat panel */}
        {chatOpen && (
          <div className="flex-shrink-0 h-full" style={{ width: chatWidth }}>
            <FibuChat
              open={chatOpen}
              onClose={() => setChatOpen(false)}
              width={chatWidth}
              setWidth={setChatWidth}
            />
          </div>
        )}
      </div>

      {/* Floating toggle button (only when chat is closed) */}
      {!chatOpen && (
        <button
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-lg z-50 border-2 border-blue-500 flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition"
          onClick={() => setChatOpen(true)}
          aria-label="Open chat"
        >
          <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-white" />
        </button>
      )}
    </div>
  );
}