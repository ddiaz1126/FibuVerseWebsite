"use client";

import React from "react";
import { format } from "date-fns";


interface CardioSession {
  id: number;
  cardio_name: string;
  cardio_date: string; // ISO date
  cardio_start_time?: string | null;
  cardio_end_time?: string | null;
  cardio_type?: string | null;
  duration?: number | null;
  distance?: number | null;
  avg_pace?: number | null;
  avg_heart_rate?: number | null;
  avg_speed?: number | null;
  max_heart_rate?: number | null;
  max_pace?: number | null;
  max_speed?: number | null;
  avg_altitude?: number | null;
  elevation_gain?: number | null;
  calories_burned?: number | null;
  notes?: string | null;
  created_at: string;
}

interface WeightWorkout {
  id: number;
  workout_name: string;
  workout_date?: string | null;
  duration?: number | null;
  num_exercises?: number | null;
  notes?: string | null;
  created_at: string;
}

interface HistoryTabProps {
  cardioSessions?: CardioSession[];
  weightWorkouts?: WeightWorkout[];
}

type SessionType = "Cardio" | "Weight";

interface MergedSession {
  type: SessionType;
  date: string | undefined | null;
  duration?: number | null;
  distance?: number | null;           // for Cardio
  cardio_name?: string;               // for Cardio
  workout_name?: string;              // for Weight
  num_exercises?: number | null;      // for Weight
}


export default function HistoryTab({ cardioSessions = [], weightWorkouts = [] }: HistoryTabProps) {
  // Merge cardio and weight workouts
  const allSessions: MergedSession[] = [
    ...cardioSessions.map(c => ({
      ...c,
      type: "Cardio" as SessionType,   // assert the literal type
      date: c.cardio_date,
    })),
    ...weightWorkouts.map(w => ({
      ...w,
      type: "Weight" as SessionType,
      date: w.workout_date,
    })),
  ];

  // Sort descending by date
  allSessions.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  return (
<div className="p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Workout History
        </h2>

        {allSessions.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <div className="text-gray-400 text-sm font-medium mb-1">No workouts logged yet</div>
            <p className="text-gray-500 text-xs">Start tracking your fitness journey!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allSessions.map((session, idx) => {
              const isCardio = session.type === "Cardio";

              return (
                <div
                  key={idx}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isCardio ? "bg-green-400 shadow-sm shadow-green-400/50" : "bg-orange-400 shadow-sm shadow-orange-400/50"
                      }`}></div>
                      <span className="font-semibold text-white text-xs truncate">
                        {isCardio ? session.cardio_name : session.workout_name}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 bg-gray-900/50 px-2 py-1 rounded-lg border border-gray-700 flex-shrink-0 ml-2">
                      {session.date ? format(new Date(session.date), "MMM d, yyyy") : "Unknown"}
                    </span>
                  </div>

                  <div className="flex gap-3 text-[10px] text-gray-400 ml-4">
                    {session.duration != null && (
                      <div className="flex items-center gap-1 bg-gray-900/30 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{session.duration} min</span>
                      </div>
                    )}
                    {isCardio ? (
                      session.distance != null && (
                        <div className="flex items-center gap-1 bg-gray-900/30 px-2 py-1 rounded">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{session.distance} m</span>
                        </div>
                      )
                    ) : (
                      session.num_exercises != null && (
                        <div className="flex items-center gap-1 bg-gray-900/30 px-2 py-1 rounded">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>{session.num_exercises} exercises</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}
