"use client";

import { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { getTrainerPrograms } from "@/api/trainer";
import WorkoutEditor from "@/components/programs/WorkoutEditor";

interface ProgramWorkoutSet {
  reps?: number | null;
  weight?: number | null;
  rir?: number | null;
  duration?: number | null;
  sets_order?: number | null;
  weight_unit?: string | null;
  duration_or_velocity?: string | null;
  rir_or_rpe?: number | null;
  completed_at?: string | null;
}

interface ProgramWorkoutExercise {
  id: number;
  name: string;
  description?: string | null;
  duration?: number | null;
  sets: ProgramWorkoutSet[];
  set_structure?: string | null;
  group_id?: number | null;
  exercise_order?: number | null;
}

interface Workout {
  id: number;
  workout_name: string;
  workout_date?: string | null;
  duration?: number | null;
  heart_rate?: number | null;
  calories_burned?: number | null;
  notes?: string | null;
  workout_type?: string | null;
  trainer_id?: number | null;
  client_id?: number | null;
  prebuilt_workout?: boolean;
  session_data: ProgramWorkoutExercise[];
}

interface ProgramWorkout {
  id: number;
  program: number;
  week_index?: number | null;
  day_index?: number | null;
  order?: number | null;
  date?: string | null;
  workout: Workout;
}

interface Program {
  id: number;
  name: string;
  client_id?: number | null;
  client_name?: string | null;
  is_template: boolean;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  workout_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  program_workouts: ProgramWorkout[];
}

export default function ProgramsPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [workoutDate, setWorkoutDate] = useState(today);
  const [workoutType, setWorkoutType] = useState("General");
  const [workoutNotes, setWorkoutNotes] = useState("");

  // ✅ Tabs state
  const [activeTab, setActiveTab] = useState<"workouts" | "programs">("workouts");

  // ✅ Programs state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Replace with however you store token (context, localStorage, etc.)
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (activeTab === "programs" && token) {
      setLoading(true);
      getTrainerPrograms()
        .then((data) => {
          setPrograms(data);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to load programs:", err);
          setError("Could not load programs");
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab, token]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left sidebar: Programs & Workouts */}
      <div className="w-64 border-r border-gray-800 flex flex-col">
        {/* Tabs */}
        <div className="flex gap-2 bg-gray-800 p-0 rounded-lg">
          <button
            onClick={() => setActiveTab("workouts")}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 font-medium ${
              activeTab === "workouts" 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            Workouts
          </button>
          <button
            onClick={() => setActiveTab("programs")}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 font-medium ${
              activeTab === "programs" 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            Programs
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-800">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded bg-gray-800 p-2 text-sm"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "workouts" && (
            <>
              <div className="p-3 hover:bg-gray-800 cursor-pointer">Example Workout 1</div>
              <div className="p-3 hover:bg-gray-800 cursor-pointer">Example Workout 2</div>
            </>
          )}

          {activeTab === "programs" && (
            <>
              {loading && <div className="p-3 text-gray-400">Loading programs...</div>}
              {error && <div className="p-3 text-red-500">{error}</div>}
              {!loading && !error && programs.length === 0 && (
                <div className="p-3 text-gray-400">No programs found</div>
              )}
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="p-3 hover:bg-gray-800 cursor-pointer"
                >
                  {program.name}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Middle column: Workout Editor */}
      <WorkoutEditor/>

      {/* Right column: Calendar + Workout Metadata */}
      <div className="w-96 flex flex-col border-l border-gray-800">
        {/* Calendar */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
                )
              }
              className="px-2 py-1 rounded hover:bg-gray-800"
            >
              ←
            </button>
            <h2 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
                )
              }
              className="px-2 py-1 rounded hover:bg-gray-800"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center font-semibold">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isWorkoutDay = isSameDay(day, workoutDate);
              return (
                <div
                  key={day.toISOString()}
                  className={`h-12 flex flex-col items-center justify-center rounded cursor-pointer transition ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 hover:bg-gray-700"
                  } ${!isSameMonth(day, monthStart) ? "text-gray-500" : ""}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div>{format(day, "d")}</div>
                  {isWorkoutDay && (
                    <div className="h-1 w-1 bg-green-400 rounded-full mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Workout Metadata */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* Workout Date */}
          <div>
            <label className="block text-sm mb-1">Workout Date</label>
            <input
              type="date"
              className="w-full rounded bg-gray-800 p-2"
              value={format(workoutDate, "yyyy-MM-dd")}
              onChange={(e) => setWorkoutDate(new Date(e.target.value))}
            />
          </div>

          {/* Workout Type */}
          <div>
            <label className="block text-sm mb-1">Workout Type</label>
            <select
              className="w-full rounded bg-gray-800 p-2"
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
            >
              {["General", "Strength", "Hypertrophy", "Powerlifting", "HIIT"].map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Workout Notes */}
          <div className="flex-1 flex flex-col">
            <label className="block text-sm mb-1">Workout Notes</label>
            <textarea
              className="w-full h-full rounded bg-gray-800 p-2 resize-none flex-1"
              placeholder="Enter notes for this workout..."
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
