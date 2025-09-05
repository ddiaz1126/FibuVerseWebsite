"use client";

import { useState } from "react";
import {
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";

interface Client {
  id: number;
  name: string;
  age: number;
  height: number;
  weight: number;
}

export default function ClientsPage() {
  const clients: Client[] = [
    { id: 1, name: "Alice", age: 28, height: 170, weight: 65 },
    { id: 2, name: "Bob", age: 32, height: 180, weight: 80 },
    { id: 3, name: "Charlie", age: 25, height: 165, weight: 60 },
  ];

  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0]);
  const [activeTab, setActiveTab] = useState<"Analysis" | "History" | "Programs">("Analysis");

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(addDays(monthStart, -1 * monthStart.getDate()));
  const nextMonth = () => setCurrentMonth(addDays(monthEnd, 1));

  return (
    <div className="flex h-full min-h-screen bg-gray-900 text-white">
      {/* Left sidebar */}
      <div className="w-1/5 border-r border-gray-700 p-4 flex flex-col">
        <input
          type="text"
          placeholder="Search clients..."
          className="p-2 rounded bg-gray-800 mb-4 placeholder-gray-400 text-white"
        />
        <div className="flex-1 overflow-y-auto">
          {clients.map(client => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`w-full text-left px-3 py-2 rounded mb-1 hover:bg-gray-700 transition ${
                selectedClient?.id === client.id ? "bg-gray-700" : ""
              }`}
            >
              {client.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* Top section split: Client details + Calendar */}
        <div className="flex gap-4">
          {/* Client details */}
          <div className="w-1/3 bg-gray-800 p-4 rounded shadow flex flex-col gap-2">
            <h2 className="font-semibold text-lg mb-2">Client Details</h2>
            {selectedClient && (
              <>
                <p><strong>Name:</strong> {selectedClient.name}</p>
                <p><strong>Age:</strong> {selectedClient.age}</p>
                <p><strong>Height:</strong> {selectedClient.height} cm</p>
                <p><strong>Weight:</strong> {selectedClient.weight} kg</p>
              </>
            )}
          </div>

          {/* Calendar */}
          <div className="flex-1 bg-gray-800 p-4 rounded shadow">
            <div className="flex justify-between items-center mb-2">
              <button onClick={prevMonth} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
                Prev
              </button>
              <div className="font-semibold text-lg">{format(currentMonth, "MMMM yyyy")}</div>
              <button onClick={nextMonth} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
                Next
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="font-semibold">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {days.map(day => (
                <div
                  key={day.toISOString()}
                  className={`h-16 flex items-center justify-center rounded cursor-pointer transition ${
                    isSameDay(day, new Date()) ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600"
                  } ${!isSameMonth(day, monthStart) ? "text-gray-500" : ""}`}
                >
                  {format(day, "d")}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs below top section */}
        <div className="flex gap-2">
          {["Analysis", "History", "Programs"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto rounded bg-gray-800 p-4">
          {activeTab === "Analysis" && <div>Analysis content here</div>}
          {activeTab === "History" && <div>History content here</div>}
          {activeTab === "Programs" && <div>Programs content here</div>}
        </div>
      </div>
    </div>
  );
}
