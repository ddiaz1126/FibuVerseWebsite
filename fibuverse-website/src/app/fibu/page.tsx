// src/app/fibu/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";

export default function FibuPage() {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { user: "You", text: input }]);
    setInput("");

    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, { user: "Fibu", text: "This is a response from Fibu." }]);
    }, 800);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar below header */}
      <aside className="fixed left-0 top-18 h-[calc(100%-64px)] w-72 bg-gray-900 z-40 p-6 shadow-lg">
        <h2 className="text-gray-300 text-sm font-semibold uppercase tracking-wide mb-4">
          Agents
        </h2>
        <nav className="flex flex-col gap-3 text-white">
          <button className="text-left px-3 py-2 rounded-lg hover:bg-gray-800">
            Exercise Analysis
          </button>
          <button className="text-left px-3 py-2 rounded-lg hover:bg-gray-800">
            Nutrition Analysis
          </button>
          <button className="text-left px-3 py-2 rounded-lg hover:bg-gray-800">
            Custom Data
          </button>
        </nav>
      </aside>


      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header logoSrc="/images/logo.png" />

      <main className="flex-1 flex flex-col justify-end p-6 overflow-auto">
        <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded max-w-xs ${
                msg.user === "You"
                  ? "bg-blue-600 self-end"
                  : "bg-gray-700 self-start"
              }`}
            >
              <strong>{msg.user}:</strong> {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="p-4 flex justify-center bg-gray-900 border-t border-gray-700">
        <div className="flex w-full max-w-3xl gap-2 mx-auto">
          <input
            type="text"
            className="flex-1 p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </footer>
      </div>
    </div>
  );
}
