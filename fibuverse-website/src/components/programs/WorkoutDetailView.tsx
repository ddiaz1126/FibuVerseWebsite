import React, { useState } from 'react';
import { Calendar, Layers, X, Dumbbell, Activity, BarChart3 } from 'lucide-react';
import { Workout, SessionData, Client, WorkoutPayload  } from "@/api/trainerTypes";
import { getTrainerClients, sendTrainerWorkout } from "@/api/trainer";

interface WorkoutDetailViewProps {
  workout: Workout;
  onClose?: () => void;
}

export const WorkoutDetailView: React.FC<WorkoutDetailViewProps> = ({ workout, onClose }) => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<Client[]>([]);
    
    const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    };

  const getWeightUnit = (unit: number) => {
    return unit === 0 ? 'lbs' : 'kg';
  };

  const getRirRpeLabel = (type: number) => {
    return type === 0 ? 'RIR' : 'RPE';
  };

  // Group exercises by groupId
  const groupedExercises = workout.exercises.reduce((acc, exercise) => {
    const key = exercise.groupId ?? `single-${exercise.id}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(exercise);
    return acc;
  }, {} as Record<string | number, SessionData[]>);

  // ------------- Assign ----------------------
    const assignAndSaveWorkout = () => {
        setShowModal(true);
        fetchClients(); // load clients when modal opens
    };
        async function fetchClients() {
        try {
            setLoading(true);
            const data = await getTrainerClients();
            console.log("Raw API data:", data);
            const clientList = data as Client[];
            setClients(clientList); // ← important: set state here
        } catch (err) {
            console.error("Failed to load clients:", err);
        } finally {
            setLoading(false);
        }
    }
    const handleSaveClients = async () => {
    // Create a workout payload for each selected client
        const workoutPayloads: WorkoutPayload[] = selectedClientsWithDates.map((clientWithDate) => ({
        workout_data: {
            client_id: clientWithDate.clientId,
            workout_name: workout.workoutName || 'Default Workout',
            workout_date: clientWithDate.date,
            workout_start_time: new Date(clientWithDate.date).toISOString(),
            workout_end_time: new Date(new Date(clientWithDate.date).getTime() + 60 * 60 * 1000).toISOString(),
            workout_type: workout.workoutType || 'General',
            duration: workout.duration ?? 60,
            prebuilt_workout: 1,
            exercises: workout.exercises.map((ex) => ({
            id: typeof ex.id === 'number'
            ? ex.id
            : (typeof ex.exerciseId === 'number' ? ex.exerciseId : 0),
            exercise_name: ex.exerciseName,
            exercise_order: ex.exerciseOrder,
            group_id: ex.groupId ?? 0,
            set_structure: ex.setStructure ?? 0,
            sets: ex.sets.map((s) => ({
                sets_order: s.setsOrder,
                weight: s.weight ?? 0,
                reps: s.reps ?? '0',
                rir: s.rir ?? null,
                weight_unit: s.weightUnit ?? null,
                duration_or_velocity: s.durationOrVelocity ?? null,
                rir_or_rpe: s.rirOrRpe ?? null,
                duration: s.duration ?? null,
            })),
            })),
        },
        }));

        console.log('Workout payloads for all clients + template:', workoutPayloads);

        try {
            // Send each workout individually, but all in parallel
            await Promise.all(
            workoutPayloads.map(payload => sendTrainerWorkout(payload))
            );
            
            alert(`Successfully assigned workout to ${selectedClientsWithDates.length} client(s) and saved as template!`);
            setShowModal(false);
            setSelectedClientsWithDates([]);
        } catch (error) {
            console.error('Error saving workouts:', error);
            alert('Failed to save one or more workouts');
        }
  };
      // Add state for selected clients with dates
      const [selectedClientsWithDates, setSelectedClientsWithDates] = useState<{
          clientId: number;
          date: string;
      }[]>([]);
  
    // Handle checkbox toggle
    const handleClientToggle = (clientId: number) => {
    setSelectedClientsWithDates((prev) => {
        const exists = prev.find((c) => c.clientId === clientId);
        if (exists) {
        // Remove if already selected
        return prev.filter((c) => c.clientId !== clientId);
        } else {
        // Add with today's date as default
        return [...prev, { clientId, date: new Date().toISOString().split('T')[0] }];
        }
    });
    };
    // Handle date change
    const handleDateChange = (clientId: number, newDate: string) => {
    setSelectedClientsWithDates((prev) =>
        prev.map((c) => (c.clientId === clientId ? { ...c, date: newDate } : c))
    );
    };

    // Check if client is selected
    const isClientSelected = (clientId: number) => {
    return selectedClientsWithDates.some((c) => c.clientId === clientId);
    };

    // Get date for a client
    const getClientDate = (clientId: number) => {
    return selectedClientsWithDates.find((c) => c.clientId === clientId)?.date || '';
    };
    

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-lg font-semibold text-white mb-1">
                {workout.workoutName}
              </h1>
              <div className="flex items-center gap-1 text-[10px]">
                <span className="px-1.5 py-0.5 bg-green-400 text-gray-900 rounded-full font-medium">
                  {workout.workoutType}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
            {/* Assign button */}
            <button
              onClick={() => assignAndSaveWorkout()}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow transition text-sm"
            >
              Assign
            </button>
            {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">Select Clients</h3>
                    <button
                        onClick={() => setShowModal(false)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                    </div>
                </div>

                {/* Client List */}
                <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="text-center py-12">
                    <p className="text-gray-400">Loading clients...</p>
                    </div>
                ) : clients.length > 0 ? (
                    <div className="space-y-3">
                    {clients.map((client) => (
                        <div key={client.id} className="space-y-2">
                        <label className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer group">
                            <input
                            type="checkbox"
                            checked={isClientSelected(client.id)}
                            onChange={() => handleClientToggle(client.id)}
                            className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                            />
                            <span className="text-white group-hover:text-blue-400 transition-colors">
                            {client.first_name} {client.last_name}
                            </span>
                        </label>
                        
                        {/* Date picker - only show if client is selected */}
                        {isClientSelected(client.id) && (
                            <div className="ml-7 pl-4 border-l-2 border-gray-700">
                            <label className="block text-sm text-gray-400 mb-1">
                                Assign Date:
                            </label>
                            <input
                                type="date"
                                value={getClientDate(client.id)}
                                onChange={(e) => handleDateChange(client.id, e.target.value)}
                                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            </div>
                        )}
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                    <p className="text-gray-400">No clients found</p>
                    </div>
                )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
                    <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
                    >
                    Cancel
                    </button>
                    <button
                    onClick={handleSaveClients}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                    Save
                    </button>
                </div>
                </div>
            </div>
            )}

            {/* Close button */}
            {onClose && (
                <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-gray-700 rounded"
                >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            )}
            </div>
        </div>

        {/* Workout Info + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4 text-sm">
          {/* Date */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-700 rounded">
              <Calendar className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Date</p>
              <p className="text-xs font-bold text-gray-100">{formatDate(workout.workoutDate ?? "")}</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-700 rounded">
              <Dumbbell className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Duration</p>
              <p className="text-xs font-bold text-gray-100">{workout.duration} min</p>
            </div>
          </div>

          {/* Total Exercises */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-700 rounded">
              <Activity className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Exercises</p>
              <p className="text-xs font-bold text-gray-100">{workout.exercises.length}</p>
            </div>
          </div>

          {/* Total Sets */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-700 rounded">
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Sets</p>
              <p className="text-xs font-bold text-gray-100">
                {workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
              </p>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-700 rounded">
              <BarChart3 className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Volume</p>
              <p className="text-xs font-bold text-gray-100">
                {workout.exercises.reduce(
                  (total, ex) =>
                    total +
                    ex.sets.reduce((setSum, s) => {
                      const weight = Number(s.weight) || 0;
                      const reps = Number(s.reps) || 0;
                      return setSum + weight * reps;
                    }, 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        </div>

        {/* Exercises */}
        <div className="space-y-3">
          {Object.entries(groupedExercises).map(([key, exercises], groupIndex) => (
            <div key={key} className="bg-gray-800 rounded-lg shadow border border-gray-700 p-4">
              
              {exercises.length > 1 && (
                <div className="mb-2 pb-2 border-b border-gray-700">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Superset {groupIndex + 1}
                  </h3>
                </div>
              )}

              {exercises.map((exercise, idx) => (
                <div key={exercise.exerciseName} className={idx > 0 ? 'mt-4 pt-4 border-t border-gray-700' : ''}>
                  
                  {/* Exercise Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-500">
                        {exercise.groupId}.{exercise.exerciseOrder}
                      </span>
                      <h3 className="text-sm font-bold text-white">{exercise.exerciseName}</h3>
                    </div>
                  </div>

                  {/* Sets Table */}
                  {exercise.sets.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="py-1 px-2 font-bold text-gray-400 uppercase tracking-wide text-left">Set</th>
                            <th className="py-1 px-2 font-bold text-gray-400 uppercase tracking-wide text-left">Weight</th>
                            <th className="py-1 px-2 font-bold text-gray-400 uppercase tracking-wide text-left">Reps</th>
                            <th className="py-1 px-2 font-bold text-gray-400 uppercase tracking-wide text-left">
                              {getRirRpeLabel(exercise.sets[0].rirOrRpe)}
                            </th>
                            {exercise.sets.some(s => s.duration) && (
                              <th className="py-1 px-2 font-bold text-gray-400 uppercase tracking-wide text-left">Duration</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {exercise.sets.map((set) => (
                            <tr key={set.setsOrder} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                              <td className="py-1 px-2 font-bold text-white">{set.setsOrder}</td>
                              <td className="py-1 px-2 text-gray-300">{set.weight} {getWeightUnit(set.weightUnit)}</td>
                              <td className="py-1 px-2 text-gray-300">{set.reps}</td>
                              <td className="py-1 px-2 text-gray-300">{set.rir}</td>
                              {exercise.sets.some(s => s.duration) && (
                                <td className="py-1 px-2 text-gray-300">{set.duration ? `${set.duration}s` : '-'}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};