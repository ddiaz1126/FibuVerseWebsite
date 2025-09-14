"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import { fetchPublicCompositeAgents, runPublicCompositeAgent } from "@/api/public";
import { useSearchParams } from "next/navigation";

interface CompositeAgent {
  id: number;
  name: string;
  description: string;
  requires_auth?: boolean;
  inputs?: Record<string, { type: string; required?: boolean }>;
}

export default function FibuPage() {
  const [agents, setAgents] = useState<CompositeAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<CompositeAgent | null>(null);

  const [authValues, setAuthValues] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const initialAgentId = searchParams.get("agentId");

  // Load agents
  useEffect(() => {
    async function loadAgents() {
      const data = await fetchPublicCompositeAgents();
      setAgents(data);
      setLoadingAgents(false);

      if (initialAgentId) {
        const agent = data.find(a => a.id === parseInt(initialAgentId));
        if (agent) handleSelectAgent(agent);
      }
    }
    loadAgents();
  }, [initialAgentId]);

  // Select agent and initialize auth inputs
  const handleSelectAgent = (agent: CompositeAgent) => {
    setSelectedAgent(agent);
    setMessages([]);
    setAuthenticated(false);

    if (agent.requires_auth && agent.inputs) {
      const initialAuth: Record<string, string> = {};
      Object.keys(agent.inputs).forEach((key) => {
        initialAuth[key] = "";
      });
      setAuthValues(initialAuth);
    } else {
      setAuthValues({});
      setAuthenticated(true); // no auth needed
    }
  };

  // Handle auth workflow
  const startAuthWorkflow = async () => {
    if (!selectedAgent) return;

    try {
      // Call your new helper to run the public composite agent
      const data = await runPublicCompositeAgent(selectedAgent.id, authValues);

      console.log("Workflow run result:", data);

      // If successful, mark as authenticated
      setAuthenticated(true);

      setMessages((prev) => [
        ...prev,
        { user: selectedAgent.name, text: "Authentication successful! You can now chat." },
      ]);

    } catch (err) {
      console.error("Authentication failed:", err);
      setMessages((prev) => [
        ...prev,
        { user: selectedAgent.name, text: "Authentication failed. Check your inputs." },
      ]);
    }
  };

  // Send chat message
  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent || !authenticated) return;

    setMessages([...messages, { user: "You", text: input }]);
    const messageToSend = input;
    setInput("");

    // Send message to agent workflow API
    try {
      const res = await fetch(`/api/send-message/${selectedAgent.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { user: selectedAgent.name, text: data.reply || "No response." },
      ]);
    } catch (err) {
      console.error("Agent response failed:", err);
      setMessages((prev) => [
        ...prev,
        { user: selectedAgent.name, text: "Failed to get response from agent." },
      ]);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <Header logoSrc="/images/logo.png" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-gray-900 z-40 p-6 shadow-lg overflow-y-auto">
          <h2 className="text-gray-300 text-sm font-semibold uppercase tracking-wide mb-4">
            Agents
          </h2>

          {loadingAgents ? (
            <p className="text-gray-500 text-sm">Loading agents...</p>
          ) : (
            <nav className="flex flex-col gap-3 text-white">
              {agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent)}
                  className={`text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition ${
                    selectedAgent?.id === agent.id ? "bg-gray-700" : ""
                  }`}
                >
                  {agent.name}
                </button>
              ))}
            </nav>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-auto">
        <main className="flex-1 flex flex-col justify-center items-center p-6 overflow-auto">
          {selectedAgent && selectedAgent.requires_auth && !authenticated && (
            <div className="flex flex-col gap-2 w-full max-w-md">
              <h3 className="text-gray-300 font-semibold">Authentication</h3>
              {Object.entries(selectedAgent.inputs || {}).map(([key, meta]) => (
                <input
                  key={key}
                  type={key.toLowerCase().includes("password") ? "password" : "text"}
                  placeholder={key}
                  value={authValues[key] || ""}
                  onChange={(e) =>
                    setAuthValues(prev => ({ ...prev, [key]: e.target.value }))
                  }
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500"
                  required={meta.required}
                />
              ))}
              <button
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 mt-2"
                onClick={startAuthWorkflow}
              >
                Sign In
              </button>
            </div>
          )}

          {selectedAgent && authenticated && (
            <div className="flex flex-col w-full max-w-3xl gap-4">
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

              <div className="flex w-full gap-2 mt-4">
                <input
                  type="text"
                  className="flex-1 p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500"
                  placeholder={`Message ${selectedAgent.name}...`}
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
            </div>
          )}

          {!selectedAgent && (
            <p className="text-gray-300 text-center">
              Select an agent from the sidebar to start chatting.
            </p>
          )}
        </main>


          {selectedAgent && authenticated && (
            <footer className="p-4 flex justify-center bg-gray-900 border-t border-gray-700">
              <div className="flex w-full max-w-3xl gap-2 mx-auto">
                <input
                  type="text"
                  className="flex-1 p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500"
                  placeholder={`Message ${selectedAgent.name}...`}
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
          )}
        </div>
      </div>
    </div>
  );
}
