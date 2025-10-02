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

interface WeightsSessionInsights {
  volume_per_exercise: VolumePerExercise[];
  avg_effort_per_exercise: AvgEffortPerExercise[];
  avg_reps_per_exercise: AvgRepsPerExercise;
  weight_progression: WeightProgression[];
  sets_per_exercise: SetsPerExercise[];
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

  return (
    <div className="p-4 space-y-10">
      {/* ----------------- Overview Section ----------------- */}
      <section>
        <h2 className="text-2xl font-bold mb-4">📊 Workouts Overview</h2>
        <div className="flex gap-4 flex-wrap">
          {/* Total Workouts */}
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            Total Workouts:{" "}
            {weightsMeta.workouts_per_week.reduce((sum, w) => sum + w.total, 0)}
          </button>

          {/* Avg Duration */}
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            Avg Duration:{" "}
            {Math.round(
              weightsMeta.avg_duration.reduce(
                (sum, m) => sum + m.avg_duration,
                0
              ) / weightsMeta.avg_duration.length
            )}{" "}
            min
          </button>

          {/* Placeholder buttons for future metrics */}
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            Total Exercises: --
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            Nutrition Score: --
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700">
            Cardio Hours: --
          </button>
        </div>
      </section>

      {/* ----------------- Workout Metrics Section ----------------- */}
      <section>
        <h2 className="text-2xl font-bold mb-4">💪 Workout Metrics</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
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

      {/* ----------------- Session Metrics Section ----------------- */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🏋️ Session Metrics</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
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
