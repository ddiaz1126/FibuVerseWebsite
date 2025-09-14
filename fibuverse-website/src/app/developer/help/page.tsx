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
    <div className="flex h-full">
      {/* Left inner sidebar */}
      <div className="w-1/4 border-r border-gray-700 bg-gray-800 p-4 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Search topics..."
          className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
        />
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {helpTopics.map((topic) => (
            <button
              key={topic}
              className={`text-left px-3 py-2 rounded hover:bg-gray-700 transition ${
                selectedTopic === topic ? "bg-gray-700 font-semibold" : ""
              }`}
              onClick={() => selectTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Right main content */}
      <div className="flex-1 flex flex-col p-6 bg-gray-900">
        <h1 className="text-2xl font-bold mb-4">{selectedTopic}</h1>

        {/* Messages / discussion */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded max-w-lg break-words ${
                msg.user === "You" ? "bg-green-600 self-end text-white" : "bg-gray-700 self-start text-gray-200"
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
            className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
            placeholder="Write a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="bg-green-600 px-4 rounded hover:bg-green-700" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
