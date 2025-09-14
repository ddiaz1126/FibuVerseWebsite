"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchSubAgents } from "@/api/developer";

interface Agent {
  id: number;
  name: string;
  description?: string | Record<string, any> | any[];
  inputs?: Record<string, any> | any[];
  input_examples?: any[];
  outputs?: Record<string, any> | any[];
  output_examples?: any[];
}

const workflows = ["Workout Generator", "Cardio Tracker"];

export default function DeveloperDocsView({ token }: { token?: string }) {
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
      const tokenToUse = token ?? localStorage.getItem("access_token");
      if (!tokenToUse) {
        router.push("/developer/login");
        return;
      }

      try {
        setLoadingAgents(true);
        const fetched = await fetchSubAgents(tokenToUse);

        const normalized: Agent[] = (fetched ?? []).map((a: any) => ({
          id: a.id,
          name: a.name,
          description: a.description ?? "",
          inputs: a.inputs ?? {},
          input_examples: a.input_examples ?? [],
          outputs: a.outputs ?? {},
          output_examples: a.output_examples ?? [],
        }));

        setAgents(normalized);
        setSelectedAgent(normalized.length ? normalized[0] : null);
      } catch (err: any) {
        console.error("Failed to fetch subagents:", err);
        if (String(err?.message || "").toLowerCase().includes("401")) {
          router.push("/developer/login");
        }
        setAgents([]);
        setSelectedAgent(null);
      } finally {
        setLoadingAgents(false);
      }
    };

    loadAgents();
  }, [tab, token, router]);

  const workflowObjects: Agent[] = workflows.map((name, i) => ({ id: -1 - i, name }));
  const currentList: Agent[] = tab === "Workflows" ? workflowObjects : agents;
  const filteredList = currentList.filter((agent) =>
    agent.name.toLowerCase().includes(search.toLowerCase())
  );

  // Render any value nicely, including arrays of objects
  const renderValue = (value: any, fallback = "—") => {
    if (!value || (Array.isArray(value) && value.length === 0)) return <span className="text-gray-400">{fallback}</span>;

    if (typeof value === "string") return <span className="text-gray-300 whitespace-pre-wrap">{value}</span>;

    if (Array.isArray(value)) {
      return (
        <ul className="list-disc ml-5 text-gray-300">
          {value.map((it, i) => (
            <li key={i} className="break-words">
              {typeof it === "object" ? (
                <pre className="text-sm bg-gray-800 p-2 rounded">{JSON.stringify(it, null, 2)}</pre>
              ) : (
                String(it)
              )}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      return (
        <pre className="text-sm bg-gray-800 p-2 rounded text-gray-300">{JSON.stringify(value, null, 2)}</pre>
      );
    }

    return <span className="text-gray-300">{String(value)}</span>;
  };

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <div className="w-1/4 border-r border-gray-700 bg-gray-800 p-4 flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(["Workflows", "Agents"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-t-lg font-semibold transition ${
                tab === t ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-200 hover:bg-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${tab.toLowerCase()}...`}
          className="mb-2 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
        />

        {/* List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {loadingAgents && tab === "Agents" ? (
            <div className="text-gray-400 p-2">Loading agents...</div>
          ) : filteredList.length ? (
            filteredList.map((agent) => (
              <button
                key={`${agent.id}-${agent.name}`}
                className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition ${
                  selectedAgent?.id === agent.id ? "bg-gray-700 font-semibold" : ""
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                {agent.name}
              </button>
            ))
          ) : (
            <p className="text-gray-400 mt-2 text-sm">No {tab.toLowerCase()} found</p>
          )}
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">{selectedAgent?.name || "Select an agent"}</h1>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          {renderValue(selectedAgent?.description, "No description available.")}
        </div>

        {/* Inputs */}
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

        {/* Outputs */}
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

        {/* Usage examples */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Usage Examples</h2>
          <p className="text-gray-400">Example calls and expected results.</p>
        </div>
      </div>
    </div>
  );
}
