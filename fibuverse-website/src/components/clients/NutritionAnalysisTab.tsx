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
    <div className="p-4 space-y-6">
      {/* Overview Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🍎 Nutrition Overview</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            Total Entries: {nutritionMeta.total_entries}
          </button>
            <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
              Avg Calories per Week:{" "}
              {Math.round(
                nutritionMeta.calories_per_week.reduce((sum, week) => sum + week.total_calories, 0) /
                  (nutritionMeta.calories_per_week.length || 1)
              )}
            </button>
        </div>
      </section>

      {/* Metrics Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🥗 Nutrition Metrics</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
            {metrics.map((metric) => (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`px-3 py-1 rounded ${
                  activeMetric === metric
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {metric.replace(/_/g, " ").toUpperCase()}
              </button>
            ))}
        </div>

        <div className="bg-gray-900 p-4 rounded shadow">{renderChart()}</div>
      </section>
    </div>
  );
}
