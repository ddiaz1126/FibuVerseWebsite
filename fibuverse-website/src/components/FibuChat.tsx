"use client";

import { useEffect, useRef, useState } from "react";

interface FibuChatProps {
  open: boolean;
  onClose: () => void;
  width: number;
  setWidth: (w: number) => void;
}

export default function FibuChat({ open, onClose, width, setWidth }: FibuChatProps) {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const dragging = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Send message
  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { user: "You", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { user: "Fibu", text: "Response from Fibu..." }]);
    }, 500);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Drag handlers
  const startDrag = (e: React.MouseEvent) => {
    dragging.current = true;
    e.preventDefault();
  };
  const stopDrag = () => {
    dragging.current = false;
  };
  const onDrag = (e: MouseEvent) => {
    if (!dragging.current) return;
    const newWidth = window.innerWidth - e.clientX;
    const min = 320;
    const max = Math.min(900, window.innerWidth - 200);
    const clamped = Math.max(min, Math.min(max, newWidth));
    setWidth(clamped);
  };

  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, []);

  if (!open) return null;

  return (
    <aside
      className="h-screen bg-gray-800 text-white shadow-xl flex flex-col relative"
      style={{ width }}
      aria-hidden={!open}
    >
      {/* Drag handle */}
      <div
        onMouseDown={startDrag}
        className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full cursor-ew-resize z-50 flex items-center justify-center"
        title="Drag to resize"
        role="button"
        aria-label="Resize chat"
      >
        <span className="block w-2 h-2 bg-white rounded-full" />
      </div>

      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-gray-900">
            F
          </div>
          <h3 className="text-lg font-semibold">Fibu</h3>
        </div>
        <button
          className="text-gray-300 px-2 py-1 rounded hover:bg-gray-700"
          onClick={onClose}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-sm text-gray-400">
            Say hi to Fibu — ask about workouts, nutrition, or tools.
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded max-w-[75%] break-words ${
              m.user === "You" ? "bg-blue-600 self-end" : "bg-gray-700 self-start"
            }`}
          >
            <strong className="block text-xs text-gray-200">{m.user}</strong>
            <div className="mt-1">{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 flex gap-2 flex-shrink-0">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="bg-blue-600 px-4 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </aside>
  );
}
