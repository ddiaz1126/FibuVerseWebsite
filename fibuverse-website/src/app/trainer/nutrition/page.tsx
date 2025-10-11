"use client";

import { useState } from "react";
// import {
//   addDays,
//   format,
//   startOfMonth,
//   endOfMonth,
//   startOfWeek,
//   endOfWeek,
//   eachDayOfInterval,
//   isSameDay,
//   isSameMonth,
// } from "date-fns";
import NutritionPlanBuilder from "@/components/nutrition/NutritionPlanBuilder"

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
  // const [currentMonth,] = useState(new Date());

  // const monthStart = startOfMonth(currentMonth);
  // const monthEnd = endOfMonth(monthStart);
  // const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  // const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  // const days = eachDayOfInterval({ start: startDate, end: endDate });

  // const prevMonth = () =>
  //   setCurrentMonth(addDays(monthStart, -1 * monthStart.getDate()));
  // const nextMonth = () => setCurrentMonth(addDays(monthEnd, 1));

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex h-full text-sm gap-3 p-3 w-full">
        {/* Left inner sidebar */}
        <div className="w-1/6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 flex flex-col gap-2 shadow-lg">
          <input
            type="text"
            placeholder="Search plans..."
            className="p-1.5 rounded-lg bg-gray-900/50 border border-gray-700 placeholder-gray-400 text-white text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex-1 overflow-y-auto space-y-1">
            {plans
              .filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-gray-700/50 transition-all border text-xs ${
                    selectedPlan?.id === plan.id
                      ? "bg-gray-700 font-semibold border-gray-600 shadow-lg"
                      : "border-transparent"
                  }`}
                >
                  {plan.name}
                </button>
              ))}
          </div>
        </div>

        {/* Right section */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Top: Calendar + Plan metadata */}
          <NutritionPlanBuilder/>
        </div>
      </div>
    </div>
  );
}