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
<div className="flex h-full text-sm gap-3 p-3">
    {/* Left panel for selected day */}
    <div className="w-1/6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 flex flex-col gap-3 shadow-lg">
      <div>
        <div className="text-base font-bold text-white">{format(selectedDate, "EEEE")}</div>
        <div className="text-xs text-gray-400">{format(selectedDate, "MMMM do, yyyy")}</div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <h3 className="font-semibold text-xs text-gray-300 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Workouts
        </h3>
        {loading ? (
          <div className="text-gray-400 text-[10px] animate-pulse">Loading...</div>
        ) : getWorkoutsForDay(selectedDate).length ? (
          <div className="space-y-1.5">
            {getWorkoutsForDay(selectedDate).map((w) => (
              <div key={w.id} className="p-2 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-all">
                <p className="font-medium text-[10px] text-white">{w.workout_name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-[10px]">
            <svg className="w-6 h-6 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            No workouts
          </div>
        )}
      </div>

      {/* Legend & Export */}
      <div className="mt-auto border-t border-gray-700 pt-3">
        <h3 className="font-semibold mb-2 text-[10px] text-gray-400">Legend</h3>
        <div className="flex items-center gap-2 text-[10px] text-gray-300 mb-3">
          <span className="w-2 h-2 bg-blue-400 rounded-full shadow-sm shadow-blue-400/50"></span>
          <span>Workout Day</span>
        </div>
        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-3 py-2 text-[10px] font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20 transform hover:scale-[1.02]">
          Export Calendar
        </button>
      </div>
    </div>

    {/* Right panel: monthly calendar */}
    <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 flex flex-col overflow-auto shadow-lg">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-700">
        <button
          className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          onClick={prevMonth}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-lg font-bold text-white">{format(currentMonth, "MMMM yyyy")}</div>
        <button
          className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          onClick={nextMonth}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center font-semibold text-[10px] text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2 flex-1">
        {days.map((day) => {
          const dayWorkouts = getWorkoutsForDay(day);
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={`h-14 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all border ${
                isSameDay(day, selectedDate)
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30"
                  : isToday
                  ? "bg-gray-700 border-blue-400 text-white"
                  : "bg-gray-900/30 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600"
              } ${!isSameMonth(day, monthStart) ? "opacity-40" : ""}`}
              onClick={() => setSelectedDate(day)}
            >
              <span className={`text-xs font-medium ${isToday && !isSameDay(day, selectedDate) ? "text-blue-400" : ""}`}>
                {format(day, "d")}
              </span>
              {dayWorkouts.length > 0 && (
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1 shadow-sm"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
}
