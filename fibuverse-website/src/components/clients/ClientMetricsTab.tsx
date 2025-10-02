"use client";

import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useRouter } from "next/navigation"; // <-- import router

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

interface HealthMetric {
  created_at: string; // ISO date string
  resting_hr?: number;
  max_hr?: number;
  vo2max?: number;
  hrv_ms?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  fat_mass?: number;
  lean_body_mass?: number;
  fev_1?: number;
  fvc_ratio?: number;
  o2_saturation?: number;
}


interface ClientMetricsTabProps {
  clientId: number;
  clientName: string;
  clientGender?: string | null;
  clientAge?: number | null;
  metricsData: HealthMetric | null | undefined; // This matches Client's health_metrics property
}

interface BodyMeasurement {
  weight_kg: number;
  height_cm: number;
  bmi: number;
  waist_cm: number;
  hip_cm: number;
  waist_to_height_ratio: number;
  body_fat_percentage: number;
  created_at: string; // ISO date string
}
interface FitnessTest {
  created_at: string; // ISO date string
  sit_and_reach_cm: number;
  hand_dynamometer_kg: number;
  plank_hold_seconds: number;
  wall_sit_seconds: number;
  balance_test_seconds: number;
  push_ups_test: number;
  sit_ups_test: number;
  pull_ups_test: number;
  bench_press_1rm_kg: number;
  leg_press_1rm_kg: number;
}

interface HealthMetricEntry {
  created_at: string; // ISO date string
  resting_hr?: number;
  max_hr?: number;
  vo2max?: number;
  hrv_ms?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  fat_mass?: number;
  lean_body_mass?: number;
  fev_1?: number;
  fvc_ratio?: number;
  o2_saturation?: number;
}
interface Skinfold {
  created_at: string; // ISO date string
  chest: number;
  abdomen: number;
  thigh: number;
  triceps: number;
  subscapular: number;
  midaxillary: number;
  biceps: number;
  calf: number;
  suprailiac: number;
}
export default function ClientMetricsTab({
  clientId,
  clientName,
  clientGender,
  clientAge,
  metricsData,
}: ClientMetricsTabProps) {
  const router = useRouter();
  // -------------------- Health Metrics --------------------
  const [activeHealthMetric, setActiveHealthMetric] = useState<
    | "resting_hr"
    | "max_hr"
    | "vo2max"
    | "hrv_ms"
    | "systolic_bp"
    | "diastolic_bp"
    | "fat_mass"
    | "lean_body_mass"
    | "fev_1"
    | "fvc_ratio"
    | "o2_saturation"
  >("resting_hr");

  // -------------------- Body Measurements --------------------
  const [activeBodyMetric, setActiveBodyMetric] = useState<
    | "weight_kg"
    | "height_cm"
    | "bmi"
    | "waist_cm"
    | "hip_cm"
    | "waist_to_height_ratio"
    | "body_fat_percentage"
  >("weight_kg");

  // -------------------- Body Fat Skinfolds --------------------
  const [activeSkinfoldMetric, setActiveSkinfoldMetric] = useState<
    | "chest"
    | "abdomen"
    | "thigh"
    | "triceps"
    | "subscapular"
    | "midaxillary"
    | "biceps"
    | "calf"
    | "suprailiac"
  >("chest");

    // -------------------- Fitness Tests --------------------
  const [activeFitnessTests, setFitnessTests] = useState<
    | "sit_and_reach_cm"
    | "hand_dynamometer_kg"
    | "plank_hold_seconds"
    | "wall_sit_seconds"
    | "balance_test_seconds"
    | "push_ups_test"
    | "sit_ups_test"
    | "pull_ups_test"
    | "bench_press_1rm_kg"
    | "leg_press_1rm_kg"
  >("sit_and_reach_cm");

  if (!metricsData) return <p>Loading metrics...</p>;

  // -------------------- Chart Renderers --------------------
  const renderHealthChart = () => {
    if (!metricsData.health_metrics?.length) return <p>No health metrics recorded yet.</p>;

    const labels = metricsData.health_metrics.map((m: HealthMetricEntry) =>
      new Date(m.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    );
    let data: number[] = [];
    let label = "";

    switch (activeHealthMetric) {
      case "resting_hr":
        data = metricsData.health_metrics.map((m: HealthMetricEntry) => m.resting_hr);
        label = "Resting Heart Rate (bpm)";
        break;
      case "max_hr":
        data = metricsData.health_metrics.map((m: HealthMetricEntry) => m.max_hr);
        label = "Max HR (bpm)";
        break;
      case "vo2max":
        data = metricsData.health_metrics.map((m: HealthMetricEntry) => m.vo2max);
        label = "VO₂max";
        break;
      case "hrv_ms":
        data = metricsData.health_metrics.map((m: HealthMetricEntry) => m.hrv_ms);
        label = "HRV (ms)";
        break;
      case "systolic_bp":
        data = metricsData.health_metrics.map((m: HealthMetricEntry) => m.systolic_bp);
        label = "Systolic BP";
        break;
      case "diastolic_bp":
        data = metricsData.health_metrics.map((m: HealthMetricEntry) => m.diastolic_bp);
        label = "Diastolic BP";
        break;
    }

    const ChartComponent =
      activeHealthMetric === "max_hr" || activeHealthMetric.includes("bp") ? Bar : Line;

    return (
      <ChartComponent
        data={{
          labels,
          datasets: [
            {
              label,
              data,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.3,
            },
          ],
        }}
      />
    );
  };

  const renderBodyChart = () => {
    if (!metricsData.body_measurements?.length) return <p>No body measurements recorded yet.</p>;

    // Body Measurements x-axis
    const labels = metricsData.body_measurements.map((m: BodyMeasurement) =>
      new Date(m.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    );
    const data = metricsData.body_measurements.map(
      (m: BodyMeasurement) => m[activeBodyMetric]
    );
    return (
      <Line
        data={{
          labels,
          datasets: [
            {
              label: activeBodyMetric.replace(/_/g, " ").toUpperCase(),
              data,
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              tension: 0.3,
            },
          ],
        }}
      />
    );
  };

  const renderSkinfoldChart = () => {
    if (!metricsData.body_fat_skinfolds?.length) return <p>No skinfold measurements recorded yet.</p>;

    // Skinfolds x-axis
    const labels = metricsData.body_fat_skinfolds.map((m: Skinfold) =>
      new Date(m.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    );
    const data = metricsData.body_fat_skinfolds.map((m: Skinfold) => m[activeSkinfoldMetric]);

    return (
      <Line
        data={{
          labels,
          datasets: [
            {
              label: activeSkinfoldMetric.replace(/_/g, " ").toUpperCase(),
              data,
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              tension: 0.3,
            },
          ],
        }}
      />
    );
  };
    // -------------------- Fitness Tests Chart Renderer --------------------
    const renderFitnessTestsChart = () => {
    if (!metricsData.fitness_tests?.length) return <p>No fitness tests measurements recorded yet.</p>;

    // Skinfolds x-axis
    const labels = metricsData.fitness_tests.map((m: FitnessTest) =>
      new Date(m.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    );
    const data = metricsData.fitness_tests.map((m: FitnessTest) => m[activeFitnessTests]);

    return (
      <Line
        data={{
          labels,
          datasets: [
            {
              label: activeFitnessTests.replace(/_/g, " ").toUpperCase(),
              data,
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              tension: 0.3,
            },
          ],
        }}
      />
    );
  };

  // -------------------- Render Sections --------------------
  return (
    <div className="p-4 space-y-10">
      <div className="flex justify-end mb-6">
        <button
          onClick={() =>
            router.push(
              `/trainer/clients/add-metrics?clientId=${clientId}&clientName=${encodeURIComponent(
                clientName
              )}&clientGender=${encodeURIComponent(clientGender || '')}&clientAge=${clientAge || ''}`
            )
          }
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Metrics
        </button>
      </div>
      {/* Health Metrics */}
      <section>
        <h2 className="text-2xl font-bold mb-4">📊 Health Metrics</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            "resting_hr",
            "max_hr",
            "vo2max",
            "hrv_ms",
            "systolic_bp",
            "diastolic_bp",
          ].map((metric) => (
            <button
              key={metric}
              onClick={() => setActiveHealthMetric(metric as typeof activeHealthMetric)}
              className={`px-3 py-1 rounded ${
                activeHealthMetric === metric
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {metric.replace(/_/g, " ").toUpperCase()}
            </button>
          ))}
        </div>
        <div className="bg-gray-900 p-4 rounded shadow">{renderHealthChart()}</div>
      </section>

      {/* Body Measurements */}
      <section>
        <h2 className="text-2xl font-bold mb-4">⚖️ Body Measurements</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            "weight_kg",
            "height_cm",
            "bmi",
            "waist_cm",
            "hip_cm",
            "waist_to_height_ratio",
            "body_fat_percentage",
          ].map((metric) => (
            <button
              key={metric}
              onClick={() => setActiveBodyMetric(metric as typeof activeBodyMetric)}
              className={`px-3 py-1 rounded ${
                activeBodyMetric === metric
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {metric.replace(/_/g, " ").toUpperCase()}
            </button>
          ))}
        </div>
        <div className="bg-gray-900 p-4 rounded shadow">{renderBodyChart()}</div>
      </section>

      {/* Fitness Tests */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🏅 Fitness Tests</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            "sit_and_reach_cm",
            "hand_dynamometer_kg",
            "plank_hold_seconds",
            "wall_sit_seconds",
            "balance_test_seconds",
            "push_ups_test",
            "sit_ups_test",
            "pull_ups_test",
            "bench_press_1rm_kg",
            "leg_press_1rm_kg",
          ].map((metric) => (
            <button
              key={metric}
              onClick={() => setFitnessTests(metric as typeof activeFitnessTests)}
              className={`px-3 py-1 rounded ${
                activeSkinfoldMetric === metric
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {metric.replace(/_/g, " ").toUpperCase()}
            </button>
          ))}
        </div>
        <div className="bg-gray-900 p-4 rounded shadow">{renderFitnessTestsChart()}</div>
      </section>

      {/* Body Fat Skinfolds */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🩺 Body Fat Skinfolds</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            "chest",
            "abdomen",
            "thigh",
            "triceps",
            "subscapular",
            "midaxillary",
            "biceps",
            "calf",
            "suprailiac",
          ].map((metric) => (
            <button
              key={metric}
              onClick={() => setActiveSkinfoldMetric(metric as typeof activeSkinfoldMetric)}
              className={`px-3 py-1 rounded ${
                activeSkinfoldMetric === metric
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {metric.replace(/_/g, " ").toUpperCase()}
            </button>
          ))}
        </div>
        <div className="bg-gray-900 p-4 rounded shadow">{renderSkinfoldChart()}</div>
      </section>

    </div>
  );
}