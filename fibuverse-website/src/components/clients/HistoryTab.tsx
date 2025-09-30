"use client";

import React from "react";
import { format } from "date-fns";

interface HistoryTabProps {
  cardioSessions?: any[];
  weightWorkouts?: any[];
}

export default function HistoryTab({ cardioSessions = [], weightWorkouts = [] }: HistoryTabProps) {
  // Merge cardio and weight workouts
  const allSessions = [
    ...cardioSessions.map(c => ({ ...c, type: "Cardio", date: c.cardio_date })),
    ...weightWorkouts.map(w => ({ ...w, type: "Weight", date: w.workout_date })),
  ];

  // Sort descending by date
  allSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Workout History</h2>
      {allSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No workouts logged yet</div>
          <p className="text-gray-600 text-sm mt-2">Start tracking your fitness journey!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allSessions.map((session, idx) => {
            const isCardio = session.type === "Cardio";
            
            return (
              <div 
                key={idx} 
                className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isCardio ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    <span className="font-semibold text-white">
                      {isCardio ? session.cardio_name : session.workout_name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    {format(new Date(session.date), "MMM d, yyyy")}
                  </span>
                </div>
                
                <div className="flex gap-4 text-sm text-gray-400 ml-4">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">⏱</span>
                    <span>{session.duration} min</span>
                  </div>
                  {isCardio ? (
                    session.distance && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">📍</span>
                        <span>{session.distance} m</span>
                      </div>
                    )
                  ) : (
                    session.num_exercises && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">💪</span>
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