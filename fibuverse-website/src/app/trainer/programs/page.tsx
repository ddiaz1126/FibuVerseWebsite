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
import { getTrainerPrograms, getTrainerClients, getClientWeightsSessionData, getTrainerWorkouts } from "@/api/trainer";
import WorkoutEditor from "@/components/programs/WorkoutEditor";
import { Client, WorkoutListItem, WeightsSessionInsights } from '@/api/trainerTypes';
import { Program } from "@/api/trainerTypes";

export default function ProgramsPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [workoutDate, ] = useState(today);

  // Clients
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [weightsSessionInsights, setWeightsSessionInsights] = useState<WeightsSessionInsights | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ✅ Tabs state
  const [activeTab, setActiveTab] = useState<"workouts" | "programs">("workouts");

  // ✅ Programs state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [, setLoadingPrograms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, ] = useState<string | null>(null);

  const [trainerWorkouts, setTrainerWorkouts] = useState<WorkoutListItem[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

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


  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left sidebar: Programs & Workouts */}
      <div className="w-64 border-r border-gray-800 flex flex-col">
        {/* Tabs */}
        <div className="flex gap-2 bg-gray-800 p-0 rounded-lg">
          <button
            onClick={() => setActiveTab("workouts")}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 font-medium ${
              activeTab === "workouts" 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            Workouts
          </button>
          <button
            onClick={() => setActiveTab("programs")}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 font-medium ${
              activeTab === "programs" 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            Programs
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-800">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded bg-gray-800 p-2 text-sm"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "workouts" && (
            <>
              {loadingWorkouts && <div className="p-3 text-gray-400">Loading workouts...</div>}
              {!loadingWorkouts && trainerWorkouts.length === 0 && (
                <div className="p-3 text-gray-400">No assigned workouts found</div>
              )}
              {trainerWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800"
                  onClick={() => {
                    // Handle clicking on a workout to view/edit
                    console.log("Selected workout:", workout);
                  }}
                >
                  <div className="font-medium">{workout.workout_name}</div>
                  {/* <div className="text-sm text-gray-400 mt-1">
                    Client: {workout.workoutName || `ID: ${workout.client_id}`}
                  </div> */}
                  <div className="text-xs text-gray-500 mt-1">
                    {workout.workout_date 
                      ? new Date(workout.workout_date).toLocaleDateString() 
                      : 'No date'}
                    </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "programs" && (
            <>
              {loading && <div className="p-3 text-gray-400">Loading programs...</div>}
              {error && <div className="p-3 text-red-500">{error}</div>}
              {!loading && !error && programs.length === 0 && (
                <div className="p-3 text-gray-400">No programs found</div>
              )}
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="p-3 hover:bg-gray-800 cursor-pointer"
                >
                  {program.name}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Middle column: Workout Editor */}
      <WorkoutEditor/>

      {/* Right column: Calendar + Client Analysis */}
      <div className="w-96 flex flex-col border-l border-gray-800">
        {/* Calendar */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
                )
              }
              className="px-2 py-1 rounded hover:bg-gray-800"
            >
              ←
            </button>
            <h2 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
                )
              }
              className="px-2 py-1 rounded hover:bg-gray-800"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center font-semibold">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isWorkoutDay = isSameDay(day, workoutDate);
              return (
                <div
                  key={day.toISOString()}
                  className={`h-12 flex flex-col items-center justify-center rounded cursor-pointer transition ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 hover:bg-gray-700"
                  } ${!isSameMonth(day, monthStart) ? "text-gray-500" : ""}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div>{format(day, "d")}</div>
                  {isWorkoutDay && (
                    <div className="h-1 w-1 bg-green-400 rounded-full mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-64 p-4 bg-gray-900 text-white flex flex-col gap-4">
        {/* Title */}
        <h3 className="text-lg font-bold">Select Client</h3>
        
        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={handleDropdownClick}
            className="w-full flex justify-between items-center px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 focus:outline-none"
          >
            {selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : "None"}
            <span className={`transform transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <ul className="absolute mt-1 w-full bg-gray-800 rounded shadow-lg z-10 max-h-60 overflow-auto">
              {clients.length === 0 ? (
                <li className="px-4 py-2 text-gray-400">No clients loaded</li>
              ) : (
                clients.map((client) => (
                  <li
                    key={client.id}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
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
        <p className="text-sm text-gray-400 whitespace-nowrap text-ellipsis">
          Select a client to view metrics while building their workout.
        </p>
      </div>

        {/* Client Analysis */}
        <div className="flex-1 p-4 flex flex-col gap-4">

          {/* ----------------- Recent 3 Weeks Weights Summary ----------------- */}
          <section className="space-y-4 max-h-[600px] overflow-auto p-2">
            <h2 className="text-2xl font-bold mb-4">Recent 3 Weeks Summary</h2>
            <div className="mb-4 text-sm text-gray-400">
              <span>Total Workouts: {weightsSessionInsights?.recent_3_weeks.total_workouts}</span>
              <span className="ml-4">Average: {weightsSessionInsights?.recent_3_weeks.workouts_per_week} workouts/week</span>
              <span className="ml-4">
                Period: {weightsSessionInsights?.recent_3_weeks.cutoff_date
                  ? new Date(weightsSessionInsights.recent_3_weeks.cutoff_date).toLocaleDateString()
                  : "-"} - Today
              </span>
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
        <span>{section.title}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {/* Table */}
      {open && section.data && section.data.length ? (
        <div className="overflow-auto"> {/* make scrollable if wide */}
          <table className="w-full text-sm text-left border-t border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                {section.columns.map((col) => (
                  <th key={col} className="px-2 py-1 border-r border-gray-700">
                    {col.replace(/_/g, " ").toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {section.data.map((item, idx) => {
                // item is already TableRow so no any used
                return (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}>
                    {section.columns.map((col) => (
                      <td key={col} className="px-2 py-1 border-r border-gray-700">
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
        <div className="p-2 text-gray-400">No data available</div>
      ) : null}
    </div>
  );
};