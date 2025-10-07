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
import { Plus, X, Copy, Trash2, Search, Calendar, Dumbbell } from 'lucide-react';
import { getTrainerWorkouts, getClientWeightsSessionData, getTrainerClients } from "@/api/trainer";
import { Client, WorkoutListItem, Workout, WeightsSessionInsights } from '@/api/trainerTypes';
import { useRouter } from 'next/navigation';
import WorkoutEditor from "@/components/programs/WorkoutEditor";
import FibuChat from "@/components/FibuChat";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";

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
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320); // default width
  const [isResizing, setIsResizing] = useState(false);
  const calendarDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const router = useRouter();

  // Right Sidebar
  const today = new Date();
  const [workoutDate, ] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [weightsSessionInsights, setWeightsSessionInsights] = useState<WeightsSessionInsights | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(360);


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

  const duplicateWeek = (weekIndex) => {
    const newWeek = { id: Date.now(), days: [...weeks[weekIndex].days] };
    const newWeeks = [...weeks];
    newWeeks.splice(weekIndex + 1, 0, newWeek);
    setWeeks(newWeeks);
  };

  const deleteWeek = (weekIndex) => {
    if (weeks.length > 1) {
      setWeeks(weeks.filter((_, i) => i !== weekIndex));
    }
  };

  const handleWorkoutDrop = (e, weekIndex, dayIndex) => {
    e.preventDefault();
    if (draggedWorkout) {
      const newWeeks = [...weeks];
      newWeeks[weekIndex].days[dayIndex] = draggedWorkout;
      setWeeks(newWeeks);
      setDraggedWorkout(null);
    }
  };

  const clearCell = (weekIndex, dayIndex) => {
    const newWeeks = [...weeks];
    newWeeks[weekIndex].days[dayIndex] = null;
    setWeeks(newWeeks);
  };

  const getWorkoutById = (id) => trainerWorkouts.find(w => w.id === id);

  const handleSave = () => {
    const programWorkouts = [];
    let dayCounter = 1;

    weeks.forEach((week, weekIndex) => {
      week.days.forEach((workoutId, dayIndex) => {
        if (workoutId !== null) {
          programWorkouts.push({
            program: null,
            week_index: weekIndex + 1,
            day_index: dayCounter,
            order: dayCounter,
            date: null,
            workout: getWorkoutById(workoutId)
          });
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
    alert('Program saved! Check console for data structure.');
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


return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar - Workout Library */}
        <div
          className="border-r border-gray-800 flex flex-col bg-gray-900"
          style={{ width: sidebarWidth }}
        >
          {isCreatingWorkout ? (
            <>
              <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray9800">
                <h2 className="text-white font-bold text-lg">FibuVerse</h2>
                <button
                  onClick={() => setIsCreatingWorkout(false)}
                  className="text-sm text-red-400 hover:text-red-600"
                >
                  Cancel
                </button>
              </div>
              <WorkoutEditor />
            </>
          ) : (
          // Show workout list when NOT creating
          <>
            {/* Title */}
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-lg font-bold text-white">FibuVerse</h2>
            </div>

            {/* Create Workout Button */}
            <div className="p-2">
              <button
                onClick={() => setIsCreatingWorkout(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-md text-sm font-medium shadow-md transition-all duration-200"
              >
                + Create Workout
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-800">
              <input
                type="text"
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded bg-gray-800 p-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto text-sm">
              {loadingWorkouts ? (
                <div className="p-4 text-center text-gray-400">Loading...</div>
              ) : trainerWorkouts.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No workouts found</div>
              ) : (
                trainerWorkouts
                  .filter(workout =>
                    searchTerm === "" ||
                    workout.workout_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    workout.workout_type?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(workout => (
                    <div
                      key={workout.id}
                      draggable
                      onDragStart={() => setDraggedWorkout(workout.id)}
                      onDragEnd={() => setDraggedWorkout(null)}
                      className="p-3 mx-2 my-1 hover:bg-gray-800 rounded cursor-grab active:cursor-grabbing border-b border-gray-800 transition-colors"
                    >
                      <div className="font-medium text-sm text-white">{workout.workout_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{workout.workout_type}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {workout.num_exercises || 0} exercises • {workout.duration || 0} min
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
              💡 Drag workouts to the grid
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
        <div className="bg-gray-800 border-b border-gray-700 p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <input
              type="text"
              placeholder="Program Name"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="text-2xl font-bold w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-white placeholder-gray-500"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => router.push('/trainer/programs')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!programName}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Assign & Save
              </button>
              <button
                onClick={handleSave}
                disabled={!programName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Save Template
              </button>
            </div>
          </div>
          
          <textarea
            placeholder="Program description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
          />
          
          <div className="text-sm text-gray-400 mt-4">
            {weeks.length} {weeks.length === 1 ? 'week' : 'weeks'} • Template
          </div>
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
                      <th className="px-4 py-4 w-24"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((week, weekIndex) => (
                      <tr key={week.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="px-6 py-4 font-medium text-gray-300 align-top">
                          Week {weekIndex + 1}
                        </td>
                        {week.days.map((workoutId, dayIndex) => {
                          const workout = workoutId ? getWorkoutById(workoutId) : null;
                          
                          return (
                            <td key={dayIndex} className="px-4 py-4">
                              <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleWorkoutDrop(e, weekIndex, dayIndex)}
                                className={`relative w-full h-48 rounded border-2 transition-all ${
                                  workout 
                                    ? 'bg-blue-900/30 border-blue-600 hover:border-blue-500' 
                                    : 'bg-gray-700 border-dashed border-gray-600 hover:border-blue-500'
                                }`}
                              >
                                {workout ? (
                                  <div className="p-3 h-full flex flex-col">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div className="text-sm font-semibold text-white line-clamp-2 flex-1">
                                        {workout.workout_name}
                                      </div>
                                      <button
                                        onClick={() => clearCell(weekIndex, dayIndex)}
                                        className="flex-shrink-0 p-1 hover:bg-blue-800 rounded"
                                      >
                                        <X className="w-4 h-4 text-gray-400" />
                                      </button>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-auto">
                                      {workout.num_exercises} exercises
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center text-gray-500">
                                    <Calendar className="w-6 h-6" />
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => duplicateWeek(weekIndex)}
                              className="p-2 hover:bg-blue-600/20 rounded transition-colors"
                              title="Duplicate week"
                            >
                              <Copy className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => deleteWeek(weekIndex)}
                              className="p-2 hover:bg-red-400 rounded"
                              title="Delete week"
                              disabled={weeks.length === 1}
                            >
                              <Trash2 className={`w-4 h-4 ${weeks.length === 1 ? 'text-gray-600' : 'text-red-700'}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Week Button */}
            <button
              onClick={addWeek}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Week
            </button>
          </div>
        </div>
      </div>
            {/* Right column: Calendar + Client Analysis */}
            <div className={`flex flex-col border-l border-gray-800 transition-all duration-300 ${isRightPanelOpen ? 'w-96' : 'w-12'}`}>
              {/* Toggle Button */}
              <button
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className="p-3 hover:bg-gray-800 border-b border-gray-800 flex items-center justify-center"
                title={isRightPanelOpen ? "Collapse panel" : "Expand panel"}
              >
                <span className="text-lg">{isRightPanelOpen ? '→' : '←'}</span>
              </button>

              {isRightPanelOpen && (
                <>
              {/* Calendar */}
              <div className="p-2 border-b border-gray-800">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
                      )
                    }
                    className="px-1 py-0.5 rounded hover:bg-gray-800"
                  >
                    ←
                  </button>
                  <h2 className="text-sm font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
                      )
                    }
                    className="px-1 py-0.5 rounded hover:bg-gray-800"
                  >
                    →
                  </button>
                </div>
      
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 text-[10px] mb-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="text-center font-semibold">{d}</div>
                  ))}
                </div>
      
                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isWorkoutDay = isSameDay(day, workoutDate);
                    return (
                      <div
                        key={day.toISOString()}
                        className={`h-10 flex flex-col items-center justify-center rounded cursor-pointer transition ${
                          isSelected ? "bg-blue-600 text-white" : "bg-gray-800 hover:bg-gray-700"
                        } ${!isSameMonth(day, monthStart) ? "text-gray-500" : ""}`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className="text-xs">{format(day, "d")}</div>
                        {isWorkoutDay && <div className="h-1 w-1 bg-green-400 rounded-full mt-1" />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="w-64 p-4 bg-gray-900 text-white flex flex-col gap-4">
              {/* Title */}
              <h3 className="text-sm font-semibold mb-1">Select Client</h3>
      
              {/* Dropdown */}
              <div className="relative">
                <button
                  onClick={handleDropdownClick}
                  className="w-full flex justify-between items-center px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 text-sm focus:outline-none"
                >
                  {selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : "None"}
                  <span className={`transform transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>
      
                {/* Dropdown menu */}
                {dropdownOpen && (
                  <ul className="absolute mt-1 w-full bg-gray-800 rounded shadow-lg z-10 max-h-48 overflow-auto text-sm">
                    {clients.length === 0 ? (
                      <li className="px-3 py-1 text-gray-400">No clients loaded</li>
                    ) : (
                      clients.map((client) => (
                        <li
                          key={client.id}
                          className="px-3 py-1 hover:bg-gray-700 cursor-pointer"
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
              <p className="text-xs text-gray-400 whitespace-nowrap text-ellipsis">
                Select a client to view metrics while building their workout.
              </p>
              </div>
      
              {/* Client Analysis */}
              <div className="flex-1 p-1 flex flex-col gap-2">
      
                {/* ----------------- Recent 3 Weeks Weights Summary ----------------- */}
                <section className="space-y-2 max-h-[450px] overflow-auto p-1">
                  <h2 className="text-lg font-semibold mb-1">Recent 3 Weeks Summary</h2>
      
                  <div className="mb-1 text-[10px] text-gray-400 flex flex-wrap gap-2">
                    <span>Total: {weightsSessionInsights?.recent_3_weeks.total_workouts}</span>
                    <span>Avg: {weightsSessionInsights?.recent_3_weeks.workouts_per_week}/week</span>
                    <span>
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
              </>
            )}
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