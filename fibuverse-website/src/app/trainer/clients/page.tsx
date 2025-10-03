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

import { getTrainerClients, getClientWeightsMetaData, getClientWeightsSessionData, getClientCardioMetaData, getClientCardioSessionData, getClientMetricsData } from "@/api/trainer";
import { Client, WeightsMeta, WeightsSessionInsights } from '@/api/trainerTypes';
import WeightsAnalysisTab from "@/components/clients/WeightsAnalysisTab";
import HistoryTab from "@/components/clients/HistoryTab";
import ProgramsTab from "@/components/clients/ProgramsTab";
import CardioAnalysisTab from "@/components/clients/CardioAnalysisTab";
// import NutritionAnalysisTab from "@/components/clients/NutritionAnalysisTab";
import ClientMetricsTab from "@/components/clients/ClientMetricsTab";
import { useRouter } from "next/navigation"; 
import Image from "next/image";

interface HealthMetric {
  created_at: string; // ISO date string
  resting_hr?: number;
  max_hr?: number;
  vo2max?: number;
  hrv_ms?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  fat_mass?: number;
  lean_body_mass?: number;
  fev_1?: number;
  fvc_ratio?: number;
  o2_saturation?: number;
}

interface BodyMeasurement {
  created_at: string; // ISO date string
  weight_kg: number;
  height_cm: number;
  bmi: number;
  waist_cm: number;
  hip_cm: number;
  waist_to_height_ratio: number;
  body_fat_percentage: number;
}
interface Skinfold {
  created_at: string; // ISO date string
  chest: number;
  abdomen: number;
  thigh: number;
  triceps: number;
  subscapular: number;
  midaxillary: number;
  biceps: number;
  calf: number;
  suprailiac: number;
}
interface FitnessTest {
  created_at: string; // ISO date string
  sit_and_reach_cm: number;
  hand_dynamometer_kg: number;
  plank_hold_seconds: number;
  wall_sit_seconds: number;
  balance_test_seconds: number;
  push_ups_test: number;
  sit_ups_test: number;
  pull_ups_test: number;
  bench_press_1rm_kg: number;
  leg_press_1rm_kg: number;
}

interface CardioSession {
  id: number;
  cardio_name: string;
  cardio_date: string; // ISO date
  cardio_start_time?: string | null;
  cardio_end_time?: string | null;
  cardio_type?: string | null;
  duration?: number | null;
  distance?: number | null;
  avg_pace?: number | null;
  avg_heart_rate?: number | null;
  avg_speed?: number | null;
  max_heart_rate?: number | null;
  max_pace?: number | null;
  max_speed?: number | null;
  avg_altitude?: number | null;
  elevation_gain?: number | null;
  calories_burned?: number | null;
  notes?: string | null;
  created_at: string;
}

interface WeightWorkout {
  id: number;
  workout_name: string;
  workout_date?: string | null;
  duration?: number | null;
  num_exercises?: number | null;
  notes?: string | null;
  created_at: string;
}

interface ClientMetricsData {
  body_measurements?: BodyMeasurement[];  // <-- array
  health_metrics?: HealthMetric[];        // <-- array
  body_fat_skinfolds?: Skinfold[];       // <-- array
  fitness_tests?: FitnessTest[];         // <-- array
  cardio_sessions?: CardioSession[];
  weight_workouts?: WeightWorkout[];
}

interface WeekStat {
  week: string; // ISO date string from TruncWeek
  total?: number;             // for sessions_per_week
  total_distance?: number;    // for distance_per_week
  avg_pace?: number;          // for avg_pace_per_week
  avg_hr?: number;            // for avg_hr_per_week
  total_calories?: number;    // for calories_per_week
}

interface CardioTypeStat {
  cardio_type: string;
  count: number;
}

interface CardioMetadata {
  sessions_per_week: WeekStat[];
  distance_per_week: WeekStat[];
  avg_pace_per_week: WeekStat[];
  avg_hr_per_week: WeekStat[];
  calories_per_week: WeekStat[];
  cardio_types: CardioTypeStat[];
}

interface CardioSessionPoint {
  cardio__cardio_name: string;
  bucket_start: string;       // ISO datetime
  avg_heart_rate?: number;
  avg_pace?: number;
  avg_speed?: number;
  avg_altitude?: number;
  avg_latitude?: number;
  avg_longitude?: number;
  points_count?: number;
}

interface CardioSessionInsights {
  avg_heart_rate_over_time: Array<Pick<CardioSessionPoint, "cardio__cardio_name" | "bucket_start" | "avg_heart_rate">>;
  avg_pace_over_time: Array<Pick<CardioSessionPoint, "cardio__cardio_name" | "bucket_start" | "avg_pace">>;
  avg_speed_over_time: Array<Pick<CardioSessionPoint, "cardio__cardio_name" | "bucket_start" | "avg_speed">>;
  avg_altitude_over_time: Array<Pick<CardioSessionPoint, "cardio__cardio_name" | "bucket_start" | "avg_altitude">>;
  location_points: Array<Pick<CardioSessionPoint, "cardio__cardio_name" | "bucket_start" | "avg_latitude" | "avg_longitude">>;
  points_count_over_time: Array<Pick<CardioSessionPoint, "cardio__cardio_name" | "bucket_start" | "points_count">>;
}
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [weightsMeta, setWeightsMeta] = useState<WeightsMeta | null>(null);
  const [weightsSessionInsights, setWeightsSessionInsights] = useState<WeightsSessionInsights | null>(null);
  const [cardioMeta, setCardioMeta] = useState<CardioMetadata | null>(null);
  const [cardioSessionInsights, setCardioSessionInsights] = useState<CardioSessionInsights | null>(null);
  // const [nutritionMeta, setNutritionMeta] = useState<NutritionMetadata | null>(null);
  const [metricsData, setMetricsData] = useState<ClientMetricsData | null>(null);

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
  const cardioDates = metricsData?.cardio_sessions?.map((s: CardioSession) => s.cardio_date) || [];
  const weightDates = metricsData?.weight_workouts?.map((w: WeightWorkout) => w.workout_date) || [];
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

  async function fetchClients() {
    try {
      setLoading(true);
      const data = await getTrainerClients();

      console.log("Raw API data:", data);

      const clientList = data as Client[];

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

    const clientId = selectedClient.id; // Store the id

    async function fetchWeightsMeta() {
      try {
        setLoading(true);
        const data = await getClientWeightsMetaData(clientId); // Use the stored id
        console.log("Weights metadata:", data);
        setWeightsMeta(data.data);
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

    const clientId = selectedClient.id; // Store the id

    async function fetchWeightsSessionInsights() {
      try {
        setLoading(true);
        const data = await getClientWeightsSessionData(clientId); // your frontend function
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

    const clientId = selectedClient.id;

    async function fetchCardioMeta() {
      try {
        setLoading(true);
        const data = await getClientCardioMetaData(clientId);
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

    const clientId = selectedClient.id;

    async function fetchCardioSessionInsights() {
      try {
        setLoading(true);
        const data = await getClientCardioSessionData(clientId); // your frontend function
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
  // useEffect(() => {
  //   if (!selectedClient) return;

  //   const clientId = selectedClient.id;

  //   async function fetchNutritionMeta() {
  //     try {
  //       setLoading(true);
  //       const data = await getClientNutritionData(clientId);
  //       console.log("Nutrition metadata:", data);
  //       setNutritionMeta(data.data); // assuming your API returns { status, data }
  //     } catch (err) {
  //       console.error("Failed to fetch client Nutrition:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchNutritionMeta();
  // }, [selectedClient]);

    // Retrieve Client Metrics Workout Data
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

  const tabs = [
    { label: "Client Metrics" },
    { label: "Weights Analysis" },
    { label: "Cardio Analysis" },
    { label: "Nutrition Analysis" },
    { label: "History" },
    { label: "Programs" },
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
                  <Image
                    src={selectedClient.profile_image || "/placeholder-profile.png"}
                    alt={`${selectedClient.first_name} ${selectedClient.last_name}`}
                    width={64}       // match your Tailwind w-16
                    height={64}      // match your Tailwind h-16
                    className="rounded-full object-cover border border-gray-600"
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
                {metricsData?.body_measurements?.[0]?.height_cm
                  ? `${metricsData.body_measurements[0].height_cm} cm`
                  : "-"}
              </span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="block text-xs text-gray-400">Weight</span>
                  <span className="font-medium">
                    {metricsData?.body_measurements?.[0]?.weight_kg
                      ? `${metricsData.body_measurements[0].weight_kg} kg`
                      : "-"}
                  </span>
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
                  <span><strong>Workouts/wk:</strong> {String(selectedClient.activity_metrics?.workouts_per_week ?? "-")}</span>
                  <span><strong>Runs/wk:</strong> {String(selectedClient.activity_metrics?.runs_per_week ?? "-")}</span>
                  <span><strong>Steps/day:</strong> {String(selectedClient.activity_metrics?.average_daily_steps ?? "-")}</span>
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
                onClick={() => setActiveTab(label as typeof activeTab)}
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
            {activeTab === "Client Metrics" && selectedClient && (
              <>
                {console.log("About to render ClientMetricsTab with metricsData:", metricsData)}
                <ClientMetricsTab
                  key="Client Metrics"
                  clientId={selectedClient.id}
                  clientName={`${selectedClient.first_name} ${selectedClient.last_name}`}
                  clientGender={selectedClient.gender}
                  clientAge={selectedClient.age}
                  metricsData={metricsData}
                />
              </>
            )}
            {activeTab === "Weights Analysis" && selectedClient && (
              <WeightsAnalysisTab
                key="Weights Analysis"
                weightsMeta={weightsMeta}
                weightsSessionInsights={weightsSessionInsights}
              />
            )}
            {activeTab === "Cardio Analysis" && selectedClient && (
              <CardioAnalysisTab
                key="Cardio Analysis"
                cardioMeta={cardioMeta}
                cardioSessionInsights={cardioSessionInsights}
              />
            )}
            {activeTab === "History" && selectedClient && (
              <HistoryTab
                key="History"
                cardioSessions={metricsData?.cardio_sessions || []}
                weightWorkouts={metricsData?.weight_workouts || []}
              />
            )}
            {activeTab === "Programs" && selectedClient && (
              <ProgramsTab
                key="Programs"
                clientName={`${selectedClient.first_name} ${selectedClient.last_name}`}
                clientGender={selectedClient.gender}
                clientAge={selectedClient.age}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
