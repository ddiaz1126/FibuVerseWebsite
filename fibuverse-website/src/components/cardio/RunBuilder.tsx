import React, { useState } from 'react';

type RunType = 
  | "Pace"
  | "Time-Based"
  | "Heart Rate"
  | "Interval"
  | "Fartlek"
  | "Progressive"
  | "Lactate Threshold"
  | "Long Slow Distance"
  | "Hill Sprints"
  | "Race";

interface Interval {
  id: number;
  type: string;
  duration: string;
  distance: string;
  intensity: string;
  pace?: string;
  heartRate?: string;
  incline?: string;
  notes: string;
}

export default function RunBuilderPage() {
  const [runName, setRunName] = useState("");
  const [runType, setRunType] = useState<RunType>("Time-Based");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  
  const [intervals, setIntervals] = useState<Interval[]>([
    { id: 1, type: "warmup", duration: "5", distance: "", intensity: "easy", notes: "" },
    { id: 2, type: "work", duration: "10", distance: "", intensity: "tempo", notes: "" },
    { id: 3, type: "cooldown", duration: "5", distance: "", intensity: "easy", notes: "" },
  ]);

  const runTypes: RunType[] = [
    "Pace",
    "Time-Based",
    "Heart Rate",
    "Interval",
    "Fartlek",
    "Progressive",
    "Lactate Threshold",
    "Long Slow Distance",
    "Hill Sprints",
    "Race",
  ];

  const addInterval = () => {
    setIntervals([
      ...intervals,
      { id: Date.now(), type: "work", duration: "5", distance: "", intensity: "tempo", notes: "" },
    ]);
  };

  const removeInterval = (id: number) => {
    setIntervals(intervals.filter((i) => i.id !== id));
  };

  const updateInterval = (id: number, field: keyof Interval, value: string) => {
    setIntervals(
      intervals.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const duplicateInterval = (id: number) => {
    const intervalToDupe = intervals.find((i) => i.id === id);
    if (intervalToDupe) {
      const newInterval = { ...intervalToDupe, id: Date.now() };
      const index = intervals.findIndex((i) => i.id === id);
      const newIntervals = [...intervals];
      newIntervals.splice(index + 1, 0, newInterval);
      setIntervals(newIntervals);
    }
  };

  const moveInterval = (id: number, direction: "up" | "down") => {
    const index = intervals.findIndex((i) => i.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === intervals.length - 1)
    ) {
      return;
    }

    const newIntervals = [...intervals];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newIntervals[index], newIntervals[targetIndex]] = [
      newIntervals[targetIndex],
      newIntervals[index],
    ];
    setIntervals(newIntervals);
  };

  const getTotalDuration = () => {
    return intervals.reduce((sum, i) => sum + (parseFloat(i.duration) || 0), 0);
  };

  const getTotalDistance = () => {
    return intervals.reduce((sum, i) => sum + (parseFloat(i.distance) || 0), 0);
  };

  // Dynamic fields based on run type
  const showPaceField = ["Pace", "Progressive", "Race"].includes(runType);
  const showHeartRateField = ["Heart Rate", "Lactate Threshold"].includes(runType);
  const showInclineField = ["Hill Sprints"].includes(runType);
  const showIntensityField = !["Pace", "Heart Rate"].includes(runType);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Run Builder</h1>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
                Save as Template
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                Save Run
              </button>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Create a structured running workout with custom intervals and targets</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Left Column - Run Details */}
          <div className="col-span-1 space-y-4 overflow-y-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Run Details</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Run Name</label>
                  <input
                    type="text"
                    value={runName}
                    onChange={(e) => setRunName(e.target.value)}
                    placeholder="e.g., Morning Tempo Run"
                    className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Run Type</label>
                  <select
                    value={runType}
                    onChange={(e) => setRunType(e.target.value as RunType)}
                    className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {runTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Target Date (Optional)</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add notes about this run..."
                    rows={4}
                    className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-blue-400 mb-3">Run Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Duration:</span>
                  <span className="text-white font-medium">{getTotalDuration()} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Distance:</span>
                  <span className="text-white font-medium">
                    {getTotalDistance() > 0 ? `${getTotalDistance().toFixed(2)} km` : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Intervals:</span>
                  <span className="text-white font-medium">{intervals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Run Type:</span>
                  <span className="text-blue-300 font-medium">{runType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Interval Builder */}
          <div className="col-span-2 overflow-hidden flex flex-col">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold">Interval Structure</h2>
                <button
                  onClick={addInterval}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Interval
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                {intervals.map((interval, index) => (
                  <div key={interval.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                    {/* Interval Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveInterval(interval.id, "up")}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveInterval(interval.id, "down")}
                            disabled={index === intervals.length - 1}
                            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        
                        <span className="text-sm font-semibold text-gray-400 w-8">#{index + 1}</span>
                        
                        <select
                          value={interval.type}
                          onChange={(e) => updateInterval(interval.id, "type", e.target.value)}
                          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium"
                        >
                          <option value="warmup">Warm-up</option>
                          <option value="work">Work</option>
                          <option value="rest">Rest/Recovery</option>
                          <option value="cooldown">Cool-down</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => duplicateInterval(interval.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Duplicate"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeInterval(interval.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Interval Fields */}
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Duration (min)</label>
                        <input
                          type="number"
                          value={interval.duration}
                          onChange={(e) => updateInterval(interval.id, "duration", e.target.value)}
                          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Distance (km)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={interval.distance}
                          onChange={(e) => updateInterval(interval.id, "distance", e.target.value)}
                          placeholder="Optional"
                          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {showPaceField && (
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-1">Pace (min/km)</label>
                          <input
                            type="text"
                            value={interval.pace || ""}
                            onChange={(e) => updateInterval(interval.id, "pace", e.target.value)}
                            placeholder="e.g., 5:30"
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}

                      {showHeartRateField && (
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-1">Heart Rate (bpm)</label>
                          <input
                            type="text"
                            value={interval.heartRate || ""}
                            onChange={(e) => updateInterval(interval.id, "heartRate", e.target.value)}
                            placeholder="e.g., 140-160"
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}

                      {showInclineField && (
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-1">Incline (%)</label>
                          <input
                            type="number"
                            value={interval.incline || ""}
                            onChange={(e) => updateInterval(interval.id, "incline", e.target.value)}
                            placeholder="0-15"
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}

                      {showIntensityField && (
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-1">Intensity</label>
                          <select
                            value={interval.intensity}
                            onChange={(e) => updateInterval(interval.id, "intensity", e.target.value)}
                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                          >
                            <option value="easy">Easy</option>
                            <option value="moderate">Moderate</option>
                            <option value="tempo">Tempo</option>
                            <option value="threshold">Threshold</option>
                            <option value="vo2max">VO2 Max</option>
                            <option value="sprint">Sprint</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Notes/Audio Cue */}
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Notes / Audio Cue</label>
                      <input
                        type="text"
                        value={interval.notes}
                        onChange={(e) => updateInterval(interval.id, "notes", e.target.value)}
                        placeholder="E.g., 'Focus on breathing' or 'Push hard!'"
                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}