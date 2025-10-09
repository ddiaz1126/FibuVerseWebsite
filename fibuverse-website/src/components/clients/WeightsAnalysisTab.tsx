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
interface WorkoutPerWeek {
  week: string; // ISO date string
  total: number;
}

interface AvgDurationByMonth {
  month: string; // ISO date string
  avg_duration: number;
}

interface ExercisesPerWorkout {
  workout_date: string; // ISO date string
  workout_name: string;
  total_exercises: number;
}

interface MuscleOrEquipmentStat {
  name: string;
  count: number;
}

interface DifficultyStat {
  difficulty: string;
  total: number;
}

interface WeightsMeta {
  workouts_per_week: WorkoutPerWeek[];
  avg_duration: AvgDurationByMonth[];
  exercises_per_workout: ExercisesPerWorkout[];
  muscle_group_stats: MuscleOrEquipmentStat[];
  equipment_stats: MuscleOrEquipmentStat[];
  difficulty_stats: DifficultyStat[];
}
interface VolumePerExercise {
  workout_id: number;
  exercise__name: string;
  total_session_load: number;
}

interface AvgEffortPerExercise {
  workout_id: number;
  exercise_name: string;
  effort: number;
}

interface AvgRepsPerExercise {
  [exercise_name: string]: number; // avg reps per exercise
}

interface WeightProgression {
  exercise__name: string;
  workout__workout_date: string; // ISO date string
  avg_weight: number;
}

interface SetsPerExercise {
  exercise__name: string;
  total_sets: number;
}

interface Recent3Weeks {
  cutoff_date: string;
  total_workouts: number;
  workouts_per_week: number;
  sets_per_muscle_group: { exercise__muscle_group: string; total_sets: number }[];
  sets_per_exercise: { exercise__name: string; total_sets: number }[];
  equipment_usage: { exercise__equipment: string; usage_count: number }[];
  volume_per_muscle_group: { muscle_group: string; total_volume: number }[];
  weight_progression: { exercise_name: string; workout_date: string | null; avg_weight: number }[];
}

interface WeightsSessionInsights {
  volume_per_exercise: VolumePerExercise[];
  avg_effort_per_exercise: AvgEffortPerExercise[];
  avg_reps_per_exercise: AvgRepsPerExercise;
  weight_progression: WeightProgression[];
  sets_per_exercise: SetsPerExercise[];
  recent_3_weeks: Recent3Weeks;  // Add this
}


interface WeightsAnalysisTabProps {
  weightsMeta: WeightsMeta | null;
  weightsSessionInsights: WeightsSessionInsights | null;
}

interface SetPerExercise {
  exercise__name: string;
  total_sets: number;
}


export default function WeightsAnalysisTab({ weightsMeta, weightsSessionInsights }: WeightsAnalysisTabProps) {
  const [activeMetric, setActiveMetric] = useState<
    | "workouts_per_week"
    | "avg_duration"
    | "exercises_per_workout"
    | "muscle_group_stats"
    | "equipment_stats"
    | "difficulty_stats"
  >("workouts_per_week");

  const [activeSessionMetric, setActiveSessionMetric] = useState<
    | "volume_per_exercise"
    | "avg_effort_per_exercise"
    | "avg_reps_per_exercise"
    | "weight_progression"
    | "sets_per_exercise"
  >("volume_per_exercise");

    // New handler for 3-week recent data
  const [activeRecentMetric, setActiveRecentMetric] = useState<
    | "sets_per_muscle_group"
    | "sets_per_exercise"
    | "equipment_usage"
    | "volume_per_muscle_group"
    | "weight_progression"
  >("sets_per_muscle_group");

  const colors = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
  ];

  if (!weightsMeta) return <p>Loading analysis...</p>;

  const renderChart = () => {
    switch (activeMetric) {
      case "workouts_per_week":
        return (
          <Bar
            data={{
              labels: weightsMeta.workouts_per_week.map((w) =>
                new Date(w.week).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Workouts per Week",
                  data: weightsMeta.workouts_per_week.map((w) => w.total),
                  backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
              ],
            }}
          />
        );

      case "avg_duration":
        return (
          <Line
            data={{
              labels: weightsMeta.avg_duration.map((m) =>
                new Date(m.month).toLocaleDateString()
              ),
              datasets: [
                {
                  label: "Avg Duration (min)",
                  data: weightsMeta.avg_duration.map((m) => m.avg_duration),
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                },
              ],
            }}
          />
        );

      case "exercises_per_workout":
        return (
          <Bar
            data={{
              labels: weightsMeta.exercises_per_workout.map(
                (w) => w.workout_name
              ),
              datasets: [
                {
                  label: "Exercises per Workout",
                  data: weightsMeta.exercises_per_workout.map(
                    (w) => w.total_exercises
                  ),
                  backgroundColor: "rgba(255, 99, 132, 0.6)",
                },
              ],
            }}
          />
        );

      case "muscle_group_stats":
        return (
          <Pie
            data={{
              labels: Object.keys(weightsMeta.muscle_group_stats),
              datasets: [
                {
                  label: "Muscle Group Frequency",
                  data: Object.values(weightsMeta.muscle_group_stats),
                  backgroundColor: [
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                  ],
                },
              ],
            }}
          />
        );

      case "equipment_stats":
        return (
          <Pie
            data={{
              labels: Object.keys(weightsMeta.equipment_stats),
              datasets: [
                {
                  label: "Equipment Usage",
                  data: Object.values(weightsMeta.equipment_stats),
                  backgroundColor: [
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                  ],
                },
              ],
            }}
          />
        );

      case "difficulty_stats":
        return (
          <Bar
            data={{
              labels: weightsMeta.difficulty_stats.map((d) => d.difficulty),
              datasets: [
                {
                  label: "Workout Difficulty Counts",
                  data: weightsMeta.difficulty_stats.map((d) => d.total),
                  backgroundColor: "rgba(255, 159, 64, 0.6)",
                },
              ],
            }}
          />
        );
    }
  };

  const renderSessionChart = () => {
    if (!weightsSessionInsights) return <p>Loading session data...</p>;

    switch (activeSessionMetric) {
      case "volume_per_exercise":
        return (
          <Bar
            data={{
              labels: weightsSessionInsights.volume_per_exercise.map(
                (v: VolumePerExercise) => v.exercise__name
              ),
              datasets: [
                {
                  label: "Total Volume per Exercise",
                  data: weightsSessionInsights.volume_per_exercise.map(
                    (v: VolumePerExercise) => v.total_session_load
                  ),
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
              ],
            }}
          />
        );

      case "avg_effort_per_exercise":
        return (
          <Bar
            data={{
              labels: weightsSessionInsights.avg_effort_per_exercise.map(
                (e: AvgEffortPerExercise) => e.exercise_name
              ),
              datasets: [
                {
                  label: "Avg Effort (RIR/RPE)",
                  data: weightsSessionInsights.avg_effort_per_exercise.map(
                    (e: AvgEffortPerExercise) => e.effort
                  ),
                  backgroundColor: "rgba(255, 159, 64, 0.6)",
                },
              ],
            }}
          />
        );

      case "avg_reps_per_exercise":
        return (
          <Bar
            data={{
              labels: Object.keys(weightsSessionInsights.avg_reps_per_exercise),
              datasets: [
                {
                  label: "Avg Reps per Exercise",
                  data: Object.values(weightsSessionInsights.avg_reps_per_exercise),
                  backgroundColor: "rgba(153, 102, 255, 0.6)",
                },
              ],
            }}
          />
        );

      case "weight_progression":
        return (
          <Line
            data={{
              labels: weightsSessionInsights.weight_progression.map(
                (w: WeightProgression) =>
                  new Date(w.workout__workout_date).toLocaleDateString()
              ),
              datasets: weightsSessionInsights.weight_progression.reduce<
                {
                  label: string;
                  data: number[];
                  borderColor: string;
                  fill: boolean;
                }[]
              >((acc, w: WeightProgression) => {
                const existing = acc.find(d => d.label === w.exercise__name);
                if (existing) {
                  existing.data.push(w.avg_weight);
                } else {
                  acc.push({ 
                    label: w.exercise__name, 
                    data: [w.avg_weight], 
                    borderColor: colors[acc.length % colors.length], 
                    fill: false 
                  });
                }
                return acc;
              }, []),
            }}
          />
        );

      case "sets_per_exercise":
        return (
          <Bar
            data={{
              labels: weightsSessionInsights.sets_per_exercise.map(
                (s: SetPerExercise) => s.exercise__name
              ),
              datasets: [
                {
                  label: "Total Sets per Exercise",
                  data: weightsSessionInsights.sets_per_exercise.map(
                    (s: SetPerExercise) => s.total_sets
                  ),
                  backgroundColor: "rgba(255, 206, 86, 0.6)",
                },
              ],
            }}
          />
        );
    }
  };

  const renderRecentMetricsChart = () => {
    if (!weightsSessionInsights?.recent_3_weeks) return <p>Loading recent metrics...</p>;

    const recentData = weightsSessionInsights.recent_3_weeks;

    switch (activeRecentMetric) {
      case "sets_per_muscle_group":
        return (
          <Bar
            data={{
              labels: recentData.sets_per_muscle_group.map(
                (m) => m.exercise__muscle_group || "Unknown"
              ),
              datasets: [
                {
                  label: "Sets per Muscle Group (Last 3 Weeks)",
                  data: recentData.sets_per_muscle_group.map((m) => m.total_sets),
                  backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
              ],
            }}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: `Total Workouts: ${recentData.total_workouts} (${recentData.workouts_per_week}/week)`,
                },
              },
            }}
          />
        );

      case "sets_per_exercise":
        return (
          <Bar
            data={{
              labels: recentData.sets_per_exercise.map((e) => e.exercise__name),
              datasets: [
                {
                  label: "Sets per Exercise (Last 3 Weeks)",
                  data: recentData.sets_per_exercise.map((e) => e.total_sets),
                  backgroundColor: "rgba(255, 99, 132, 0.6)",
                },
              ],
            }}
          />
        );

      case "equipment_usage":
        return (
          <Bar
            data={{
              labels: recentData.equipment_usage.map(
                (eq) => eq.exercise__equipment || "Bodyweight"
              ),
              datasets: [
                {
                  label: "Equipment Usage Frequency (Last 3 Weeks)",
                  data: recentData.equipment_usage.map((eq) => eq.usage_count),
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
              ],
            }}
          />
        );

      case "volume_per_muscle_group":
        return (
          <Bar
            data={{
              labels: recentData.volume_per_muscle_group.map(
                (v) => v.muscle_group || "Unknown"
              ),
              datasets: [
                {
                  label: "Total Volume per Muscle Group (Last 3 Weeks)",
                  data: recentData.volume_per_muscle_group.map((v) => v.total_volume),
                  backgroundColor: "rgba(153, 102, 255, 0.6)",
                },
              ],
            }}
          />
        );

    case "weight_progression":
      return (
        <Line
          data={{
            labels: recentData.weight_progression.map((w) =>
              w.workout_date ? new Date(w.workout_date).toLocaleDateString() : "N/A"
            ),
            datasets: recentData.weight_progression.reduce<
              {
                label: string;
                data: number[];
                borderColor: string;
                fill: boolean;
              }[]
            >((acc, w) => {
              const existing = acc.find((d) => d.label === w.exercise_name);
              if (existing) {
                existing.data.push(w.avg_weight);
              } else {
                acc.push({
                  label: w.exercise_name,
                  data: [w.avg_weight],
                  borderColor: colors[acc.length % colors.length],
                  fill: false,
                });
              }
              return acc;
            }, []),
          }}
          options={{
            plugins: {
              title: {
                display: true,
                text: "Weight Progression (Last 3 Weeks)",
              },
            },
          }}
        />
      );

      default:
        return null;
    }
  };

  return (
<div className="p-4 space-y-4">
      {/* ----------------- Overview Section ----------------- */}
      <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Workouts Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <p className="text-[9px] text-gray-400 mb-1">Total Workouts</p>
            <p className="text-xl font-bold text-blue-400">
              {weightsMeta.workouts_per_week.reduce((sum, w) => sum + w.total, 0)}
            </p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <p className="text-[9px] text-gray-400 mb-1">Avg Duration</p>
            <p className="text-xl font-bold text-green-400">
              {Math.round(
                weightsMeta.avg_duration.reduce((sum, m) => sum + m.avg_duration, 0) /
                weightsMeta.avg_duration.length
              )} <span className="text-xs">min</span>
            </p>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <p className="text-[9px] text-gray-400 mb-1">Total Exercises</p>
            <p className="text-xl font-bold text-gray-500">--</p>
          </div>
        </div>
      </section>

      {/* Two Column Grid for Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* ----------------- Recent Training Summary (Last 3 Weeks) ----------------- */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700">
          <h2 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Training Summary
          </h2>
          
          {weightsSessionInsights?.recent_3_weeks && (
            <div className="mb-2 text-[10px] text-gray-400 flex flex-wrap gap-2">
              <span className="bg-gray-900/50 px-2 py-1 rounded">
                Total: {weightsSessionInsights.recent_3_weeks.total_workouts}
              </span>
              <span className="bg-gray-900/50 px-2 py-1 rounded">
                Avg: {weightsSessionInsights.recent_3_weeks.workouts_per_week}/wk
              </span>
              <span className="bg-gray-900/50 px-2 py-1 rounded">
                {new Date(weightsSessionInsights.recent_3_weeks.cutoff_date).toLocaleDateString()} - Today
              </span>
            </div>
          )}
          
          <div className="flex gap-1 mb-3 flex-wrap bg-gray-900/50 p-1 rounded-lg border border-gray-700">
            {[
              "sets_per_muscle_group",
              "sets_per_exercise",
              "equipment_usage",
              "volume_per_muscle_group",
              "weight_progression",
            ].map((metric) => (
              <button
                key={metric}
                onClick={() =>
                  setActiveRecentMetric(
                    metric as
                      | "sets_per_muscle_group"
                      | "sets_per_exercise"
                      | "equipment_usage"
                      | "volume_per_muscle_group"
                      | "weight_progression"
                  )
                }
                className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all duration-200 ${
                  activeRecentMetric === metric
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {metric.replace(/_/g, " ").toUpperCase()}
              </button>
            ))}
          </div>

          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">{renderRecentMetricsChart()}</div>
        </section>

        {/* ----------------- Workout Metrics Section ----------------- */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Workout Metrics
          </h2>
          
          <div className="flex gap-1 mb-3 flex-wrap bg-gray-900/50 p-1 rounded-lg border border-gray-700">
            {[
              "workouts_per_week",
              "avg_duration",
              "exercises_per_workout",
              "muscle_group_stats",
              "equipment_stats",
              "difficulty_stats",
            ].map((metric) => (
              <button
                key={metric}
                onClick={() =>
                  setActiveMetric(
                    metric as
                      | "workouts_per_week"
                      | "avg_duration"
                      | "exercises_per_workout"
                      | "muscle_group_stats"
                      | "equipment_stats"
                      | "difficulty_stats"
                  )
                }
                className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all duration-200 ${
                  activeMetric === metric
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {metric.replace(/_/g, " ").toUpperCase()}
              </button>
            ))}
          </div>

          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">{renderChart()}</div>
        </section>

        {/* ----------------- Session Metrics Section ----------------- */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Session Metrics
          </h2>

          <div className="flex gap-1 mb-3 flex-wrap bg-gray-900/50 p-1 rounded-lg border border-gray-700">
            {[
              "volume_per_exercise",
              "avg_effort_per_exercise",
              "avg_reps_per_exercise",
              "weight_progression",
              "sets_per_exercise",
            ].map((metric) => (
              <button
                key={metric}
                onClick={() =>
                  setActiveSessionMetric(
                    metric as
                      | "volume_per_exercise"
                      | "avg_effort_per_exercise"
                      | "avg_reps_per_exercise"
                      | "weight_progression"
                      | "sets_per_exercise"
                  )
                }
                className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all duration-200 ${
                  activeSessionMetric === metric
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {metric.replace(/_/g, " ").toUpperCase()}
              </button>
            ))}
          </div>

          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">{renderSessionChart()}</div>
        </section>
      </div>
    </div>
  );
}
