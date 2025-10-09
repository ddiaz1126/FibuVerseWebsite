"use client";

import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
interface CaloriesPerWeek {
  week: string; // ISO date string
  total_calories: number;
}

interface AvgMacrosPerWeek {
  week: string; // ISO date string
  avg_protein: number;
  avg_carbs: number;
  avg_fat: number;
}

interface CaloriesPerMealType {
  meal_type: string;
  total_calories: number;
}

interface NutritionMetadata {
  calories_per_week: CaloriesPerWeek[];
  avg_macros_per_week: AvgMacrosPerWeek[];
  calories_per_meal_type: CaloriesPerMealType[];
  total_entries: number;
}
interface NutritionAnalysisTabProps {
  nutritionMeta: NutritionMetadata; // replace 'any' with proper typing if available
}

export default function NutritionAnalysisTab({ nutritionMeta }: NutritionAnalysisTabProps) {
  const [activeMetric, setActiveMetric] = useState<
    | "calories_per_week"
    | "avg_macros_per_week"
    | "total_entries"
  >("calories_per_week");

  const colors = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
  ];

  if (!nutritionMeta) return <p>Loading nutrition analysis...</p>;

  const metrics = ["calories_per_week", "avg_macros_per_week", "total_entries"] as const;

  const renderChart = () => {
    switch (activeMetric) {
      case "calories_per_week":
        return (
          <Bar
            data={{
              labels: nutritionMeta.calories_per_week.map((w: CaloriesPerWeek) =>
                new Date(w.week).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Calories per Week",
                  data: nutritionMeta.calories_per_week.map((w: CaloriesPerWeek) => w.total_calories),
                  backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
              ],
            }}
          />
        );

      case "avg_macros_per_week":
        return (
          <Line
              data={{
                labels: nutritionMeta.avg_macros_per_week.map((w: AvgMacrosPerWeek) =>
                  new Date(w.week).toLocaleDateString()
                ),
                datasets: [
                  {
                    label: "Protein (g)",
                    data: nutritionMeta.avg_macros_per_week.map((w: AvgMacrosPerWeek) => w.avg_protein),
                    borderColor: colors[0],
                    backgroundColor: colors[0],
                  },
                  {
                    label: "Carbs (g)",
                    data: nutritionMeta.avg_macros_per_week.map((w: AvgMacrosPerWeek) => w.avg_carbs),
                    borderColor: colors[1],
                    backgroundColor: colors[1],
                  },
                  {
                    label: "Fat (g)",
                    data: nutritionMeta.avg_macros_per_week.map((w: AvgMacrosPerWeek) => w.avg_fat),
                    borderColor: colors[2],
                    backgroundColor: colors[2],
                  },
                ],
              }}
          />
        );

    case "total_entries":
    return (
        <Bar
        data={{
            labels: Array.isArray(nutritionMeta.total_entries)
            ? nutritionMeta.total_entries.map((_, i) => `Entry ${i + 1}`)
            : [],
            datasets: [
            {
                label: "Entries",
                data: Array.isArray(nutritionMeta.total_entries)
                ? nutritionMeta.total_entries.map(() => 1) // 1 per entry
                : [],
                backgroundColor: colors,
            },
            ],
        }}
        />
    );

    }
  };

  return (
<div className="p-4 space-y-4">
      {/* Overview Section */}
      <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Nutrition Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <p className="text-[9px] text-gray-400 mb-1">Total Entries</p>
            <p className="text-xl font-bold text-green-400">
              {nutritionMeta.total_entries}
            </p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <p className="text-[9px] text-gray-400 mb-1">Avg Calories / Week</p>
            <p className="text-xl font-bold text-blue-400">
              {Math.round(
                nutritionMeta.calories_per_week.reduce((sum, week) => sum + week.total_calories, 0) /
                  (nutritionMeta.calories_per_week.length || 1)
              )} <span className="text-xs">kcal</span>
            </p>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
          <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Nutrition Metrics
        </h2>
        <div className="flex gap-1 mb-3 flex-wrap bg-gray-900/50 p-1 rounded-lg border border-gray-700">
            {metrics.map((metric) => (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all duration-200 ${
                  activeMetric === metric
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {metric.replace(/_/g, " ").toUpperCase()}
              </button>
            ))}
        </div>

        <div className="bg-gray-900/50 p-1 rounded-lg border border-gray-700 h-[300px]">{renderChart()}</div>
      </section>
    </div>
  );
}
