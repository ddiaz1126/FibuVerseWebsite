"use client";

import { useState } from "react";

interface Message {
  user: string;
  text: string;
}

const helpTopics = [
  "Getting Started",
  "Account Issues",
  "Agent Usage",
  "Workflow Guides",
  "Integrations",
  "Billing Questions",
];

export default function DeveloperHelpPage() {
  const [selectedTopic, setSelectedTopic] = useState(helpTopics[0]);
  const [messages, setMessages] = useState<Message[]>([
    { user: "System", text: `Welcome to the ${helpTopics[0]} discussion.` },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { user: "You", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { user: "Community", text: "This is a placeholder reply." }]);
    }, 500);
  };

  const selectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setMessages([{ user: "System", text: `Welcome to the ${topic} discussion.` }]);
  };
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex h-full text-sm gap-3 p-3 w-full">
        {/* Left inner sidebar */}
        <div className="w-1/6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 flex flex-col gap-3 shadow-lg">
          <input
            type="text"
            placeholder="Search topics..."
            className="p-2 text-xs rounded-lg bg-gray-900/50 border border-gray-700 placeholder-gray-400 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {helpTopics.map((topic) => (
              <button
                key={topic}
                className={`text-left px-2 py-1.5 rounded-lg hover:bg-gray-700/50 transition-all border text-xs ${
                  selectedTopic === topic
                    ? "bg-gray-700 font-semibold border-gray-600 shadow-lg"
                    : "border-transparent"
                }`}
                onClick={() => selectTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Right main content */}
        <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 flex flex-col shadow-lg">
          <h1 className="text-lg font-bold mb-4">{selectedTopic}</h1>

          {/* Messages / discussion */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg max-w-lg break-words text-sm ${
                  msg.user === "You" 
                    ? "bg-blue-600 self-end text-white shadow-lg shadow-blue-500/20" 
                    : "bg-gray-700 self-start text-gray-200 border border-gray-600"
                }`}
              >
                <strong>{msg.user}:</strong> {msg.text}
              </div>
            ))}
          </div>

          {/* Message input */}
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 p-2 text-sm rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Write a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button 
              className="bg-blue-600 px-4 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 text-sm font-medium" 
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
