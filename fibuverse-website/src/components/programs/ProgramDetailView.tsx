"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, Edit } from 'lucide-react';
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
    fetchProgram();
  });

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
        <div className="text-xs text-gray-400 italic">No exercises</div>
      );
    }

    return (
      <div className="text-[10px] text-gray-400 space-y-0.5 overflow-y-auto flex-1">
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
            durationVelocity = ' Velocity';
          }
          
          return (
            <div key={idx} className="leading-tight">
              {exercise.exerciseOrder}.{exercise.groupId || 0} {exercise.exerciseName} {exercise.sets.length}x{repsDisplay} @{weight}{weightUnit} {rirValue}{rirOrRpe}{durationVelocity}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900 items-center justify-center">
        <div className="text-white text-xl">Loading program...</div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="flex h-screen bg-gray-900 items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">
            {error || "Program not found"}
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <div className="bg-gray-800 border-b border-gray-700 p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{program.name}</h1>
              <div className="text-sm text-gray-400">
                {program.is_template ? 'Template' : 'Assigned Program'} • {weeks.length} {weeks.length === 1 ? 'week' : 'weeks'}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => router.push(`/trainer/programs/${program.id}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>
          
          {program.description && (
            <p className="text-gray-300 bg-gray-700 rounded p-3 border border-gray-600">
              {program.description}
            </p>
          )}
        </div>

        {/* Program Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
          <div className="w-full">
            <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-750 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 w-32">Week</th>
                      {calendarDays.map(day => (
                        <th key={day} className="px-4 py-4 text-center text-sm font-semibold text-gray-300 min-w-[200px]">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                          No workouts in this program
                        </td>
                      </tr>
                    ) : (
                      weeks.map((week) => (
                        <tr key={week.weekNumber} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="px-6 py-4 font-medium text-gray-300 align-top">
                            Week {week.weekNumber}
                          </td>
                          {week.days.map((programWorkout, dayIndex) => (
                            <td key={dayIndex} className="px-4 py-4">
                              <div
                                className={`relative w-full h-48 rounded border-2 transition-all ${
                                  programWorkout
                                    ? 'bg-blue-900/30 border-blue-600'
                                    : 'bg-gray-700/50 border-gray-600'
                                }`}
                              >
                                {programWorkout && programWorkout.workout ? (
                                  <div className="p-3 h-full flex flex-col">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div className="text-sm font-semibold text-white line-clamp-2 flex-1">
                                        {programWorkout.workout.workoutName || 'Unnamed Workout'}
                                      </div>
                                    </div>
                                    
                                    {renderExerciseDetails(programWorkout.workout)}
                                    
                                    <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
                                      {programWorkout.workout.numExercises || 0} exercises • {programWorkout.workout.duration || 0} min
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center text-gray-600">
                                    <Calendar className="w-6 h-6" />
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