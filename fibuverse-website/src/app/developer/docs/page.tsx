"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchSubAgents } from "@/api/developer";

interface Agent {
  id: number;
  name: string;
  description?: string | Record<string, unknown>;
  inputs?: Record<string, unknown>;
  input_examples?: Array<Record<string, unknown>>;
  outputs?: Record<string, unknown>;
  output_examples?: Array<Record<string, unknown>>;
}

const workflows = ["Workout Generator", "Cardio Tracker"];

export default function DeveloperDocsView() {
  const router = useRouter();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"Workflows" | "Agents">("Workflows");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  useEffect(() => {
    setSearch("");

    if (tab === "Workflows") {
      setSelectedAgent({ id: -1, name: workflows[0] });
      return;
    }

    const loadAgents = async () => {
      const tokenToUse = localStorage.getItem("access_token");
      if (!tokenToUse) {
        router.push("/developer/login");
        return;
      }

      try {
        setLoadingAgents(true);
        const fetched = await fetchSubAgents();

        const normalized: Agent[] = (fetched ?? []).map((a: unknown) => {
          const agent = a as Partial<Agent>;
          return {
            id: agent.id ?? 0,
            name: agent.name ?? "Unknown",
            description: agent.description ?? "",
            inputs: agent.inputs ?? {},
            input_examples: agent.input_examples ?? [],
            outputs: agent.outputs ?? {},
            output_examples: agent.output_examples ?? [],
          };
        });

        setAgents(normalized);
        setSelectedAgent(normalized.length ? normalized[0] : null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Failed to fetch subagents:", err.message);
          if (err.message.toLowerCase().includes("401")) {
            router.push("/developer/login");
          }
        } else {
          console.error("Failed to fetch subagents (non-error):", err);
        }

        setAgents([]);
        setSelectedAgent(null);
      } finally {
        setLoadingAgents(false);
      }
    };

    loadAgents();
  }, [tab, router]);

  const workflowObjects: Agent[] = workflows.map((name, i) => ({ id: -1 - i, name }));
  const currentList: Agent[] = tab === "Workflows" ? workflowObjects : agents;
  const filteredList = currentList.filter((agent) =>
    agent.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderValue = (value: unknown, fallback = "—") => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-gray-400">{fallback}</span>;
    }

    if (typeof value === "string") {
      return <span className="text-gray-300 whitespace-pre-wrap">{value}</span>;
    }

    if (Array.isArray(value)) {
      return (
        <ul className="list-disc ml-5 text-gray-300">
          {value.map((it, i) => (
            <li key={i} className="break-words">
              {typeof it === "object" && it !== null ? (
                <pre className="text-sm bg-gray-800 p-2 rounded">{JSON.stringify(it, null, 2)}</pre>
              ) : (
                String(it)
              )}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <pre className="text-sm bg-gray-800 p-2 rounded text-gray-300">{JSON.stringify(value, null, 2)}</pre>
      );
    }

    return <span className="text-gray-300">{String(value)}</span>;
  };

  return (
    <div className="flex h-full">
      <div className="flex-none w-1/4 md:w-1/5 lg:w-1/6 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 p-3 flex flex-col rounded-xl m-2">
        {/* Tab Buttons */}
        <div className="flex gap-2 mb-3">
          {(["Workflows", "Agents"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 text-[10px] font-semibold rounded-t-lg transition ${
                tab === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-200 hover:bg-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative mb-3 flex-shrink-0">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab.toLowerCase()}...`}
            className="w-full p-2 pl-8 text-xs rounded-lg bg-gray-900/50 border border-gray-700 placeholder-gray-400 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          <svg
            className="w-4 h-4 text-gray-500 absolute left-2.5 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-0 flex flex-col gap-2">
          {loadingAgents && tab === "Agents" ? (
            <div className="text-center text-gray-400 text-xs mt-2 animate-pulse">
              Loading {tab.toLowerCase()}...
            </div>
          ) : filteredList.length ? (
            <div className="divide-y divide-gray-700/30">
              {filteredList.map((item) => (
                <button
                  key={`${item.id}-${item.name}`}
                  onClick={() => setSelectedAgent(item)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-700/30 transition-all truncate rounded-lg ${
                    selectedAgent?.id === item.id
                      ? "bg-gray-700/50 border-l-2 border-l-blue-500 font-semibold"
                      : ""
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mt-2 text-xs text-center">
              No {tab.toLowerCase()} found
            </p>
          )}
        </div>
      </div>
          
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">{selectedAgent?.name || "Select an agent"}</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          {renderValue(selectedAgent?.description, "No description available.")}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Inputs</h2>
          {renderValue(selectedAgent?.inputs, "No inputs described.")}
          {selectedAgent?.input_examples && selectedAgent.input_examples.length > 0 && (
            <div className="mt-2">
              <h3 className="text-lg font-semibold mb-1">Example Inputs</h3>
              {renderValue(selectedAgent.input_examples)}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Outputs</h2>
          {renderValue(selectedAgent?.outputs, "No outputs described.")}
          {selectedAgent?.output_examples && selectedAgent.output_examples.length > 0 && (
            <div className="mt-2">
              <h3 className="text-lg font-semibold mb-1">Example Outputs</h3>
              {renderValue(selectedAgent.output_examples)}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Usage Examples</h2>
          <p className="text-gray-400">Example calls and expected results.</p>
        </div>
      </div>
    </div>
  );
}