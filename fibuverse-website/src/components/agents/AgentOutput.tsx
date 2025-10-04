interface AgentOutputProps {
  output: unknown;
  loading: boolean;
}

type OutputObject = Record<string, unknown>;

export function AgentOutput({ output, loading }: AgentOutputProps) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Output</h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Processing...</span>
        </div>
      </div>
    );
  }

  if (!output || (typeof output === "object" && Object.keys(output as OutputObject).length === 0)) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Output</h3>
        <p className="text-gray-500 text-center py-12">
          Run the agent to see output here
        </p>
      </div>
    );
  }

  if (typeof output === "object" && output !== null) {
    const keys = Object.keys(output as OutputObject);
    const lastKey = keys[keys.length - 1];
    const value = (output as OutputObject)[lastKey];

    // ✅ Render "text" property nicely if it exists
    if (typeof value === "object" && value !== null && "text" in value && typeof value.text === "string") {
      return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Output</h3>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h4 className="text-sm text-gray-400 mb-2">Last Key: {lastKey}</h4>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
              {value.text}
            </pre>
          </div>
        </div>
      );
    }

    // Fallback for other objects
    const displayValue = JSON.stringify(value, null, 2);
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Output</h3>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
          <h4 className="text-sm text-gray-400 mb-2">Last Key: {lastKey}</h4>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
            {displayValue}
          </pre>
        </div>
      </div>
    );
  }

  // fallback for primitives
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Output</h3>
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
          {String(output)}
        </pre>
      </div>
    </div>
  );
}
