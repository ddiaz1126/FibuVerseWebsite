"use client";

import { useState } from "react";

interface Client {
  id: number;
  name: string;
}

export default function MessagesPage() {
  const clients: Client[] = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];

  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0]);
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);

  const sendMessage = (text: string) => {
    if (!text.trim() || !selectedClient) return;
    setMessages(prev => [...prev, { user: "You", text }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { user: selectedClient.name, text: "Reply from client..." }]);
    }, 500);
  };

  return (
    <div className="flex h-full">
      {/* Clients list */}
      <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
        {clients.map(client => (
          <button
            key={client.id}
            className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition ${
              selectedClient?.id === client.id ? "bg-gray-700" : ""
            }`}
            onClick={() => { setSelectedClient(client); setMessages([]); }}
          >
            {client.name}
          </button>
        ))}
      </div>

      {/* Messages panel */}
      <div className="flex-1 flex flex-col bg-gray-800">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded max-w-xs break-words ${
                msg.user === "You" ? "bg-blue-600 self-end" : "bg-gray-700 self-start"
              }`}
            >
              <strong>{msg.user}:</strong> {msg.text}
            </div>
          ))}
        </div>

        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  );
}

function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [input, setInput] = useState("");
  return (
    <div className="p-4 border-t border-gray-700 flex gap-2">
      <input
        type="text"
        className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
        placeholder="Type a message..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && (onSend(input), setInput(""))}
      />
      <button className="bg-green-600 px-4 rounded" onClick={() => { onSend(input); setInput(""); }}>
        Send
      </button>
    </div>
  );
}
