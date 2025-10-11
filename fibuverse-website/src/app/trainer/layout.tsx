// TrainerLayout.tsx
"use client";

import TrainerNavbar, { trainerNavItems } from "@/components/TrainerSidebar";
import FibuChat from "@/components/FibuChat";
import { ChatBubbleLeftEllipsisIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(360);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    // Explicit h-screen ensures a concrete viewport height for children
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Top navbar */}
      <TrainerNavbar
        onMenuToggle={() => setMobileMenuOpen(prev => !prev)}
      />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-0 right-0 h-full w-64 bg-gray-900 border-l border-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span className="font-bold text-sm">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Mobile Navigation Links */}
            <nav className="p-4 space-y-2">
              {trainerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-yellow-400/10 text-yellow-400 border-l-4 border-yellow-400"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-yellow-400" : "text-blue-400"
                      }`}
                    />
                    <span className="text-sm font-semibold">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

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