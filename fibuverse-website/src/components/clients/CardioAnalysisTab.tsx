"use client";

import { useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
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

interface CardioAnalysisTabProps {
  clientId: number;
  cardioMeta: any; // high-level summaries (runs per week, avg pace, etc.)
  cardioSessionInsights: any; // per-run/session details
}

export default function CardioAnalysisTab({
  clientId,
  cardioMeta,
  cardioSessionInsights,
}: CardioAnalysisTabProps) {
  const [activeMetric, setActiveMetric] = useState<
    | "sessions_per_week"
    | "distance_per_week"
    | "avg_pace_per_week"
    | "cardio_types"
  >("sessions_per_week");

  const [activeSessionMetric, setActiveSessionMetric] = useState<
    | "avg_speed_over_time"
    | "avg_pace_over_time"
    | "avg_heart_rate_over_time"
    | "avg_altitude_over_time"
  >("avg_speed_over_time");

  if (!cardioMeta) return <p>Loading analysis...</p>;

  // ----------------- Chart Renderers -----------------
  const renderChart = () => {
    switch (activeMetric) {
      case "sessions_per_week":
        return (
          <Bar
            data={{
              labels: cardioMeta.sessions_per_week.map((r) =>
                new Date(r.week).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Runs per Week",
                  data: cardioMeta.sessions_per_week.map((r) => r.total),
                  backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
              ],
            }}
          />
        );

      case "distance_per_week":
        return (
          <Line
            data={{
              labels: cardioMeta.distance_per_week.map((m) =>
                new Date(m.month).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Avg Distance (km)",
                  data: cardioMeta.distance_per_week.map((m) => m.distance_per_week),
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                },
              ],
            }}
          />
        );

      case "avg_pace_per_week":
        return (
          <Line
            data={{
              labels: cardioMeta.avg_pace_per_week.map((m) =>
                new Date(m.month).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Avg Pace (min/km)",
                  data: cardioMeta.avg_pace_per_week.map((m) => m.avg_pace_per_week),
                  borderColor: "rgba(255, 99, 132, 1)",
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                },
              ],
            }}
          />
        );

      case "cardio_types":
        return (
          <Pie
            data={{
              labels: Object.keys(cardioMeta.cardio_types),
              datasets: [
                {
                  label: "Terrain Distribution",
                  data: Object.values(cardioMeta.cardio_types),
                  backgroundColor: [
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                  ],
                },
              ],
            }}
          />
        );

    }
  };

  const renderSessionChart = () => {
    switch (activeSessionMetric) {
      case "avg_speed_over_time":
        return (
          <Line
            data={{
              labels: cardioSessionInsights.avg_speed_over_time.map((d) =>
                new Date(d.date).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Distance (km)",
                  data: cardioSessionInsights.avg_speed_over_time.map(
                    (d) => d.distance
                  ),
                  borderColor: "rgba(54, 162, 235, 1)",
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                },
              ],
            }}
          />
        );

      case "avg_pace_over_time":
        return (
          <Line
            data={{
              labels: cardioSessionInsights.avg_pace_over_time.map((d) =>
                new Date(d.date).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Pace (min/km)",
                  data: cardioSessionInsights.avg_pace_over_time.map(
                    (d) => d.pace
                  ),
                  borderColor: "rgba(255, 99, 132, 1)",
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                },
              ],
            }}
          />
        );

      case "avg_heart_rate_over_time":
        return (
          <Line
            data={{
              labels: cardioSessionInsights.avg_heart_rate_over_time.map((d) =>
                new Date(d.date).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Avg Heart Rate (bpm)",
                  data: cardioSessionInsights.avg_heart_rate_over_time.map(
                    (d) => d.avg_hr
                  ),
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                },
              ],
            }}
          />
        );

      case "avg_altitude_over_time":
        return (
          <Bar
            data={{
              labels: cardioSessionInsights.avg_altitude_over_time.map((d) =>
                new Date(d.date).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Calories Burned",
                  data: cardioSessionInsights.avg_altitude_over_time.map(
                    (d) => d.calories
                  ),
                  backgroundColor: "rgba(255, 159, 64, 0.6)",
                },
              ],
            }}
          />
        );
    }
  };

  // ----------------- UI Layout -----------------
  return (
    <div className="p-4 space-y-10">
      {/* ----------------- Overview Section ----------------- */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🏃 Cardio Overview</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            Total Runs: {cardioMeta.sessions_per_week.reduce((s, r) => s + r.total, 0)}
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            Avg Distance:{" "}
            {Math.round(
              cardioMeta.distance_per_week.reduce((s, d) => s + d.distance_per_week, 0) /
                cardioMeta.distance_per_week.length
            )}{" "}
            km
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            Avg Pace:{" "}
            {(
              cardioMeta.avg_pace_per_week.reduce((s, d) => s + d.avg_pace_per_week, 0) /
              cardioMeta.avg_pace_per_week.length
            ).toFixed(2)}{" "}
            min/km
          </button>
        </div>
      </section>

      {/* ----------------- Run Metrics ----------------- */}
      <section>
        <h2 className="text-2xl font-bold mb-4">📈 Run Metrics</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            "sessions_per_week",
            "distance_per_week",
            "avg_pace_per_week",
            "cardio_types",
          ].map((metric) => (
            <button
              key={metric}
              onClick={() =>
                setActiveMetric(
                  metric as
                    | "sessions_per_week"
                    | "distance_per_week"
                    | "avg_pace_per_week"
                    | "cardio_types"
                )
              }
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

      {/* ----------------- Session Metrics ----------------- */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🔥 Session Insights</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            "avg_speed_over_time",
            "avg_pace_over_time",
            "avg_heart_rate_over_time",
            "avg_altitude_over_time",
          ].map((metric) => (
            <button
              key={metric}
              onClick={() =>
                setActiveSessionMetric(
                  metric as
                    | "avg_speed_over_time"
                    | "avg_pace_over_time"
                    | "avg_heart_rate_over_time"
                    | "avg_altitude_over_time"
                )
              }
              className={`px-3 py-1 rounded ${
                activeSessionMetric === metric
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {metric.replace(/_/g, " ").toUpperCase()}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 p-4 rounded shadow">
          {renderSessionChart()}
        </div>
      </section>
    </div>
  );
}
