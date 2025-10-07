// TrainerLayout.tsx
"use client";

import TrainerSidebar from "@/components/TrainerSidebar";
import FibuChat from "@/components/FibuChat";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(360);

  useEffect(() => {
    const handleResize = () => setSidebarCollapsed(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    // Explicit h-screen ensures a concrete viewport height for children
    <div className="h-screen flex bg-gray-900 text-white">
      {/* Left sidebar */}
      <TrainerSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(s => !s)}
      />

      {/* Main content flex container — ensure min-h-0 so children measure correctly */}
      <div className="flex-1 flex min-h-0">
        {/* Content area (scrollable) */}
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

     {/* Floating toggle button — hide when chat is open */}
      {!chatOpen && (
        <button
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg z-50 border border-blue-500 flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition"
          onClick={() => setChatOpen(true)}
          aria-label="Open chat"
        >
          <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
