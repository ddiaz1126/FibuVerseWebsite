"use client";

import { useState } from "react";

interface Message {
  user: string;
  text: string;
}

const helpTopics = [
  "Getting Started",
  "Account Issues",
  "Workout Tips",
  "Nutrition Guides",
  "Integrations",
  "Billing Questions",
];

export default function HelpPage() {
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
        <div className="w-1/6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
        {/* Search */}
        <input
          type="text"
          placeholder="Search topics..."
          className="p-2 rounded-lg bg-gray-900/50 border border-gray-700 placeholder-gray-400 text-white focus:outline-none focus:border-blue-500/50 transition-colors text-xs"
          value={input} // keep your existing value
          onChange={(e) => setInput(e.target.value)} // keep your existing handler
        />

        {/* Topics */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {helpTopics.map((topic) => (
            <button
              key={topic}
              className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-gray-700/50 transition-all border text-xs ${
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
      <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 overflow-auto shadow-lg flex flex-col gap-3">
        <h1 className="text-lg font-bold mb-3">{selectedTopic}</h1>

        {/* Messages / discussion */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded max-w-lg break-words ${
                msg.user === "You"
                  ? "bg-blue-600 self-end text-white shadow-lg"
                  : "bg-gray-700 self-start text-gray-200 shadow-sm"
              }`}
            >
              <strong>{msg.user}:</strong> {msg.text}
            </div>
          ))}
        </div>

        {/* Message input */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            className="flex-1 p-2 rounded-lg bg-gray-900/50 border border-gray-700 placeholder-gray-400 text-white focus:outline-none focus:border-blue-500/50 transition-colors text-xs"
            placeholder="Write a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 px-3 py-1.5 rounded-lg shadow-lg transition-all text-xs"
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
