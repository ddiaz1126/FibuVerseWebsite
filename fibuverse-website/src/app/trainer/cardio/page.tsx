"use client";

import { useState } from "react";

interface CardioItem {
  id: number;
  name: string;
  type: "single" | "program";
  children?: CardioItem[];
}
import RunBuilderPage from "@/components/cardio/RunBuilder"

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
  // const [currentMonth, ] = useState(new Date());
  // const monthStart = startOfMonth(currentMonth);
  // const monthEnd = endOfMonth(monthStart);
  // const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  // const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  // const days = eachDayOfInterval({ start: startDate, end: endDate });
  // const prevMonth = () => setCurrentMonth(addDays(monthStart, -1 * monthStart.getDate()));
  // const nextMonth = () => setCurrentMonth(addDays(monthEnd, 1));

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
        <RunBuilderPage/>
      </div>
    </div>
  );
}