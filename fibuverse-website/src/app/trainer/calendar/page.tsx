"use client";

import { useState } from "react";
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

export default function CalendarPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="flex h-full">
      {/* Left panel for selected day */}
      <div className="w-1/4 border-r border-gray-700 p-4 flex flex-col gap-4">
        <div className="text-xl font-bold">{format(selectedDate, "EEEE")}</div>
        <div className="text-lg text-gray-300">{format(selectedDate, "MMMM do, yyyy")}</div>

        {/* Legend at the bottom */}
        <div className="mt-auto">
          <h3 className="font-semibold mb-2">Legend</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-600 rounded-full"></span>
              <span>Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-600 rounded-full"></span>
              <span>Appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-orange-500 rounded-full"></span>
              <span>Calls</span>
            </div>
          </div>
            {/* Placeholder button for exporting/sharing */}
            <button
                className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
                Export / Share Calendar
            </button>
        </div>
      </div>

      {/* Right panel: monthly calendar */}
      <div className="flex-1 flex flex-col p-4 overflow-auto">
        {/* Month & Year header with navigation */}
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
            <div key={d} className="text-center font-semibold">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2 flex-1 overflow-auto">
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={`h-16 flex items-center justify-center rounded cursor-pointer transition ${
                isSameDay(day, selectedDate)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700"
              } ${!isSameMonth(day, monthStart) ? "text-gray-500" : ""}`}
              onClick={() => setSelectedDate(day)}
            >
              {format(day, "d")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// Make calendar flexible to allow to connect to google calendar and Apple Calendar