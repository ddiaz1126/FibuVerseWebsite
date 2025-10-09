"use client";

import React, { useState, useEffect } from 'react';
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
import { Plus, X, Copy, Trash2, Calendar, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { getTrainerWorkouts, getClientWeightsSessionData, getTrainerClients, getSpecificWorkout, sendProgram, getClientMetricsData } from "@/api/trainer";
import { Client, WorkoutListItem, WeightsSessionInsights, ProgramWorkout, WeightWorkout, CardioSession, ClientMetricsData } from '@/api/trainerTypes';
import { useRouter } from 'next/navigation';
import WorkoutEditor from "@/components/programs/WorkoutEditor";
import FibuChat from "@/components/FibuChat";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button"

export default function ProgramBuilder() {
  const [programName, setProgramName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [weeks, setWeeks] = useState([
    { id: 1, days: Array(7).fill(null) },
  ]);
  const [draggedWorkout, setDraggedWorkout] = useState<number | null>(null);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [trainerWorkouts, setTrainerWorkouts] = useState<WorkoutListItem[]>([]);
  const [workoutDetails, setWorkoutDetails] = useState<{[key: number]: ProgramWorkout}>({})

  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320); // default width
  const [isResizing, setIsResizing] = useState(false);
  const calendarDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const router = useRouter();

  // Right Sidebar
  const today = new Date();
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  // const [workoutDate, ] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [, setLoading] = useState(false);
  const [weightsSessionInsights, setWeightsSessionInsights] = useState<WeightsSessionInsights | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(360);

  const [metricsData, setMetricsData] = useState<ClientMetricsData | null>(null);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
    // For Workouts tab - fetch assigned workouts (where clientId is null)
    useEffect(() => {
        async function fetchWorkouts() {
            try {
            setLoadingWorkouts(true);
            const data = await getTrainerWorkouts();
            console.log("Trainer workouts:", data);

            // Filter for workouts with null clientId and sort by date descending
            const filteredWorkouts = data
                .filter(w => w.client_id === null || w.client_id === 0) // Workouts not assigned to clients
                .sort((a, b) => {
                const dateA = a.workout_date ? new Date(a.workout_date).getTime() : 0;
                const dateB = b.workout_date ? new Date(b.workout_date).getTime() : 0;
                return dateB - dateA; // Descending (newest first)
                });

            setTrainerWorkouts(filteredWorkouts);
            } catch (err) {
            console.error("Failed to fetch workouts:", err);
            } finally {
            setLoadingWorkouts(false);
            }
    }

    fetchWorkouts();
    }, []); 

  const addWeek = () => {
    setWeeks([...weeks, { id: Date.now(), days: Array(7).fill(null) }]);
  };

  const duplicateWeek = (weekIndex: number) => {
    const newWeek = { id: Date.now(), days: [...weeks[weekIndex].days] };
    const newWeeks = [...weeks];
    newWeeks.splice(weekIndex + 1, 0, newWeek);
    setWeeks(newWeeks);
  };

  const deleteWeek = (weekIndex: number) => {
    if (weeks.length > 1) {
      setWeeks(weeks.filter((_, i) => i !== weekIndex));
    }
  };

  const handleWorkoutDrop = async (e: React.DragEvent, weekIndex: number, dayIndex: number) => {
    e.preventDefault();
    
    if (!draggedWorkout) return;
    
    // Update the grid with the workout ID
    const newWeeks = [...weeks];
    newWeeks[weekIndex].days[dayIndex] = draggedWorkout;
    setWeeks(newWeeks);
    setDraggedWorkout(null);
    
    // Fetch full workout details if we don't have them yet
    if (!workoutDetails[draggedWorkout]) {
      try {
        const workout = await getSpecificWorkout(draggedWorkout);
        
        // Transform Workout to ProgramWorkout
        const programWorkout: ProgramWorkout = {
          id: 0, // Temporary, will be set when saved to backend
          program: 0, // Will be set when saving the program
          week_index: weekIndex,
          day_index: dayIndex,
          order: null,
          date: null,
          workout: workout
        };
        
        setWorkoutDetails(prev => ({
          ...prev,
          [draggedWorkout]: programWorkout
        }));
        
        console.log("Added workout to program:", programWorkout);
      } catch (error) {
        console.error("Failed to fetch workout details:", error);
      }
    }
  };

  const clearCell = (weekIndex: number, dayIndex: number) => {
    const newWeeks = [...weeks];
    newWeeks[weekIndex].days[dayIndex] = null;
    setWeeks(newWeeks);
  };

  const getWorkoutById = (id: number) =>
    trainerWorkouts.find(w => w.id === id);

  const handleSave = async () => {  // ✅ Make it async
    const programWorkouts: ProgramWorkout[] = [];
    let dayCounter = 1;

    weeks.forEach((week, weekIndex) => {
      week.days.forEach((workoutId) => {
        if (workoutId !== null) {
          const workoutData = workoutDetails[workoutId];

          if (workoutData) {
            programWorkouts.push({
              id: 0, // Provide a default value for 'id'
              program: 0,
              week_index: weekIndex + 1,
              day_index: dayCounter,
              order: dayCounter,
              date: null,
              workout: workoutData.workout
            });
          } else {
            console.warn(`Missing workout details for ID: ${workoutId}`);
          }
        }
        dayCounter++;
      });
    });

    const program = {
      name: programName,
      description,
      is_template: true,
      program_workouts: programWorkouts
    };

    console.log('Saving program:', program);
    console.log('First workout exercises:', program.program_workouts[0]?.workout?.exercises);
    
    try {
      // ✅ Await the API call
      await sendProgram({
        name: program.name,
        description: program.description,
        is_template: program.is_template,
        program_workouts: program.program_workouts.map(pw => ({
          program: pw.program, // number | null is fine
          week_index: pw.week_index ?? 0, // coerce undefined/null to 0
          day_index: pw.day_index ?? 0,
          order: pw.order ?? 0,
          date: pw.date ?? null,
          workout: pw.workout
        }))
      });
      
      // ✅ Only navigate on success
      router.push('/trainer/programs');
    } catch (error) {
      console.error('Failed to save program:', error);
      // ✅ Show error to user
      alert('Failed to save program. Please try again.');
    }
  };
  // Sidebar
  useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 600) {
        setSidebarWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Right Sidebar
    const fetchClients = async () => {
        try {
          setLoading(true);
          const data = await getTrainerClients(); // your API call
          const clientList = data as Client[];
          setClients(clientList);
          // Do NOT select any client automatically
        } catch (err) {
          console.error("Failed to load clients:", err);
        } finally {
          setLoading(false);
        }
      };
  const handleClientSelect = async (client: Client) => {
    setSelectedClient(client);      // Update selected client
    setDropdownOpen(false);         // Close dropdown

    const clientId = client.id;

    try {
      setLoading(true);

      // Fetch weights session insights
      const weightsSessionData = await getClientWeightsSessionData(clientId);
      console.log("Client weights session insights:", weightsSessionData);
      setWeightsSessionInsights(weightsSessionData.data);

    } catch (err) {
      console.error("Failed to fetch weights data:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleDropdownClick = () => {
    setDropdownOpen((prev) => !prev);
    if (clients.length === 0) {
      fetchClients();
    }
  };

  // Separate useEffect for fetching metrics when client changes
  useEffect(() => {
    if (!selectedClient) return;
    
    const clientId = selectedClient.id;
    
    async function fetchMetricsData() {
      try {
        setLoading(true);
        const data = await getClientMetricsData(clientId);
        setMetricsData(data);
      } catch (err) {
        console.error("Failed to fetch client metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMetricsData();
  }, [selectedClient]);

  // Initial fetch of clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

    // Extract session dates
  const cardioDates = metricsData?.cardio_sessions?.map((s: CardioSession) => s.cardio_date) || [];
  const weightDates = metricsData?.weight_workouts?.map((w: WeightWorkout) => w.workout_date) || [];


return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar - Workout Library */}
      <div
        className="border-r border-gray-700 flex flex-col bg-gray-800/50 backdrop-blur-sm"
        style={{ width: sidebarWidth }}
      >
        {isCreatingWorkout ? (
          <>
            {/* Creating Workout Header */}
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                FibuVerse
              </h2>
              <button
                onClick={() => setIsCreatingWorkout(false)}
                className="text-xs text-red-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-900 transition-all"
              >
                Cancel
              </button>
            </div>

            {/* Workout Editor */}
            <WorkoutEditor onSave={() => setIsCreatingWorkout(false)} />
          </>
        ) : (
          <>
            {/* Title */}
            <div className="px-3 pt-3 pb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                FibuVerse
              </h2>
            </div>

            {/* Create Workout Button */}
            <div className="px-3 pb-3">
              <Button
                onClick={() => setIsCreatingWorkout(true)}
                variant="success"
                size="md"
                label="Create Workout"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
                className="w-full shadow-lg shadow-green-500/20 hover:scale-[1.02]"
              />
            </div>

            {/* Search */}
            <div className="px-3 pb-3">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search workouts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg bg-gray-900/50 border border-gray-700 pl-8 pr-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Workout List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {loadingWorkouts ? (
                <div className="text-center py-6 text-gray-400 text-xs animate-pulse">
                  <svg className="w-6 h-6 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Loading...
                </div>
              ) : trainerWorkouts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  No workouts found
                </div>
              ) : (
                <div className="space-y-2">
                  {trainerWorkouts
                    .filter(
                      (workout) =>
                        searchTerm === "" ||
                        workout.workout_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        workout.workout_type?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((workout) => (
                      <div
                        key={workout.id}
                        draggable
                        onDragStart={() => setDraggedWorkout(workout.id)}
                        onDragEnd={() => setDraggedWorkout(null)}
                        className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-blue-500/50 hover:bg-gray-900/70 cursor-grab active:cursor-grabbing transition-all transform hover:scale-[1.01] shadow-sm"
                      >
                        <div className="font-medium text-xs text-white mb-1">{workout.workout_name}</div>
                        <div className="text-[10px] text-gray-400 mb-1.5">{workout.workout_type}</div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {workout.num_exercises || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {workout.duration || 0}m
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-3 pb-3 border-t border-gray-700 pt-3">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-gray-900/30 rounded-lg p-2 border border-gray-700/50">
                <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Drag workouts to calendar</span>
              </div>
            </div>
          </>
        )}
      </div>
      <div
        onMouseDown={() => setIsResizing(true)}
        className="w-1 bg-gray-700 cursor-ew-resize hover:bg-gray-600 transition-colors"
      ></div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 p-4 mt-4 rounded-lg mx-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <input
              type="text"
              placeholder="Program Name"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="text-base font-bold w-full bg-gray-900/50 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-white placeholder-gray-500"
            />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => router.push('/trainer/programs')}
                className="px-2 py-1 bg-red-700 text-gray-300 rounded hover:bg-red-600 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!programName}
                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-xs"
              >
                Assign & Save
              </button>
              <button
                onClick={handleSave}
                disabled={!programName}
                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-xs"
              >
                Save Program
              </button>
            </div>
          </div>

          <textarea
            placeholder="Program description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-900/50 text-white placeholder-gray-500 border border-gray-700 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            rows={2}
          />

          <div className="text-xs text-gray-400 mt-1.5">
            {weeks.length} {weeks.length === 1 ? 'week' : 'weeks'} • Template
          </div>
        </div>

        {/* Program Grid */}
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
                        <th key={day} className="px-3 py-3 text-center font-bold text-gray-300 min-w-[140px]">
                          {day}
                        </th>
                      ))}
                      <th className="px-2 py-3 w-12 sticky right-0 bg-gray-900/50 backdrop-blur-sm"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((week, weekIndex) => (
                      <tr key={week.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                        <td className="px-2 py-3 font-bold text-gray-300 align-top sticky left-0 bg-gray-800/50 backdrop-blur-sm">
                          <div className="flex items-center justify-center">
                            <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-blue-500/30">
                              W{weekIndex + 1}
                            </span>
                          </div>
                        </td>
                        {week.days.map((workoutId, dayIndex) => {
                          const workout = workoutId ? getWorkoutById(workoutId) : null;
                          return (
                            <td key={dayIndex} className="px-2 py-3">
                              <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleWorkoutDrop(e, weekIndex, dayIndex)}
                                className={`relative w-full h-40 rounded-lg transition-all ${
                                  workout 
                                    ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-2 border-blue-600/50 hover:border-blue-500 shadow-lg' 
                                    : 'bg-gray-700/30 border-2 border-dashed border-gray-600 hover:border-gray-500 flex items-center justify-center'
                                }`}
                              >
                                {workout ? (
                                  <div className="p-3 h-full flex flex-col">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div className="font-semibold text-white line-clamp-2 flex-1 text-sm">
                                        {workout.workout_name}
                                      </div>
                                      <button
                                        onClick={() => clearCell(weekIndex, dayIndex)}
                                        className="p-1 hover:bg-blue-800/50 rounded transition-colors"
                                      >
                                        <X className="w-3 h-3 text-gray-400 hover:text-white" />
                                      </button>
                                    </div>

                                    {/* Workout Details */}
                                    {workoutDetails[workoutId] ? (
                                      <div className="text-[10px] text-gray-300 space-y-0.5 overflow-y-auto flex-1 pr-1">
                                        {workoutDetails[workoutId].workout.exercises.map((exercise, idx) => {
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
                                    ) : (
                                      <div className="text-[10px] text-gray-400 italic">Loading...</div>
                                    )}

                                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-600/50">
                                      <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        {workout.num_exercises}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {workout.duration}m
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
                          );
                        })}
                        <td className="px-2 py-3 align-top sticky right-0 bg-gray-800/50 backdrop-blur-sm">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => duplicateWeek(weekIndex)}
                              className="p-1 hover:bg-blue-600/20 rounded transition-colors"
                              title="Duplicate week"
                            >
                              <Copy className="w-3 h-3 text-blue-400" />
                            </button>
                            <button
                              onClick={() => deleteWeek(weekIndex)}
                              className="p-1 hover:bg-red-600/20 rounded transition-colors"
                              title="Delete week"
                              disabled={weeks.length === 1}
                            >
                              <Trash2 className={`w-3 h-3 ${weeks.length === 1 ? 'text-gray-600' : 'text-red-400'}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Add Week Button */}
              <button
                onClick={addWeek}
                className="mt-4 ml-4 mb-4 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-xs font-medium shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Week
              </button>
            </div>
          </div>
        </div>

      </div>
      {/* Right column: Calendar + Client Analysis */}
      <div className="flex h-full text-sm relative ml-2">  {/* Collapse/Expand Button */}
        <button
          onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-1.5 hover:bg-gray-700 transition-all shadow-lg"
          aria-label="Toggle right panel"
        >
          {rightPanelCollapsed ? (
            <ChevronLeftIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Calendar Panel */}
        <div className={`transition-all duration-300 ease-in-out ${
          rightPanelCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-80'
        } flex flex-col bg-gray-800/50 backdrop-blur-sm border-l border-gray-700 rounded-l-xl m-2 ml-0`}>
          {/* Calendar */}
          <div className="p-3 border-b border-gray-700">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
                  )
                }
                className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 text-gray-400" />
              </button>
              <h2 className="text-sm font-bold text-white">{format(currentMonth, "MMMM yyyy")}</h2>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
                  )
                }
                className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mb-3 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 bg-green-400 rounded-full shadow-sm" />
                <span className="text-gray-400 font-medium">Weights</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 bg-orange-400 rounded-full shadow-sm" />
                <span className="text-gray-400 font-medium">Cardio</span>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 text-[10px] mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center font-bold text-gray-400">{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const hasWeight = weightDates.some(date => date && isSameDay(new Date(date), day));
                const hasCardio = cardioDates.some(date => date && isSameDay(new Date(date), day));
                                
                return (
                  <div
                    key={day.toISOString()}
                    className={`h-9 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-blue-600 text-white shadow-lg scale-105" 
                        : "bg-gray-700/30 hover:bg-gray-700/50 border border-gray-700"
                    } ${!isSameMonth(day, monthStart) ? "text-gray-600" : "text-gray-300"}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-[10px] font-semibold">{format(day, "d")}</div>
                    {(hasWeight || hasCardio) && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasWeight && <div className="h-1 w-1 bg-green-400 rounded-full" />}
                        {hasCardio && <div className="h-1 w-1 bg-orange-400 rounded-full" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
                {/* Client Selection */}
                <div className="p-3 bg-gray-900/50 border-b border-gray-700">
                  <h3 className="text-xs font-bold text-white mb-2">Select Client</h3>
                  <div className="relative">
                    <button
                      onClick={handleDropdownClick}
                      className="w-full flex justify-between items-center px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700 text-xs focus:outline-none transition-all"
                    >
                      <span className="truncate">
                        {selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : "No client selected"}
                      </span>
                      <ChevronDownIcon className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transform transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                      <ul className="absolute mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-48 overflow-auto text-xs">
                        {clients.length === 0 ? (
                          <li className="px-3 py-2 text-gray-500">No clients available</li>
                        ) : (
                          clients.map((client) => (
                            <li
                              key={client.id}
                              className="px-3 py-2 hover:bg-gray-700/50 cursor-pointer transition-colors border-b border-gray-700/30 last:border-0"
                              onClick={() => handleClientSelect(client)}
                            >
                              {client.first_name} {client.last_name}
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
        
                {/* Usage instruction */}
              <p className="text-[10px] text-gray-500 mt-2">
                View client metrics while building workouts
              </p>
                </div>
        
                {/* Client Analysis */}
                <div className="flex-1 p-1 flex flex-col gap-1">

                  {/* ----------------- Recent 3 Weeks Weights Summary ----------------- */}
                  <section className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-0.5 w-8 bg-gradient-to-r from-transparent to-blue-500/50"></div>
                      <h2 className="text-sm font-bold text-white">3 Week Summary</h2>
                      <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-blue-500/50"></div>
                    </div>

                    <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-2 mb-3">
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-gray-500">Total:</span>
                          <span className="ml-1 text-white font-semibold">
                            {weightsSessionInsights?.recent_3_weeks.total_workouts || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg/Week:</span>
                          <span className="ml-1 text-white font-semibold">
                            {weightsSessionInsights?.recent_3_weeks.workouts_per_week || 0}
                          </span>
                        </div>
                        <div className="col-span-2 text-gray-500 pt-1 border-t border-gray-700/50">
                          {weightsSessionInsights?.recent_3_weeks.cutoff_date
                            ? new Date(weightsSessionInsights.recent_3_weeks.cutoff_date).toLocaleDateString()
                            : "-"} → Today
                        </div>
                      </div>
                    </div>

                    {[
                      { title: "Sets per Muscle Group", key: "sets_per_muscle_group", data: weightsSessionInsights?.recent_3_weeks.sets_per_muscle_group, columns: ["exercise__muscle_group", "total_sets"] },
                      { title: "Sets per Exercise", key: "sets_per_exercise", data: weightsSessionInsights?.recent_3_weeks.sets_per_exercise, columns: ["exercise__name", "total_sets"] },
                      { title: "Equipment Usage", key: "equipment_usage", data: weightsSessionInsights?.recent_3_weeks.equipment_usage, columns: ["exercise__equipment", "usage_count"] },
                      { title: "Volume per Muscle Group", key: "volume_per_muscle_group", data: weightsSessionInsights?.recent_3_weeks.volume_per_muscle_group, columns: ["muscle_group", "total_volume"] },
                      { title: "Weight Progression", key: "weight_progression", data: weightsSessionInsights?.recent_3_weeks.weight_progression, columns: ["exercise_name", "workout_date", "avg_weight"] },
                    ].map((section) => (
                      <CollapsibleTable key={section.key} section={section} />
                    ))}
                </section>

                </div>
            </div>
        </div>
          {/* Right-side chat panel */}
          {chatOpen && (
            <div className="flex-shrink-0 h-full" style={{ width: chatWidth }}>
              <FibuChat
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                width={chatWidth}
                setWidth={setChatWidth}
              />
            </div>
          )}
          {/* Floating toggle button — hide when chat is open */}
          {!chatOpen && (
            <button
              className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg z-50 border border-blue-500 flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition"
              onClick={() => setChatOpen(true)}
              aria-label="Open chat"
            >
              <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-white" />
            </button>
          )}
    </div>
  );
};

type TableCellValue = string | number | boolean | Date | null | undefined;
type TableRow = Record<string, TableCellValue>;

interface CollapsibleSection {
  title: string;
  key: string;
  data?: TableRow[]; // typed instead of unknown[] | undefined
  columns: string[];
}

interface CollapsibleTableProps {
  section: CollapsibleSection;
}

const isDateLike = (v: TableCellValue): v is string | number | Date =>
  typeof v === "string" || typeof v === "number" || v instanceof Date;

const formatCell = (col: string, value: TableCellValue): React.ReactNode => {
  if (value === null || value === undefined || value === "") return "-";

  if (col === "workout_date") {
    // only pass to Date if it's a string/number/Date
    if (isDateLike(value)) {
      const d = new Date(value);
      // invalid date guard
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString();
    }
    return "-";
  }

  // default render: strings/numbers/booleans
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const CollapsibleTable: React.FC<CollapsibleTableProps> = ({ section }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-700 rounded">
      {/* Header / Toggle */}
      <button
        className="w-full flex justify-between px-3 py-2 bg-gray-800 text-white font-semibold hover:bg-gray-700 rounded-t"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="text-xs">{section.title}</span>
        <span className="text-xs">{open ? "▲" : "▼"}</span> {/* even smaller arrow */}
      </button>

      {/* Table */}
      {open && section.data && section.data.length ? (
              <div className="overflow-auto">
                <table className="w-full text-[10px] text-left border-t border-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      {section.columns.map((col) => (
                        <th key={col} className="px-1.5 py-0.5 border-r border-gray-700 font-medium">
                          {col.replace(/_/g, " ").toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {section.data.map((item, idx) => {
                      return (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}>
                          {section.columns.map((col) => (
                            <td key={col} className="px-1.5 py-0.5 border-r border-gray-700">
                              {formatCell(col, item[col])}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : open ? (
              <div className="p-1.5 text-[10px] text-gray-400">No data available</div>
            ) : null}
    </div>
  );
};