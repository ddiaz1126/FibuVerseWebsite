import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Lightbulb } from 'lucide-react';

export default function AgentGoalEditor({ 
  goal, 
  onGoalChange 
}: { 
  goal: string; 
  onGoalChange: (goal: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

  const defaultTemplate = `# 1. Clear Objective / Goal Definition

      ## Purpose
      Define what this agent should accomplish.

      ## Why It Matters
      AI agents are only as useful as the tasks they're designed to solve.

      ## Core Function
      - **Primary Task:** 
      - **Expected Outcomes:** 
      - **Success Criteria:** 

      ## Examples to Consider
      - Customer support bot → answer user queries and escalate when unsure
      - Autonomous research assistant → fetch papers, summarize, suggest experiments
      - Data analyst → process datasets, identify patterns, generate reports

      ## Design Notes
      Start small with one core function; you can expand modularly.

      ---

      ## My Agent's Goal

`;

  const currentGoal = goal || defaultTemplate;

  // Simple markdown preview (basic rendering)
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold mt-4 mb-2 text-white">{line.slice(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-semibold mt-3 mb-2 text-gray-200">{line.slice(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-semibold mt-2 mb-1 text-gray-300">{line.slice(4)}</h3>;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4 text-gray-300">{line.slice(2)}</li>;
      } else if (line.startsWith('---')) {
        return <hr key={i} className="my-4 border-gray-600" />;
      } else if (line.trim() === '') {
        return <br key={i} />;
      } else {
        return <p key={i} className="text-gray-300 mb-1">{line}</p>;
      }
    });
  };

  return (
<div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg mb-3 shadow-lg">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700/50 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          <h2 className="text-sm font-semibold text-white">1. Agent Goal & Design Document</h2>
        </div>
        <button type="button" className="text-gray-400 hover:text-white">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-700">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Edit
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Content Area */}
          <div className="p-3">
            {activeTab === 'edit' ? (
              <div>
                <div className="mb-2 text-[10px] text-gray-400">
                  Use this space to brainstorm and document your agent&apos;s purpose. Supports markdown formatting.
                </div>
                <textarea
                  value={currentGoal}
                  onChange={(e) => onGoalChange(e.target.value)}
                  className="w-full h-64 p-2 rounded-lg bg-gray-900/50 border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-200 font-mono text-xs resize-y"
                  placeholder="Define your agent's goal and purpose..."
                />
                <div className="mt-2 text-[10px] text-gray-500">
                  💡 Tip: Start with a clear primary task, then expand with specific examples and success criteria.
                </div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none bg-gray-900/50 p-3 rounded-lg border border-gray-700 h-64 overflow-y-auto text-xs">
                {renderMarkdown(currentGoal)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}