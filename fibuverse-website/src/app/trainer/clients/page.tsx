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
import { getTrainerClients, getClientWeightsMetaData, getClientWeightsSessionData, getClientCardioMetaData, getClientCardioSessionData, getClientNutrittionData, getClientMetricsData } from "@/api/trainer";
import WeightsAnalysisTab from "@/components/clients/WeightsAnalysisTab";
import HistoryTab from "@/components/clients/HistoryTab";
import ProgramsTab from "@/components/clients/ProgramsTab";
import CardioAnalysisTab from "@/components/clients/CardioAnalysisTab";
import NutritionAnalysisTab from "@/components/clients/NutritionAnalysisTab";
import ClientMetricsTab from "@/components/clients/ClientMetricsTab";
import { useRouter } from "next/navigation"; 

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
  cardio_sessions: req.cardio_sessions,     
  weight_workouts: req.weight_workouts, 
}


export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [weightsMeta, setWeightsMeta] = useState<any>(null); // store insights
  const [weightsSessionInsights, setWeightsSessionInsights] = useState<any>(null);
  const [cardioMeta, setCardioMeta] = useState<any>(null); // store insights
  const [cardioSessionInsights, setCardioSessionInsights] = useState<any>(null);
  const [nutritionMeta, setNutritionMeta] = useState<any>(null); // store insights
  const [metricsData, setMetricsData] = useState<any>({});

  const [activeTab, setActiveTab] = useState<"Client Metrics" | "Weights Analysis" | "Cardio Analysis" | "History" | "Programs">("Client Metrics");
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(addDays(monthStart, -1 * monthStart.getDate()));
  const nextMonth = () => setCurrentMonth(addDays(monthEnd, 1));
  const router = useRouter();

  // Extract session dates
  const cardioDates = metricsData.cardio_sessions?.map((s: any) => s.cardio_date) || [];
  const weightDates = metricsData.weight_workouts?.map((w: any) => w.workout_date) || [];

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

  // Retrieve Client Weigths Workout Data
  useEffect(() => {
    if (!selectedClient) return;

    async function fetchWeightsMeta() {
      try {
        setLoading(true);
        const data = await getClientWeightsMetaData(selectedClient.id);
        console.log("Weights metadata:", data);
        setWeightsMeta(data.data); // assuming your API returns { status, data }
      } catch (err) {
        console.error("Failed to fetch client weights metadata:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeightsMeta();
  }, [selectedClient]);

  // Retrieve Clients Weight Session Data
  useEffect(() => {
    if (!selectedClient) return;

    async function fetchWeightsSessionInsights() {
      try {
        setLoading(true);
        const data = await getClientWeightsSessionData(selectedClient.id); // your frontend function
        console.log("Client weights session insights:", data);
        setWeightsSessionInsights(data.data); // assuming API returns { status, data }
      } catch (err) {
        console.error("Failed to fetch client weights session insights:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeightsSessionInsights();
  }, [selectedClient]);

  // Retrieve Client Cardio Workout Data
  useEffect(() => {
    if (!selectedClient) return;

    async function fetchCardioMeta() {
      try {
        setLoading(true);
        const data = await getClientCardioMetaData(selectedClient.id);
        console.log("Cardio metadata:", data);
        setCardioMeta(data.data); // assuming your API returns { status, data }
      } catch (err) {
        console.error("Failed to fetch client cardio metadata:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCardioMeta();
  }, [selectedClient]);

    // Retrieve Clients Weight Session Data
  useEffect(() => {
    if (!selectedClient) return;

    async function fetchCardioSessionInsights() {
      try {
        setLoading(true);
        const data = await getClientCardioSessionData(selectedClient.id); // your frontend function
        console.log("Client weights session insights:", data);
        setCardioSessionInsights(data.data); // assuming API returns { status, data }
      } catch (err) {
        console.error("Failed to fetch client cardio session insights:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCardioSessionInsights();
  }, [selectedClient]);

  // Retrieve Client Nutrition Workout Data
  useEffect(() => {
    if (!selectedClient) return;

    async function fetchNutritionMeta() {
      try {
        setLoading(true);
        const data = await getClientNutrittionData(selectedClient.id);
        console.log("Nutrition metadata:", data);
        setNutritionMeta(data.data); // assuming your API returns { status, data }
      } catch (err) {
        console.error("Failed to fetch client Nutrition:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNutritionMeta();
  }, [selectedClient]);

    // Retrieve Client Metrics Workout Data
    useEffect(() => {
      if (!selectedClient) return;

      async function fetchMetricsData() {
        try {
          setLoading(true);
          const data = await getClientMetricsData(selectedClient.id);
          console.log("Metrics metadata:", data);
          setMetricsData(data); // assuming your API returns { status, data }
        } catch (err) {
          console.error("Failed to fetch client metrics:", err);
        } finally {
          setLoading(false);
        }
      }

      fetchMetricsData();
    }, [selectedClient]);

  const tabs = [
    { label: "Client Metrics",
      component: ClientMetricsTab,
      props: { metricsData }, 
    },
    {
      label: "Weights Analysis",
      component: WeightsAnalysisTab,
      props: { weightsMeta, weightsSessionInsights },
    },
    {
      label: "Cardio Analysis",
      component: CardioAnalysisTab,
      props: { cardioMeta, cardioSessionInsights },
    },
    {
      label: "Nutrition Analysis",
      component: NutritionAnalysisTab,
      props: { nutritionMeta }
    },
    { 
      label: "History", 
      component: HistoryTab, 
      props: { 
        cardioSessions: metricsData.cardio_sessions, 
        weightWorkouts: metricsData.weight_workouts 
      } 
    },
      { label: "Programs", component: ProgramsTab, props: {} },
    ];

  return (
    <div className="flex h-full min-h-screen bg-gray-900 text-white">
      {/* Left sidebar */}
      <div className="w-1/5 border-r border-gray-700 p-4 flex flex-col">
        {/* Add Client Button */}
        <button
          onClick={() => router.push("/trainer/clients/add-client")} // adjust route if needed
          className="mb-4 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          + Add Client
        </button>

        {/* Search Input */}
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
        <div className="w-full md:w-1/3 bg-gray-800 p-4 rounded-2xl shadow-md flex flex-col gap-4">
          <h2 className="font-semibold text-xl border-b border-gray-700 pb-2">Client Details</h2>

          {selectedClient ? (
            <div className="flex flex-col gap-4">
              {/* Top section: avatar + name */}
              <div className="flex items-center gap-4">
                <img
                  src={selectedClient.profile_image || "/placeholder-profile.png"}
                  alt={`${selectedClient.first_name} ${selectedClient.last_name}`}
                  className="w-16 h-16 rounded-full object-cover border border-gray-600"
                />
                <div>
                  <p className="text-lg font-semibold">
                    {selectedClient.first_name || "-"} {selectedClient.last_name || "-"}
                  </p>
                  <p className="text-gray-300 text-sm">{selectedClient.email || "-"}</p>
                  <p className="text-gray-400 text-sm">
                    {selectedClient.city || "-"}, {selectedClient.home_state || "-"}
                  </p>
                </div>
              </div>

              {/* Info boxes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="block text-xs text-gray-400">Gender</span>
                  <span className="font-medium">{selectedClient.gender || "-"}</span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="block text-xs text-gray-400">Age</span>
                  <span className="font-medium">{selectedClient.age || "-"}</span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="block text-xs text-gray-400">Height</span>
                  <span className="font-medium">
                    {metricsData.body_measurements?.[0]?.height_cm
                      ? `${metricsData.body_measurements[0].height_cm} cm`
                      : "-"}
                  </span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="block text-xs text-gray-400">Weight</span>
                  <span className="font-medium">{metricsData.body_measurements?.[0]?.weight_kg
                       ? `${metricsData.body_measurements?.[0]?.weight_kg
                        } kg` : "-"}</span>
                </div>
              </div>

              {/* Fitness goal */}
              <div className="bg-gray-700 p-3 rounded-lg">
                <span className="block text-xs text-gray-400">Fitness Goal</span>
                <span className="font-medium">{selectedClient.fitness_goal || "-"}</span>
              </div>

              {/* Activity Metrics */}
              <div className="bg-gray-700 p-3 rounded-lg">
                <span className="block text-xs text-gray-400 mb-1">Activity Metrics</span>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span><strong>Workouts/wk:</strong> {selectedClient.activity_metrics?.workouts_per_week ?? "-"}</span>
                  <span><strong>Runs/wk:</strong> {selectedClient.activity_metrics?.runs_per_week ?? "-"}</span>
                  <span><strong>Steps/day:</strong> {selectedClient.activity_metrics?.average_daily_steps ?? "-"}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Select a client to view details</p>
          )}
        </div>

          {/* Calendar */}
          <div className="flex-1 bg-gray-800 p-4 rounded-2xl shadow-md">
            {/* Header with navigation */}
            <div className="flex justify-between items-center mb-8">
              <button 
                onClick={prevMonth} 
                className="px-3 py-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                ← Prev
              </button>
              <div className="font-bold text-lg">{format(currentMonth, "MMMM yyyy")}</div>
              <button 
                onClick={nextMonth} 
                className="px-3 py-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Next →
              </button>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mb-3 items-center text-xs justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-300">Cardio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
                <span className="text-gray-300">Weights</span>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="font-semibold text-gray-400 text-xs">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 grid-rows-6 gap-1.5">
              {days.map(day => {
                const dayStr = format(day, "yyyy-MM-dd");
                const hasCardio = cardioDates.includes(dayStr);
                const hasWeight = weightDates.includes(dayStr);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, monthStart);

                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all
                      ${isToday 
                        ? "bg-blue-600 text-white shadow-lg" 
                        : "bg-gray-700 hover:bg-gray-600"
                      }
                      ${!isCurrentMonth ? "opacity-40" : ""}
                    `}
                  >
                    <span className={`text-sm ${isToday ? "font-bold" : "font-medium"}`}>
                      {format(day, "d")}
                    </span>
                    {(hasCardio || hasWeight) && (
                      <div className="flex gap-1 mt-0.5">
                        {hasCardio && <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>}
                        {hasWeight && <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabs below top section */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {tabs.map(({ label }) => (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  activeTab === label
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto bg-gray-800 p-4 rounded-2xl shadow-md">
            {tabs.map(({ label, component: Component, props }) =>
              activeTab === label && selectedClient ? (
                <Component
                  key={label}
                  clientId={selectedClient.id}
                  clientName={`${selectedClient.first_name} ${selectedClient.last_name}`}
                  clientGender={selectedClient.gender}
                  clientAge={selectedClient.age}
                  {...props}
                />
              ) : null
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
