"use client";

import { useState, useEffect } from "react";
import {
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { getTrainerClients } from "@/api/trainer";

interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  city?: string | null;
  home_state?: string | null;
  country?: string | null;
  profile_image?: string | null;
  gender?: string | null;
  height?: number | null;
  body_weight?: number | null;
  age?: number | null;
  fitness_goal?: string | null;
  training_status?: string | null;
  subscription_type?: string | null;
  body_measurements?: any;
  health_metrics?: any;
  body_fat_skinfolds?: any;
  activity_metrics?: any;
  alerts?: any[];
}


export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<"Analysis" | "History" | "Programs">("Analysis");
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(addDays(monthStart, -1 * monthStart.getDate()));
  const nextMonth = () => setCurrentMonth(addDays(monthEnd, 1));

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    async function fetchClients() {
      try {
        setLoading(true);
        const data = await getTrainerClients(token);

        console.log("Raw API data:", data); // 🔹 Debug incoming data

        const clientList: Client[] = data.map((req: any) => ({
          id: req.id,
          first_name: req.first_name,
          last_name: req.last_name,
          email: req.email,
          city: req.city,
          home_state: req.home_state,
          country: req.country,
          profile_image: req.profile_image,
          gender: req.gender,
          height: req.height,
          body_weight: req.body_weight,
          age: req.age,
          fitness_goal: req.fitness_goal,
          training_status: req.training_status,
          subscription_type: req.subscription_type,
          body_measurements: req.body_measurements,
          health_metrics: req.health_metrics,
          body_fat_skinfolds: req.body_fat_skinfolds,
          activity_metrics: req.activity_metrics,
          alerts: req.alerts,
        }));

        setClients(clientList);
        setSelectedClient(clientList[0] || null);
      } catch (err) {
        console.error("Failed to load clients:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  return (
    <div className="flex h-full min-h-screen bg-gray-900 text-white">
      {/* Left sidebar */}
      <div className="w-1/5 border-r border-gray-700 p-4 flex flex-col">
        <input
          type="text"
          placeholder="Search clients..."
          className="p-2 rounded bg-gray-800 mb-4 placeholder-gray-400 text-white"
        />
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-400 mt-4">Loading clients...</div>
          ) : (
            clients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full text-left px-3 py-2 rounded mb-1 hover:bg-gray-700 transition ${
                  selectedClient?.id === client.id ? "bg-gray-700" : ""
                }`}
              >
                {client.first_name} {client.last_name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* Top section split: Client details + Calendar */}
        <div className="flex gap-4">
        {/* Client details */}
        <div className="w-full md:w-1/3 bg-gray-800 p-4 rounded shadow flex flex-col gap-4">
          <h2 className="font-semibold text-lg mb-2">Client Details</h2>
          {selectedClient ? (
            <div className="flex flex-col md:flex-row gap-4">
              {/* Left: client info */}
              <div className="flex-1 flex flex-col gap-2">
                {/* Name */}
                <p className="text-xl font-semibold">
                  {selectedClient.first_name || "-"} {selectedClient.last_name || "-"}
                </p>

                {/* Email */}
                <p className="text-gray-300">{selectedClient.email || "-"}</p>

                {/* City & Home State */}
                <p className="text-gray-300">
                  {selectedClient.city || "-"}, {selectedClient.home_state || "-"}
                </p>

                {/* Other details */}
                <div className="flex flex-wrap gap-2 text-gray-300">
                  <span><strong>Gender:</strong> {selectedClient.gender || "-"}</span>
                  <span><strong>Height:</strong> {selectedClient.height ? `${selectedClient.height} cm` : "-"}</span>
                  <span><strong>Weight:</strong> {selectedClient.weight ? `${selectedClient.weight} kg` : "-"}</span>
                  <span><strong>Age:</strong> {selectedClient.age || "-"}</span>
                </div>

                {/* Fitness Goal */}
                <div className="mt-2 text-gray-300">
                  <span><strong>Fitness Goal:</strong> {selectedClient.fitness_goal || "-"}</span>
                </div>

                {/* Activity Metrics */}
                <div className="mt-2 text-gray-300 grid grid-cols-2 gap-2">
                  <span><strong>Workouts/week:</strong> {selectedClient.activity_metrics?.workouts_per_week ?? "-"}</span>
                  <span><strong>Runs/week:</strong> {selectedClient.activity_metrics?.runs_per_week ?? "-"}</span>
                  <span><strong>Avg daily steps:</strong> {selectedClient.activity_metrics?.average_daily_steps ?? "-"}</span>
                </div>
              </div>

              {/* Right: profile image */}
              <div className="flex-shrink-0 md:self-start self-center">
                <img
                  src={selectedClient.profile_image || "/placeholder-profile.png"}
                  alt={`${selectedClient.first_name} ${selectedClient.last_name}`}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Select a client to view details</p>
          )}
        </div>
          {/* Calendar */}
          <div className="flex-1 bg-gray-800 p-4 rounded shadow">
            <div className="flex justify-between items-center mb-2">
              <button onClick={prevMonth} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
                Prev
              </button>
              <div className="font-semibold text-lg">{format(currentMonth, "MMMM yyyy")}</div>
              <button onClick={nextMonth} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
                Next
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="font-semibold">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {days.map(day => (
                <div
                  key={day.toISOString()}
                  className={`h-16 flex items-center justify-center rounded cursor-pointer transition ${
                    isSameDay(day, new Date()) ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600"
                  } ${!isSameMonth(day, monthStart) ? "text-gray-500" : ""}`}
                >
                  {format(day, "d")}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs below top section */}
        <div className="flex gap-2">
          {["Analysis", "History", "Programs"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto rounded bg-gray-800 p-4">
          {activeTab === "Analysis" && <div>Analysis content here</div>}
          {activeTab === "History" && <div>History content here</div>}
          {activeTab === "Programs" && <div>Programs content here</div>}
        </div>
      </div>
    </div>
  );
}
