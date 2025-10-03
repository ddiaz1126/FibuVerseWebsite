"use client";

import { useState, useEffect } from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { getTrainerWorkouts } from "@/api/trainer";
import { WorkoutListItem } from '@/api/trainerTypes';

export default function CalendarPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [workouts, setWorkouts] = useState<WorkoutListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    async function fetchWorkouts() {
      try {
        setLoading(true);
        const data = (await getTrainerWorkouts()) as WorkoutListItem[]; // <-- type assertion
        setWorkouts(data);
      } catch (err) {
        console.error("Failed to load workouts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, []);

  // Filter workouts for a given day
  const getWorkoutsForDay = (date: Date) => {
    return workouts.filter((w) =>
      isSameDay(new Date(w.workout_date), date)
    );
  };

  return (
    <div className="flex h-full">
      {/* Left panel for selected day */}
      <div className="w-1/4 border-r border-gray-700 p-4 flex flex-col gap-4">
        <div className="text-xl font-bold">{format(selectedDate, "EEEE")}</div>
        <div className="text-lg text-gray-300">{format(selectedDate, "MMMM do, yyyy")}</div>

        <div className="mt-2 flex flex-col gap-2">
          <h3 className="font-semibold">Workouts</h3>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : getWorkoutsForDay(selectedDate).length ? (
            getWorkoutsForDay(selectedDate).map((w) => (
              <div key={w.id} className="p-2 bg-gray-700 rounded">
                <p className="font-semibold">{w.workout_name}</p>
                {/* <p className="text-gray-300 text-sm">{w.client_name}</p> */}
              </div>
            ))
          ) : (
            <p className="text-gray-400">No workouts</p>
          )}
        </div>

        {/* Legend & Export */}
        <div className="mt-auto">
          <h3 className="font-semibold mb-2">Legend</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-600 rounded-full"></span>
              <span>Workouts</span>
            </div>
          </div>
          <button className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
            Export / Share Calendar
          </button>
        </div>
      </div>

      {/* Right panel: monthly calendar */}
      <div className="flex-1 flex flex-col p-4 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
            onClick={prevMonth}
          >
            ←
          </button>
          <div className="text-2xl font-bold text-center flex-1">{format(currentMonth, "MMMM yyyy")}</div>
          <button
            className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
            onClick={nextMonth}
          >
            →
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center font-semibold">{d}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2 flex-1 overflow-auto">
          {days.map((day) => {
            const dayWorkouts = getWorkoutsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={`h-16 flex flex-col items-center justify-center rounded cursor-pointer transition p-1 ${
                  isSameDay(day, selectedDate)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700"
                } ${!isSameMonth(day, monthStart) ? "text-gray-500" : ""}`}
                onClick={() => setSelectedDate(day)}
              >
                <span>{format(day, "d")}</span>
                {dayWorkouts.length > 0 && (
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-1"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
