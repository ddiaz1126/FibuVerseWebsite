"use client";

import { useEffect, useState } from "react";
import { getTrainerChatHistory } from "@/api/trainer";

interface ChatHistory {
  room_name: string;
  recipient_user_id: string;
  trainer_data: {
    id: number;
    name: string;
  } | null;
  last_message: string;
  timestamp: string;
}

interface Message {
  user: string;
  text: string;
}

export default function MessagesPage() {
  const [clients, setClients] = useState<ChatHistory[]>([]);
  const [selectedClient, setSelectedClient] = useState<ChatHistory | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const history = await getTrainerChatHistory(token);
        setClients(history);
        if (history.length > 0) {
          setSelectedClient(history[0]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const sendMessage = (text: string) => {
    if (!text.trim() || !selectedClient) return;

    // push your own message
    setMessages((prev) => [...prev, { user: "You", text }]);

    // fake client reply for now
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          user: selectedClient.trainer_data?.name || "Client",
          text: "Reply from client...",
        },
      ]);
    }, 500);
  };

  if (loading) return <div className="p-6">Loading chat history...</div>;

  return (
    <div className="flex h-full">
      {/* Clients list */}
      <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
        {clients.map((client) => (
          <button
            key={client.room_name}
            className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition ${
              selectedClient?.room_name === client.room_name ? "bg-gray-700" : ""
            }`}
            onClick={() => {
              setSelectedClient(client);
              setMessages([
                {
                  user: client.trainer_data?.name || "Client",
                  text: client.last_message,
                },
              ]);
            }}
          >
            {client.trainer_data?.name || "Unknown Client"}
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
                msg.user === "You"
                  ? "bg-blue-600 self-end"
                  : "bg-gray-700 self-start"
              }`}
            >
              <strong>{msg.user}:</strong> {msg.text}
            </div>
          ))}
        </div>

        {selectedClient && <MessageInput onSend={sendMessage} />}
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
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend(input);
            setInput("");
          }
        }}
      />
      <button
        className="bg-green-600 px-4 rounded"
        onClick={() => {
          onSend(input);
          setInput("");
        }}
      >
        Send
      </button>
    </div>
  );
}
