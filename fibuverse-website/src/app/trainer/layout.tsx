"use client";

import TrainerSidebar from "@/components/TrainerSidebar";
import FibuChat from "@/components/FibuChat";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Chat state lifted to layout so available globally
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(360);

  useEffect(() => {
    const handleResize = () => setSidebarCollapsed(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Left sidebar */}
      <TrainerSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(s => !s)}
      />

      {/* Main content flex container */}
      <div className="flex flex-1 overflow-auto transition-all duration-300">
        {/* Content */}
        <main className="flex-1 p-8">{children}</main>

        {/* Right-side chat panel (pushes content) */}
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

      {/* Floating toggle button (optional) */}
      <button
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-lg z-50 border-2 border-blue-500 flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition"
        onClick={() => setChatOpen(s => !s)}
        aria-label="Open chat"
      >
        <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-white" />
      </button>
    </div>
  );
}
