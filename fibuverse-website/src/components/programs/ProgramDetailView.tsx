"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProgram } from '@/api/trainer';
import { Program, Workout, ProgramWorkout } from '@/api/trainerTypes';

const calendarDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface WeekData {
  weekNumber: number;
  days: (ProgramWorkout | null)[];
}

export default function ProgramDetailView({ programId }: { programId: number }) {
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProgram(programId);
        setProgram(data);
      } catch (error) {
        console.error("Failed to fetch program:", error);
        setError("Failed to load program. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]); // ✅ only runs when programId changes

  // Organize workouts into weeks grid
  const organizeWorkouts = (): WeekData[] => {
    if (!program || !program.program_workouts || program.program_workouts.length === 0) return [];

    const maxWeek = Math.max(...program.program_workouts.map(pw => pw.week_index || 1));
    const weeks: WeekData[] = [];

    for (let w = 1; w <= maxWeek; w++) {
      const days: (ProgramWorkout | null)[] = Array(7).fill(null);
      
      program.program_workouts
        .filter(pw => pw.week_index === w)
        .forEach(pw => {
          const dayIndex = (pw.day_index || 1) - 1; // Convert to 0-based index
          if (dayIndex >= 0 && dayIndex < 7) {
            days[dayIndex] = pw;
          }
        });
      
      weeks.push({ weekNumber: w, days });
    }

    return weeks;
  };

const renderExerciseDetails = (workout: Workout) => {
  if (!workout.exercises || workout.exercises.length === 0) {
    return (
      <div className="text-center text-gray-500 py-2 text-[10px]">
        No exercises
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-y-auto flex-1">
      {workout.exercises.map((exercise, idx) => {
        if (!exercise.sets || exercise.sets.length === 0) return null;

        const repsValues = [...new Set(exercise.sets.map(s => s.reps))];
        const repsDisplay = repsValues.join(',');
        
        const firstSet = exercise.sets[0];
        const weightUnit = firstSet?.weightUnit === 1 ? 'kg' : 'lbs';
        const weight = firstSet?.weight || 0;
        const rirOrRpe = firstSet?.rirOrRpe === 1 ? 'RPE' : 'RIR';
        const rirValue = firstSet?.rir || 0;
        
        let durationVelocity = '';
        if (firstSet?.durationOrVelocity === 0 && firstSet?.duration) {
          durationVelocity = ` ${firstSet.duration}s`;
        } else if (firstSet?.durationOrVelocity === 1) {
          durationVelocity = ' V';
        }
        
        return (
          <div 
            key={idx} 
            className="text-[9px] leading-tight text-gray-300"
          >
            <span className="text-blue-400 font-semibold">
              {exercise.exerciseOrder}.{exercise.groupId || 0}
            </span>
            {' '}
            <span className="font-medium">{exercise.exerciseName}</span>
            {' '}
            <span className="text-gray-400">
              {exercise.sets.length}×{repsDisplay} @{weight}{weightUnit} {rirValue}{rirOrRpe}{durationVelocity}
            </span>
          </div>
        );
      })}
    </div>
  );
};

if (loading) {
  return (
    <div className="flex h-screen bg-gray-900 items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div className="text-white text-lg">Loading program...</div>
      </div>
    </div>
  );
}
if (error || !program) {
  return (
    <div className="flex h-screen bg-gray-900 items-center justify-center">
      <div className="text-center bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 max-w-md mx-4">
        <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-white text-lg font-semibold mb-2">
          {error || "Program not found"}
        </div>
        <p className="text-gray-400 text-sm mb-6">
          The program you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm shadow-lg"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

const weeks = organizeWorkouts();

return (
  <div className="flex h-screen bg-gray-900">
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 group mb-2">
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-yellow-500/50 group-hover:to-yellow-500 transition-all duration-300"></div>
              <h1 className="text-lg font-bold text-white truncate group-hover:text-yellow-400 transition-colors duration-300">
                {program.name}
              </h1>
              <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-yellow-500/50 group-hover:to-yellow-500 transition-all duration-300"></div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 ml-20">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                program.is_template 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {program.is_template ? 'Template' : 'Assigned'}
              </span>
              <span>•</span>
              <span>{weeks.length} {weeks.length === 1 ? 'week' : 'weeks'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            {/* <button
              onClick={() => router.back()}
              className="px-3 py-1.5 bg-gray-700/50 border border-gray-600 text-white rounded-md hover:bg-gray-700 transition-all flex items-center gap-1.5 text-xs flex-1 sm:flex-initial justify-center"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button> */}
            <button
              onClick={() => router.push(`/trainer/programs/${program.id}/edit`)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all flex items-center gap-1.5 text-xs flex-1 sm:flex-initial justify-center shadow-md"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>
        
        {program.description && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 ml-20">
            <p className="text-xs text-gray-300 line-clamp-2">
              {program.description}
            </p>
          </div>
        )}
      </div>

      {/* Program Grid */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        <div className="w-full">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-900/50 border-b border-gray-700">
                  <tr>
                    <th className="px-2 py-3 text-left font-bold text-gray-300 w-12 sticky left-0 bg-gray-900/50 backdrop-blur-sm">
                      Wk
                    </th>
                    {calendarDays.map(day => (
                      <th key={day} className="px-3 py-3 text-center font-bold text-gray-300 min-w-[100px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <svg className="w-12 h-12 mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm font-medium">No workouts in this program</p>
                          <p className="text-xs mt-1">Click Edit to add workouts</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    weeks.map((week) => (
                      <tr key={week.weekNumber} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                        <td className="px-2 py-3 font-bold text-gray-300 align-top sticky left-0 bg-gray-800/50 backdrop-blur-sm">
                        <div className="flex items-center justify-center">
                          <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-blue-500/30">
                            W{week.weekNumber}
                          </span>
                        </div>
                        </td>
                        {week.days.map((programWorkout, dayIndex) => (
                          <td key={dayIndex} className="px-2 py-3">
                            <div
                              className={`relative w-full h-50 rounded-lg transition-all ${
                                programWorkout
                                  ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-2 border-blue-600/50 hover:border-blue-500 shadow-lg'
                                  : 'bg-gray-700/30 border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-gray-500'
                              }`}
                            >
                              {programWorkout && programWorkout.workout ? (
                                <div className="p-3 h-full flex flex-col">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="font-semibold text-white line-clamp-2 flex-1 text-sm">
                                      {programWorkout.workout.workoutName || 'Unnamed Workout'}
                                    </div>
                                  </div>
                                  
                                  <div className="text-[10px] text-gray-300 overflow-y-auto flex-1 pr-1">
                                    {renderExerciseDetails(programWorkout.workout)}
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-600/50">
                                    <span className="flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                      </svg>
                                      {programWorkout.workout.numExercises || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {programWorkout.workout.duration || 0}m
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                  <Calendar className="w-6 h-6 mb-1" />
                                  <span className="text-[10px]">Rest Day</span>
                                </div>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}