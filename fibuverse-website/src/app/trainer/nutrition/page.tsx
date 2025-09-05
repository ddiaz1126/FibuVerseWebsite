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

interface NutritionPlan {
  id: number;
  name: string;
}

export default function NutritionPage() {
  const plans: NutritionPlan[] = [
    { id: 1, name: "Cutting Plan" },
    { id: 2, name: "Maintenance Plan" },
    { id: 3, name: "Bulking Plan" },
  ];

  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(plans[0]);
  const [search, setSearch] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () =>
    setCurrentMonth(addDays(monthStart, -1 * monthStart.getDate()));
  const nextMonth = () => setCurrentMonth(addDays(monthEnd, 1));

  return (
    <div className="flex h-full min-h-screen bg-gray-900 text-white">
      {/* Left inner sidebar */}
      <div className="w-1/4 border-r border-gray-700 p-4 flex flex-col">
        <input
          type="text"
          placeholder="Search plans..."
          className="p-2 rounded bg-gray-800 mb-4 placeholder-gray-400 text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex-1 overflow-y-auto">
          {plans
            .filter((p) =>
              p.name.toLowerCase().includes(search.toLowerCase())
            )
            .map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`w-full text-left px-3 py-2 rounded mb-1 hover:bg-gray-700 transition ${
                  selectedPlan?.id === plan.id ? "bg-gray-700" : ""
                }`}
              >
                {plan.name}
              </button>
            ))}
        </div>
      </div>

      {/* Right section */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* Top: Calendar + Plan metadata */}
        <div className="flex gap-4">
          {/* Plan metadata */}
          <div className="flex-1 bg-gray-800 p-4 rounded shadow flex flex-col gap-2">
            <div className="text-lg font-semibold">
              {selectedPlan?.name || "Select a plan"}
            </div>
            <label>
              Plan Date:
              <input type="date" className="mt-1 p-2 rounded bg-gray-700 w-full" />
            </label>
            <label>
              Total Calories:
              <input type="number" className="mt-1 p-2 rounded bg-gray-700 w-full" />
            </label>
            <label>
              Protein (g):
              <input type="number" className="mt-1 p-2 rounded bg-gray-700 w-full" />
            </label>
            <label>
              Carbs (g):
              <input type="number" className="mt-1 p-2 rounded bg-gray-700 w-full" />
            </label>
            <label>
              Fat (g):
              <input type="number" className="mt-1 p-2 rounded bg-gray-700 w-full" />
            </label>
            <label>
              Notes:
              <textarea className="mt-1 p-2 rounded bg-gray-700 w-full" rows={3} />
            </label>
          </div>

          {/* Calendar */}
          <div className="w-1/3 bg-gray-800 p-4 rounded shadow">
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={prevMonth}
                className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                Prev
              </button>
              <div className="font-semibold text-lg">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <button
                onClick={nextMonth}
                className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                Next
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="font-semibold">
                  {d}
                </div>
              ))}
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`h-16 flex items-center justify-center rounded cursor-pointer transition ${
                    isSameDay(day, new Date())
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600"
                  } ${!isSameMonth(day, monthStart) ? "text-gray-500" : ""}`}
                >
                  {format(day, "d")}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Nutrition Plan Editor */}
        <div className="flex-1 bg-gray-800 p-4 rounded shadow">
          <div className="text-lg font-semibold mb-2">Plan Editor</div>
          <div className="flex flex-col gap-2">
            <label>
              Meal Name:
              <input
                type="text"
                className="mt-1 p-2 rounded bg-gray-700 w-full"
              />
            </label>
            <label>
              Food Items:
              <textarea
                className="mt-1 p-2 rounded bg-gray-700 w-full"
                rows={4}
              />
            </label>
            <label>
              Macros per meal:
              <input
                type="text"
                className="mt-1 p-2 rounded bg-gray-700 w-full"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
