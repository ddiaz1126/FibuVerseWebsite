"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";

interface CardioItem {
  id: number;
  name: string;
  type: "single" | "program";
  children?: CardioItem[];
}

export default function CardioPage() {
  const [activeTab, setActiveTab] = useState<"Single" | "Program">("Single");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null);
  const [selectedCardio, setSelectedCardio] = useState<CardioItem | null>(null);

  const cardioItems: CardioItem[] = [
    { id: 1, name: "Morning Run", type: "single" },
    {
      id: 2,
      name: "Interval Program",
      type: "program",
      children: [
        { id: 3, name: "5x400m Intervals", type: "single" },
        { id: 4, name: "10x200m Intervals", type: "single" },
      ],
    },
  ];

  // Calendar
  const [currentMonth, ] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  // const prevMonth = () => setCurrentMonth(addDays(monthStart, -1 * monthStart.getDate()));
  // const nextMonth = () => setCurrentMonth(addDays(monthEnd, 1));

  // Cardio types
  const cardioTypes = ["Long Distance", "Interval", "Tempo", "Fartlek"];

  return (
    <div className="flex h-full min-h-screen bg-gray-900 text-white p-4 gap-4">
      {/* Left sidebar */}
      <div className="w-1/6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 flex flex-col gap-4 shadow-lg">
        {/* Tabs */}
        <div className="flex gap-2">
          {(["Single", "Program"] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 px-2 py-1 text-xs rounded-lg transition ${
                activeTab === tab
                  ? "bg-blue-600 font-semibold shadow-md"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder={`Search ${activeTab.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 text-xs rounded-lg bg-gray-900/50 border border-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
        />

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {cardioItems
            .filter(
              (item) =>
                item.type.toLowerCase() === activeTab.toLowerCase() &&
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((item) => (
              <div key={item.id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    selectedCardio?.id === item.id
                      ? "bg-gray-700 shadow-md"
                      : "hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedCardio(item);
                    if (item.type.toUpperCase() === "PROGRAM")
                      setExpandedProgram(item.id === expandedProgram ? null : item.id);
                  }}
                >
                  {item.name}
                </button>

                {/* Children if program expanded */}
                {item.children && expandedProgram === item.id && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((run) => (
                      <button
                        key={run.id}
                        className={`w-full text-left px-2 py-1 rounded-lg text-xs transition ${
                          selectedCardio?.id === run.id ? "bg-gray-700 shadow-md" : "hover:bg-gray-700"
                        }`}
                        onClick={() => setSelectedCardio(run)}
                      >
                        {run.name}
                      </button>
                    ))}
                    <button className="w-full text-left px-2 py-1 rounded-lg text-xs bg-green-600 hover:bg-green-700 transition">
                      + Add Run
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Top: Metadata + Calendar */}
        <div className="flex gap-4">
          {/* Metadata */}
          <div className="w-96 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg flex flex-col gap-3">
            <label className="text-xs">Cardio Date</label>
            <input type="date" className="p-2 rounded-lg bg-gray-900/50 border border-gray-700 text-xs" />

            <label className="text-xs">Cardio Type</label>
            <select className="p-2 rounded-lg bg-gray-900/50 border border-gray-700 text-xs">
              {cardioTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <label className="text-xs">Notes</label>
            <textarea className="p-2 rounded-lg bg-gray-900/50 border border-gray-700 text-xs flex-1" rows={4}></textarea>
          </div>

          {/* Calendar */}
          <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <button className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">Prev</button>
              <div className="font-semibold text-sm">{format(currentMonth, "MMMM yyyy")}</div>
              <button className="px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600">Next</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="font-semibold">{d}</div>
              ))}
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`h-16 flex items-center justify-center rounded-lg cursor-pointer transition ${
                    isSameDay(day, new Date())
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-700 hover:bg-gray-600"
                  } ${!isSameMonth(day, monthStart) ? "text-gray-500" : ""}`}
                >
                  {format(day, "d")}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Cardio editor */}
        <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg flex flex-col gap-2">
          <label className="text-xs">Run Name</label>
          <input type="text" className="p-2 rounded-lg bg-gray-900/50 border border-gray-700 text-xs" />

          <label className="text-xs">Main Metrics</label>
          <div className="flex gap-2">
            <input type="number" placeholder="Distance (km)" className="p-2 rounded-lg bg-gray-900/50 border border-gray-700 text-xs flex-1" />
            <input type="number" placeholder="Duration (min)" className="p-2 rounded-lg bg-gray-900/50 border border-gray-700 text-xs flex-1" />
            <input type="number" placeholder="Avg HR" className="p-2 rounded-lg bg-gray-900/50 border border-gray-700 text-xs flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}