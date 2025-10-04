"use client";

import DeveloperSidebar from "@/components/DeveloperSidebar";
import FibuChat from "@/components/FibuChat";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
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
    // Full viewport height, flex container
    <div className="h-screen flex bg-gray-900 text-white">
      {/* Left sidebar */}
      <DeveloperSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(s => !s)}
      />

      {/* Main content flex container */}
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
