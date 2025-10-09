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

interface WeekStat {
  week: string; // ISO date string from TruncWeek
  total?: number;             // for sessions_per_week
  total_distance?: number;    // for distance_per_week
  avg_pace?: number;          // for avg_pace_per_week
  avg_hr?: number;            // for avg_hr_per_week
  total_calories?: number;    // for calories_per_week
}

interface CardioTypeStat {
  cardio_type: string;
  count: number;
}

interface CardioMetadata {
  sessions_per_week: WeekStat[];
  distance_per_week: WeekStat[];
  avg_pace_per_week: WeekStat[];
  avg_hr_per_week: WeekStat[];
  calories_per_week: WeekStat[];
  cardio_types: CardioTypeStat[];
}
interface CardioSessionPoint {
  cardio__cardio_name: string;
  bucket_start: string;       // ISO datetime
  avg_heart_rate?: number;
  avg_pace?: number;
  avg_speed?: number;
  avg_altitude?: number;
  avg_latitude?: number;
  avg_longitude?: number;
  points_count?: number;
}

interface CardioSessionInsights {
  avg_heart_rate_over_time: Array<Pick<CardioSessionPoint, "cardio__cardio_name" | "bucket_start" | "avg_heart_rate">>;
  avg_pace_over_time: Array<Pick<CardioSessionPoint, "cardio__cardio_name" | "bucket_start" | "avg_pace">>;
  avg_speed_over_time: Array<Pick<CardioSessionPoint, "cardio__cardio_name" | "bucket_start" | "avg_speed">>;
  avg_altitude_over_time: Array<Pick<CardioSessionPoint, "cardio__cardio_name" | "bucket_start" | "avg_altitude">>;
  location_points: Array<Pick<CardioSessionPoint, "cardio__cardio_name" | "bucket_start" | "avg_latitude" | "avg_longitude">>;
  points_count_over_time: Array<Pick<CardioSessionPoint, "cardio__cardio_name" | "bucket_start" | "points_count">>;
}

interface CardioAnalysisTabProps {
  cardioMeta: CardioMetadata | null;
  cardioSessionInsights: CardioSessionInsights | null;
}

export default function CardioAnalysisTab({
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
                new Date(m.week).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Avg Distance (km)",
                  data: cardioMeta.distance_per_week.map((m) => m.total_distance ?? 0),
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
                new Date(m.week).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Avg Pace (min/km)",
                  data: cardioMeta.avg_pace_per_week.map((m) => m.avg_pace),
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
      if (!cardioSessionInsights) return <p>Loading session data...</p>;

    switch (activeSessionMetric) {
      case "avg_speed_over_time":
        return (
          <Line
            data={{
              labels: cardioSessionInsights.avg_speed_over_time.map((d) =>
                new Date(d.bucket_start).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Distance (km)",
                  data: cardioSessionInsights.avg_speed_over_time.map(
                    (d) => d.avg_speed ?? 0
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
                new Date(d.bucket_start).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Pace (min/km)",
                  data: cardioSessionInsights.avg_pace_over_time.map(
                    (d) => d.avg_pace ?? 0
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
                new Date(d.bucket_start).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Avg Heart Rate (bpm)",
                  data: cardioSessionInsights.avg_heart_rate_over_time.map(
                    (d) => d.avg_heart_rate ?? 0
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
                new Date(d.bucket_start).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Calories Burned",
                  data: cardioSessionInsights.avg_altitude_over_time.map(
                    (d) => d.avg_altitude ?? 0
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
<div className="p-4 space-y-4">
      {/* ----------------- Overview Section ----------------- */}
      <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Cardio Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <p className="text-[9px] text-gray-400 mb-1">Total Runs</p>
            <p className="text-xl font-bold text-red-400">
              {cardioMeta.sessions_per_week.reduce((s, r) => s + (r.total ?? 0), 0)}
            </p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <p className="text-[9px] text-gray-400 mb-1">Avg Distance</p>
            <p className="text-xl font-bold text-orange-400">
              {Math.round(
                  cardioMeta.distance_per_week.reduce((s, d) => s + (d.total_distance ?? 0), 0) /
                  cardioMeta.distance_per_week.length
              )} <span className="text-xs">km</span>
            </p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <p className="text-[9px] text-gray-400 mb-1">Avg Pace</p>
            <p className="text-xl font-bold text-green-400">
              {(
                cardioMeta.avg_pace_per_week.reduce((s, d) => s + (d.avg_pace ?? 0), 0) /
                cardioMeta.avg_pace_per_week.length
              ).toFixed(2)} <span className="text-xs">min/km</span>
            </p>
          </div>
        </div>
      </section>

      {/* Two Column Grid for Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* ----------------- Run Metrics ----------------- */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Run Metrics
          </h2>
          <div className="flex gap-1 mb-3 flex-wrap bg-gray-900/50 p-1 rounded-lg border border-gray-700">
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
                className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all duration-200 ${
                  activeMetric === metric
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {metric.replace(/_/g, " ").toUpperCase()}
              </button>
            ))}
          </div>

          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">{renderChart()}</div>
        </section>

        {/* ----------------- Session Metrics ----------------- */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            Session Insights
          </h2>
          <div className="flex gap-1 mb-3 flex-wrap bg-gray-900/50 p-1 rounded-lg border border-gray-700">
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
                className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all duration-200 ${
                  activeSessionMetric === metric
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {metric.replace(/_/g, " ").toUpperCase()}
              </button>
            ))}
          </div>

          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            {renderSessionChart()}
          </div>
        </section>
      </div>
    </div>
  );
}
