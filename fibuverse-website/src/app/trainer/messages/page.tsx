"use client";

import { useEffect, useState } from "react";
import { getTrainerChatHistory } from "@/api/trainer";
import { Users, Mail, Send, Search, MoreVertical, Paperclip, Smile, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button"

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

        const history = await getTrainerChatHistory();
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
  <div className="flex h-full pr-8">
    {/* Clients list */}
    <div className="w-72 border-r border-gray-700/50 overflow-y-auto bg-gray-800/30">
      <div className="p-3 border-b border-gray-700/50 bg-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Conversations
          </h2>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
            Coming Soon
          </span>
        </div>
        <Button 
          variant="success" 
          size="md" 
          className="w-full"
          icon={<Users className="w-3.5 h-3.5" />}
          label="Create Group"
        />
      </div>
      <div className="divide-y divide-gray-700/30">
        {clients.map((client) => (
          <button
            key={client.room_name}
            className={`w-full text-left px-3 py-2.5 hover:bg-gray-700/30 transition-all ${
              selectedClient?.room_name === client.room_name 
                ? "bg-gray-700/50 border-l-2 border-l-blue-500" 
                : ""
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
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {(client.trainer_data?.name || "C").charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-gray-800"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold text-white truncate">
                    {client.trainer_data?.name || "Unknown Client"}
                  </p>
                  <span className="text-[9px] text-gray-500">2m</span>
                </div>
                <p className="text-[10px] text-gray-400 truncate">
                  {client.last_message || "No messages yet"}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* Messages panel */}
    <div className="flex-1 flex flex-col bg-gray-800/50">
      {selectedClient ? (
        <>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {(selectedClient.trainer_data?.name || "C").charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-gray-800"></div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    {selectedClient.trainer_data?.name || "Unknown Client"}
                  </h3>
                  <p className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Active now
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-gray-700/50 rounded transition-colors">
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button className="p-1.5 hover:bg-gray-700/50 rounded transition-colors">
                  <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 py-3 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${
                  msg.user === "You" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 ${
                  msg.user === "You" 
                    ? "bg-gradient-to-br from-green-500 to-emerald-600" 
                    : "bg-gradient-to-br from-blue-500 to-purple-600"
                }`}>
                  {msg.user.charAt(0).toUpperCase()}
                </div>
                <div className={`flex flex-col ${msg.user === "You" ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold text-gray-300">{msg.user}</span>
                    <span className="text-[9px] text-gray-500">12:34 PM</span>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-lg max-w-md break-words text-xs ${
                      msg.user === "You"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700/70 text-gray-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <MessageInput onSend={sendMessage} />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">No conversation selected</h3>
            <p className="text-xs text-gray-400">Choose a client to start messaging</p>
          </div>
        </div>
      )}
    </div>
  </div>
);
function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [input, setInput] = useState("");
  return (
    <div className="px-4 py-3 border-t border-gray-700/50 bg-gray-800/30">
      <div className="bg-gray-700/50 rounded-lg border border-gray-600 focus-within:border-blue-500 transition-colors">
        <textarea
          className="w-full px-3 py-2 bg-transparent text-xs focus:outline-none resize-none text-white placeholder-gray-400"
          placeholder="Message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && input.trim()) {
              e.preventDefault();
              onSend(input);
              setInput("");
            }
          }}
          rows={1}
        />
        <div className="flex items-center justify-between px-2 pb-2">
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-gray-600/50 rounded transition-colors" disabled>
              <Paperclip className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-600/50 rounded transition-colors" disabled>
              <Smile className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-600/50 rounded transition-colors" disabled>
              <AtSign className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          <button
            className="p-1 hover:bg-blue-600 rounded transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            onClick={() => {
              if (input.trim()) {
                onSend(input);
                setInput("");
              }
            }}
            disabled={!input.trim()}
          >
            <Send className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
}