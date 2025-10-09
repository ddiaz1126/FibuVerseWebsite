"use client";

import { useEffect, useState } from "react";
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
import { getTrainerPrograms, getTrainerClients, getClientWeightsSessionData, getTrainerWorkouts, getSpecificWorkout, getClientMetricsData } from "@/api/trainer";
import WorkoutEditor from "@/components/programs/WorkoutEditor";
import { Client, WorkoutListItem, WeightsSessionInsights, Workout, CardioSession, WeightWorkout, ClientMetricsData } from '@/api/trainerTypes';
import { Program } from "@/api/trainerTypes";
import { WorkoutDetailView } from "@/components/programs/WorkoutDetailView"
import ProgramDetailView from "@/components/programs/ProgramDetailView"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

import { useRouter } from 'next/navigation';

export default function ProgramsPage() {
  const router = useRouter();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today);
  // const [workoutDate, ] = useState(today);

  // Clients
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [weightsSessionInsights, setWeightsSessionInsights] = useState<WeightsSessionInsights | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [metricsData, setMetricsData] = useState<ClientMetricsData | null>(null);

  // ✅ Tabs state
  const [activeTab, setActiveTab] = useState<"workouts" | "programs">("workouts");

  // ✅ Programs state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [, setLoadingPrograms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, ] = useState<string | null>(null);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  const [trainerWorkouts, setTrainerWorkouts] = useState<WorkoutListItem[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);

  // For Programs tab - fetch templates
  useEffect(() => {
    if (activeTab === "programs") {
      async function fetchPrograms() {
        try {
          setLoadingPrograms(true);
          const data = await getTrainerPrograms(); // Same endpoint but filter by prebuilt_workout=1
          console.log("Trainer programs:", data);
          setPrograms(data); // Filter templates
        } catch (err) {
          console.error("Failed to fetch programs:", err);
        } finally {
          setLoadingPrograms(false);
        }
      }
      fetchPrograms();
    }
  }, [activeTab]);

  // For Workouts tab - fetch assigned workouts (where clientId is null)
  useEffect(() => {
    if (activeTab === "workouts") {
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
    }
  }, [activeTab]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // --------- Clients ---------------
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

  const handleWorkoutSelect = async (workoutId: number) => {
    try {
      const workout = await getSpecificWorkout(workoutId);
      console.log("Selected workout:", workout);
      setSelectedProgram(null); // Clear program selection
      // Here you can set state, e.g.:
      setSelectedWorkout(workout);
    } catch (err) {
      console.error("Failed to fetch workout by ID:", err);
    }
  };

  // Add handler for program selection
  const handleProgramSelect = (programId: number) => {
    setSelectedProgram(programId);
    setSelectedWorkout(null); // Clear workout selection
  };


  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left sidebar: Programs & Workouts */}
      <div className="flex-none w-1/4 md:w-1/6 lg:w-1/6 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 p-3 flex flex-col rounded-xl m-2">
        {/* Tabs */}
        <div className="mb-2 flex-shrink-0">
          <div className="flex gap-1 bg-gray-900/50 p-0.5 rounded-lg border border-gray-700">
            <button
              onClick={() => setActiveTab("workouts")}
              className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all duration-200 text-[11px] ${
                activeTab === "workouts"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-700/30 hover:text-white"
              }`}
            >
              Workouts
            </button>
            <button
              onClick={() => setActiveTab("programs")}
              className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all duration-200 text-[11px] ${
                activeTab === "programs"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-700/30 hover:text-white"
              }`}
            >
              Programs
            </button>
          </div>
        </div>

        {/* Create Button */}
        {["workouts", "programs"].includes(activeTab) && (
          <button
            onClick={() => {
              if (activeTab === "workouts") {
                setSelectedProgram(null);
                setSelectedWorkout(null);
              } else {
                router.push('/create-program');
              }
            }}
            className="mb-3 flex-shrink-0 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-semibold shadow-sm transition-all duration-200 text-xs flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create {activeTab === "workouts" ? "Workout" : "Program"}
          </button>
        )}

        {/* Search */}
        <div className="relative mb-3 flex-shrink-0">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 pl-8 text-xs rounded-lg bg-gray-900/50 border border-gray-700 placeholder-gray-500 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          <svg 
            className="w-4 h-4 text-gray-500 absolute left-2.5 top-2.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-0">
          {activeTab === "workouts" && (
            <>
              {loadingWorkouts && (
                <div className="text-center text-gray-400 mt-4 text-xs">
                  <div className="animate-pulse">Loading workouts...</div>
                </div>
              )}
              {!loadingWorkouts && trainerWorkouts.length === 0 && (
                <div className="text-center text-gray-500 mt-4 text-xs">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No workouts yet</p>
                </div>
              )}
              <div className="divide-y divide-gray-700/30">
                {trainerWorkouts.map((workout) => (
                  <button
                    key={workout.id}
                    onClick={() => handleWorkoutSelect(workout.id!)}
                    className={`w-full text-left px-3 py-2.5 hover:bg-gray-700/30 transition-all ${
                      selectedWorkout?.workoutId === workout.id  // or selectedProgram === program.id
                        ? "bg-gray-700/50 border-l-2 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate mb-0.5">
                          {workout.workout_name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {workout.workout_date
                            ? new Date(workout.workout_date).toLocaleDateString()
                            : "No date"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === "programs" && (
            <>
              {loading && (
                <div className="text-center text-gray-400 mt-4 text-xs">
                  <div className="animate-pulse">Loading programs...</div>
                </div>
              )}
              {error && (
                <div className="text-center text-red-500 mt-4 text-xs">{error}</div>
              )}
              {!loading && !error && programs.length === 0 && (
                <div className="text-center text-gray-500 mt-4 text-xs">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p>No programs yet</p>
                </div>
              )}
              <div className="divide-y divide-gray-700/30">
                {programs.map((program) => (
                  <button
                    key={program.id}
                    onClick={() => handleProgramSelect(program.id)}
                    className={`w-full text-left px-3 py-2.5 hover:bg-gray-700/30 transition-all ${
                      selectedProgram === program.id
                        ? "bg-gray-700/50 border-l-2 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate mb-0.5">
                          {program.name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {program.is_template ? "Template" : "Assigned"} •{" "}
                          {program.program_workouts?.length || 0} workouts
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

        {/* Middle column */}
        <div className="flex-1 overflow-hidden">
          {selectedProgram ? (
            <ProgramDetailView programId={selectedProgram} />
          ) : selectedWorkout ? (
            <WorkoutDetailView workout={selectedWorkout} />
          ) : (
            <WorkoutEditor />
          )}
        </div>

      {/* Right column: Calendar + Client Analysis */}
      <div className="flex h-full text-sm relative">  
        {/* Collapse/Expand Button */}
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
        } flex flex-col bg-gray-800/50 backdrop-blur-sm border-l border-gray-700 rounded-l-xl ml-2 my-2`}>

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
            <p className="text-[10px] text-gray-500 mt-2">
              View client metrics while building workouts
            </p>
          </div>

          {/* Client Analysis */}
          <div className="flex-1 p-3 overflow-auto">
            {/* Recent 3 Weeks Weights Summary */}
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
    </div>
  );
}


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