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
  addDays,      // Add this
  addWeeks,     // Add this
  subWeeks  
} from "date-fns";
import { getTrainerWorkouts } from "@/api/trainer";
import { WorkoutListItem } from '@/api/trainerTypes';

export default function CalendarPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [workouts, setWorkouts] = useState<WorkoutListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Generate days for week view
  const weekStart = startOfWeek(currentMonth, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ 
    start: weekStart, 
    end: addDays(weekStart, 6) 
  });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevWeek = () => setCurrentMonth(subWeeks(currentMonth, 1));
  const nextWeek = () => setCurrentMonth(addWeeks(currentMonth, 1));
  const prevDay = () => setCurrentMonth(addDays(currentMonth, -1));
  const nextDay = () => setCurrentMonth(addDays(currentMonth, 1));

  const goToToday = () => {
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    async function fetchWorkouts() {
      try {
        setLoading(true);
        const data = (await getTrainerWorkouts()) as WorkoutListItem[];
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

  const getNavigationHandlers = () => {
    switch (view) {
      case 'week':
        return { prev: prevWeek, next: nextWeek };
      case 'day':
        return { prev: prevDay, next: nextDay };
      default:
        return { prev: prevMonth, next: nextMonth };
    }
  };

  const getDateRangeLabel = () => {
    switch (view) {
      case 'week':
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case 'day':
        return format(currentMonth, "MMMM d, yyyy");
      default:
        return format(currentMonth, "MMMM yyyy");
    }
  };

  const { prev, next } = getNavigationHandlers();

  // Function to generate ICS file content
  const generateICS = () => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Workout Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Workout Schedule',
      'X-WR-TIMEZONE:UTC',
    ];

    workouts.forEach((workout) => {
      const workoutDate = new Date(workout.workout_date);
      const endDate = new Date(workoutDate.getTime() + 60 * 60 * 1000); // 1 hour duration
      
      icsContent.push(
        'BEGIN:VEVENT',
        `DTSTART:${formatDate(workoutDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `DTSTAMP:${formatDate(new Date())}`,
        `UID:${workout.id}@workoutcalendar.com`,
        `SUMMARY:${workout.workout_name}`,
        `DESCRIPTION:${workout.client_name ? `Client: ${workout.client_name}` : 'Template Workout'}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  };

  // Function to download ICS file
  const exportToCalendar = () => {
    const icsContent = generateICS();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'workout-calendar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
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
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {w.client_name || "Template"}
                  </p>
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
            <span>Workouts</span>
          </div>
          <button 
            onClick={exportToCalendar}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-3 py-2 text-[10px] font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20 transform hover:scale-[1.02]"
          >
            Export Calendar
          </button>
        </div>
      </div>

      {/* Right panel: calendar views */}
      <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 flex flex-col overflow-auto shadow-lg">
        {/* Header with navigation and view switcher */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-700">
          <button
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            onClick={prev}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Today
            </button>
            <div className="text-lg font-bold text-white">{getDateRangeLabel()}</div>
          </div>

          <button
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            onClick={next}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* View switcher */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              view === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              view === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              view === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Day
          </button>
        </div>

        {/* Month View */}
        {view === 'month' && (
          <>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center font-semibold text-[10px] text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
              {days.map((day) => {
                const dayWorkouts = getWorkoutsForDay(day);
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[80px] flex flex-col rounded-lg cursor-pointer transition-all border overflow-hidden ${
                      isSameDay(day, selectedDate)
                        ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30"
                        : isToday
                        ? "bg-gray-700 border-blue-400 text-white"
                        : "bg-gray-900/30 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600"
                    } ${!isSameMonth(day, monthStart) ? "opacity-40" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-center py-1">
                      <span className={`text-xs font-medium ${isToday && !isSameDay(day, selectedDate) ? "text-blue-400" : ""}`}>
                        {format(day, "d")}
                      </span>
                    </div>
                    {dayWorkouts.length > 0 && (
                      <div className="px-1 pb-1 space-y-0.5 flex-1 overflow-hidden">
                        {dayWorkouts.slice(0, 2).map((workout, idx) => (
                          <div
                            key={workout.id}
                            className={`text-[8px] px-1 py-0.5 rounded truncate ${
                              isSameDay(day, selectedDate)
                                ? "bg-blue-500 text-white"
                                : "bg-blue-600 text-white"
                            }`}
                            title={workout.workout_name}
                          >
                            {workout.workout_name}
                          </div>
                        ))}
                        {dayWorkouts.length > 2 && (
                          <div className="text-[8px] text-center text-blue-400 font-medium">
                            +{dayWorkouts.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Week View */}
        {view === 'week' && (
          <div className="grid grid-cols-7 gap-3 flex-1">
            {weekDays.map((day) => {
              const dayWorkouts = getWorkoutsForDay(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`flex flex-col border rounded-lg overflow-hidden transition-all cursor-pointer ${
                    isSameDay(day, selectedDate)
                      ? "border-blue-500 bg-blue-600/20"
                      : isToday
                      ? "border-blue-400 bg-gray-700/50"
                      : "border-gray-700 bg-gray-900/30 hover:bg-gray-700/30"
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className={`text-center py-2 border-b ${
                    isToday ? "bg-blue-600 border-blue-500" : "bg-gray-800/50 border-gray-700"
                  }`}>
                    <div className="text-[10px] text-gray-400 uppercase">{format(day, "EEE")}</div>
                    <div className={`text-lg font-bold ${isToday ? "text-white" : "text-gray-200"}`}>
                      {format(day, "d")}
                    </div>
                  </div>
                  <div className="p-2 flex-1 overflow-y-auto">
                    {dayWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded mb-1 truncate"
                        title={workout.workout_name}
                      >
                        {workout.workout_name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Day View */}
        {view === 'day' && (
          <div className="flex-1 overflow-y-auto">
            <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-white">{format(currentMonth, "EEEE")}</div>
                  <div className="text-gray-400 text-sm">{format(currentMonth, "MMMM do, yyyy")}</div>
                </div>
                {isSameDay(currentMonth, new Date()) && (
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">Today</span>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Workouts
                </h3>
                {loading ? (
                  <div className="text-gray-400 text-sm animate-pulse">Loading workouts...</div>
                ) : getWorkoutsForDay(currentMonth).length > 0 ? (
                  getWorkoutsForDay(currentMonth).map((workout) => (
                    <div
                      key={workout.id}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{workout.workout_name}</div>
                          <div className="text-gray-400 text-xs mt-1">
                            {workout.client_name || "Template"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No workouts scheduled for this day</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}