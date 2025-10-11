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

import { getTrainerClients, getClientWeightsMetaData, getClientWeightsSessionData, getClientCardioMetaData, getClientCardioSessionData, getClientMetricsData, getClientNutritionData } from "@/api/trainer";
import { Client, WeightsMeta, WeightsSessionInsights, NutritionMetadata } from '@/api/trainerTypes';
import WeightsAnalysisTab from "@/components/clients/WeightsAnalysisTab";
import HistoryTab from "@/components/clients/HistoryTab";
import ProgramsTab from "@/components/clients/ProgramsTab";
import CardioAnalysisTab from "@/components/clients/CardioAnalysisTab";
import NutritionAnalysisTab from "@/components/clients/NutritionAnalysisTab";
import ClientMetricsTab from "@/components/clients/ClientMetricsTab";
import { useRouter } from "next/navigation"; 
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';


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
  const [nutritionMeta, setNutritionMeta] = useState<NutritionMetadata | null>(null);
  const [metricsData, setMetricsData] = useState<ClientMetricsData | null>(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"Client Metrics" | "Weights Analysis" | "Cardio Analysis" | "Nutrition Analysis" | "History" | "Programs">("Client Metrics");
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
  useEffect(() => {
    if (!selectedClient) return;

    const clientId = selectedClient.id;

    async function fetchNutritionMeta() {
      try {
        setLoading(true);
        const data = await getClientNutritionData(clientId);
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
      {/* Left sidebar */}
      <div className="flex-none w-1/4 md:w-1/5 lg:w-1/6 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 p-3 flex-col rounded-xl m-2 hidden md:flex">
        {/* Add Client Button */}
        <Button
          onClick={() => router.push("/trainer/clients/add-client")}
          variant="success"
          size="sm"
          icon={<Users className="w-3.5 h-5.5" />}
          label="Add Client"
          className="mb-3 flex-shrink-0"
        />

        {/* Search Input */}
        <div className="relative mb-3 flex-shrink-0">
          <input
            type="text"
            placeholder="Search clients..."
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

        <div className="flex-1 overflow-y-auto pr-1 min-h-0">
          {loading ? (
            <div className="text-center text-gray-400 mt-4 text-xs">
              <div className="animate-pulse">Loading clients...</div>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center text-gray-500 mt-4 text-xs">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p>No clients yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/30">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left px-3 py-2.5 hover:bg-gray-700/30 transition-all ${
                    selectedClient?.id === client.id 
                      ? "bg-gray-700/50 border-l-2 border-l-blue-500" 
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      {client.profile_image ? (
                        <Image
                          src={client.profile_image}
                          alt={`${client.first_name} ${client.last_name}`}
                          width={32}
                          height={32}
                          className="rounded-full object-cover border-2 border-gray-600"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {client.first_name?.[0]?.toUpperCase()}{client.last_name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-gray-800"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-semibold text-white truncate">
                          {client.first_name} {client.last_name}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate">
                        {client.email}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile View - Add Client Button & Dropdown */}
      <div className="md:hidden p-3 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 rounded-xl m-2 space-y-2 relative z-50 overflow-visible">
        {/* Add Client Button */}
        <Button
          onClick={() => router.push("/trainer/clients/add-client")}
          variant="success"
          size="sm"
          icon={<Users className="w-3.5 h-5.5" />}
          label="Add Client"
          className="w-full"
        />

        {/* Client Dropdown */}
        <div className="relative z-50" id="client-dropdown-container">
          <button
            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
            className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-left flex items-center justify-between hover:border-blue-500 transition-colors"
            id="client-dropdown-button"
          >
            <div className="flex items-center gap-2">
              {selectedClient ? (
                <>
                  {selectedClient.profile_image ? (
                    <Image
                      src={selectedClient.profile_image}
                      alt={`${selectedClient.first_name} ${selectedClient.last_name}`}
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-[10px]">
                      {selectedClient.first_name?.[0]?.toUpperCase()}{selectedClient.last_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold">
                    {selectedClient.first_name} {selectedClient.last_name}
                  </span>
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">Select a client</span>
                </>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                mobileDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {mobileDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => setMobileDropdownOpen(false)}
              ></div>
              {/* Dropdown */}
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto z-50">
                {/* Search Input */}
                <div className="p-2 border-b border-gray-700 sticky top-0 bg-gray-900">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search clients..."
                      className="w-full p-2 pl-8 text-xs rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-500 text-white focus:border-blue-500 outline-none"
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
                </div>

                {/* Client List */}
                {loading ? (
                  <div className="text-center text-gray-400 p-4 text-xs">
                    <div className="animate-pulse">Loading clients...</div>
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center text-gray-500 p-4 text-xs">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p>No clients yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700/30">
                    {clients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => {
                          setSelectedClient(client);
                          setMobileDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 hover:bg-gray-800 transition-colors ${
                          selectedClient?.id === client.id ? "bg-gray-800" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            {client.profile_image ? (
                              <Image
                                src={client.profile_image}
                                alt={`${client.first_name} ${client.last_name}`}
                                width={32}
                                height={32}
                                className="rounded-full object-cover border-2 border-gray-600"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {client.first_name?.[0]?.toUpperCase()}{client.last_name?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                              {client.first_name} {client.last_name}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {client.email}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Right panel */}
      <div className="flex-1 p-2 flex flex-col gap-2">
        {/* Top section split: Client details + Calendar */}
        <div className="flex gap-2 flex-wrap">
          {/* Client Details */}
          <div className="w-full md:w-1/3 bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-700 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-gray-700 pb-1.5">
              <h2 className="font-semibold text-xs flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Client Details
              </h2>
              {selectedClient && (
                <button 
                  onClick={() => router.push(`/trainer/clients/update-client/${selectedClient.id}`)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400 hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>

            {selectedClient ? (
              <div className="flex flex-col gap-2">
                {/* Avatar + Name */}
                <div className="flex items-center gap-2">
                      <div className="relative">
                        {selectedClient.profile_image ? (
                          <Image
                            src={selectedClient.profile_image}
                            alt={`${selectedClient.first_name} ${selectedClient.last_name}`}
                            width={36}
                            height={36}
                            className="rounded-full object-cover border-2 border-gray-600"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-gray-600">
                            {selectedClient.first_name?.[0]?.toUpperCase()}{selectedClient.last_name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-gray-800"></div>
                      </div>
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 group mb-0.5">
                      <div className="h-0.5 w-4 bg-gradient-to-r from-transparent to-yellow-500/50 group-hover:to-yellow-500 transition-all duration-300"></div>
                      <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase group-hover:text-yellow-400 transition-colors duration-300">
                        {selectedClient.first_name || "-"} {selectedClient.last_name || "-"}
                      </p>
                      <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-yellow-500/50 group-hover:to-yellow-500 transition-all duration-300"></div>
                    </div>
                    <p className="text-gray-400 text-[10px] truncate">{selectedClient.email || "-"}</p>
                    <p className="text-gray-500 text-[10px]">
                      {selectedClient.city || "-"}, {selectedClient.home_state || "-"}
                    </p>
                  </div>
                </div>

                {/* Info boxes */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-gray-900/50 p-1.5 rounded-lg border border-gray-700">
                    <span className="block text-[9px] text-gray-400 mb-0.5">Gender</span>
                    <span className="font-medium text-xs text-white">{selectedClient.gender || "-"}</span>
                  </div>
                  <div className="bg-gray-900/50 p-1.5 rounded-lg border border-gray-700">
                    <span className="block text-[9px] text-gray-400 mb-0.5">Age</span>
                    <span className="font-medium text-xs text-white">{selectedClient.age || "-"}</span>
                  </div>
                  <div className="bg-gray-900/50 p-1.5 rounded-lg border border-gray-700">
                    <span className="block text-[9px] text-gray-400 mb-0.5">Height</span>
                    <span className="font-medium text-xs text-white">
                      {metricsData?.body_measurements?.[0]?.height_cm
                        ? `${metricsData.body_measurements[0].height_cm} cm`
                        : "-"}
                    </span>
                  </div>
                  <div className="bg-gray-900/50 p-1.5 rounded-lg border border-gray-700">
                    <span className="block text-[9px] text-gray-400 mb-0.5">Weight</span>
                    <span className="font-medium text-xs text-white">
                      {metricsData?.body_measurements?.[0]?.weight_kg
                        ? `${metricsData.body_measurements[0].weight_kg} kg`
                        : "-"}
                    </span>
                  </div>
                </div>

                {/* Fitness Goal */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-2 rounded-lg border border-blue-500/30">
                  <span className="block text-[9px] text-gray-400 mb-0.5">Fitness Goal</span>
                  <span className="font-medium text-xs text-white">{selectedClient.fitness_goal || "-"}</span>
                </div>

                {/* Activity Metrics */}
                <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                  <span className="block text-[9px] text-gray-400 mb-1">Activity Metrics</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div className="flex flex-col">
                      <span className="text-gray-500">Workouts/wk</span>
                      <span className="text-white font-semibold">{String(selectedClient.activity_metrics?.workouts_per_week ?? "-")}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-500">Runs/wk</span>
                      <span className="text-white font-semibold">{String(selectedClient.activity_metrics?.runs_per_week ?? "-")}</span>
                    </div>
                    <div className="flex flex-col col-span-2">
                      <span className="text-gray-500">Steps/day</span>
                      <span className="text-white font-semibold">{String(selectedClient.activity_metrics?.average_daily_steps ?? "-")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-gray-400 text-[10px]">Select a client to view details</p>
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-700">
            {/* Header with navigation */}
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
              <button 
                onClick={prevMonth} 
                className="p-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
              </button>
              <div className="font-bold text-sm text-white">{format(currentMonth, "MMMM yyyy")}</div>
              <button 
                onClick={nextMonth} 
                className="p-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex gap-3 mb-2 items-center text-[9px] justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full shadow-sm shadow-green-400/50"></span>
                <span className="text-gray-400">Cardio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-orange-400 rounded-full shadow-sm shadow-orange-400/50"></span>
                <span className="text-gray-400">Weights</span>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="font-semibold text-gray-400 text-[9px] py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
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
                      h-10 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all border
                      ${isToday 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-blue-500" 
                        : hasCardio || hasWeight
                        ? "bg-gray-900/50 hover:bg-gray-700/50 border-gray-600"
                        : "bg-gray-800/30 hover:bg-gray-700/50 border-gray-700"
                      }
                      ${!isCurrentMonth ? "opacity-30" : ""}
                    `}
                  >
                    <span className={`text-[10px] ${isToday ? "font-bold" : "font-medium"} ${isCurrentMonth ? "" : "text-gray-600"}`}>
                      {format(day, "d")}
                    </span>
                    {(hasCardio || hasWeight) && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasCardio && <span className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-sm"></span>}
                        {hasWeight && <span className="w-1.5 h-1.5 bg-orange-400 rounded-full shadow-sm"></span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabs below top section */}
        <div className="flex-1 flex flex-col gap-1 p-1">
          {/* Tabs */}
          <div className="relative flex gap-1 mb-2 bg-gray-900/50 p-1 rounded-lg border border-gray-700">
            {/* Sliding background indicator */}
            <div 
              className="absolute top-1 bottom-1 bg-gradient-to-r from-yellow-600/20 via-yellow-500/30 to-yellow-600/20 rounded-lg border border-yellow-500/50 shadow-lg shadow-yellow-500/20 transition-all duration-300 ease-out"
              style={{
                left: `${tabs.findIndex(t => t.label === activeTab) * (100 / tabs.length)}%`,
                width: `calc(${100 / tabs.length}% - 4px)`,
                marginLeft: '4px'
              }}
            />
            
            {tabs.map(({ label }) => (
              <button
                key={label}
                onClick={() => setActiveTab(label as typeof activeTab)}
                className={`
                  flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-300 relative z-10
                  ${activeTab === label
                    ? "text-yellow-400 font-semibold"
                    : "text-gray-400 hover:text-gray-200"
                  }
                `}
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
            {activeTab === "Nutrition Analysis" && selectedClient && nutritionMeta && (
              <NutritionAnalysisTab
               key="Nutrition Analysis"
               nutritionMeta={nutritionMeta}
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
