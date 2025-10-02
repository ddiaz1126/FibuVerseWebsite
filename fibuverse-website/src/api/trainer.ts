const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ------------------ Refresh Token API Wrapper Functions
interface RefreshResponse {
  access?: string;
  refresh?: string;
  [key: string]: unknown;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    console.warn("[auth] No refresh token available");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const text = await res.text();
    let data: RefreshResponse = {};

    try {
      data = text ? JSON.parse(text) as RefreshResponse : {};
    } catch {
      console.warn("[auth] refresh returned non-json:", text);
      return null;
    }

    if (!res.ok) {
      console.warn("[auth] refresh failed:", data);
      return null;
    }

    if (typeof data.access === "string") {
      localStorage.setItem("accessToken", data.access);
      console.log("[auth] Obtained new access token");
      return data.access;
    }

    console.warn("[auth] refresh response missing access token:", data);
    return null;
  } catch (err: unknown) {
    if (err instanceof Error) console.error("[auth] refreshAccessToken error:", err);
    else console.error("[auth] refreshAccessToken unknown error:", err);
    return null;
  }
}

/**
 * POST JSON wrapper with automatic token refresh (tries once).
 */
export async function postWithAutoRefresh<T = unknown>(
  endpoint: string,
  payload: T,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("accessToken") ?? null;

  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };
  if (token) baseHeaders["Authorization"] = `Bearer ${token}`;

  const doFetch = async (hdrs: Record<string, string>) => {
    const mergedOptions: RequestInit = {
      method: "POST",
      ...options,
      headers: hdrs,
      body: JSON.stringify(payload),
    };
    return await fetch(`${API_URL}${endpoint}`, mergedOptions);
  };

  let res = await doFetch(baseHeaders);

  if (res.status === 401) {
    console.info("[postWithAutoRefresh] 401 received, attempting token refresh");
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error("Access token expired. Please login again.");

    const retryHeaders = { ...baseHeaders, Authorization: `Bearer ${newToken}` };
    res = await doFetch(retryHeaders);
  }

  const text = await res.text();
  let data: T;
  try {
    data = text ? JSON.parse(text) : ({} as T);
  } catch {
    console.warn("[postWithAutoRefresh] response is not valid JSON:", text);
    throw new Error("API did not return valid JSON");
  }

  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;

    if (typeof data === "object" && data !== null) {
      const d = data as Record<string, unknown>;
      if (typeof d.error === "string") errMsg = d.error;
      else if (typeof d.message === "string") errMsg = d.message;
    }

    throw new Error(errMsg);
  }

  return data;
}

/**
 * Generic JSON fetch wrapper with automatic token refresh (tries once).
 */
export async function fetchWithAutoRefresh<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("accessToken") ?? null;

  // Get user's timezone and append to endpoint
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const separator = endpoint.includes("?") ? "&" : "?";
  const endpointWithTimezone = `${endpoint}${separator}timezone=${encodeURIComponent(timezone)}`;

  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };
  if (token) baseHeaders["Authorization"] = `Bearer ${token}`;

  const doFetch = async (hdrs: Record<string, string>) => {
    const mergedOptions = { ...options, headers: hdrs };
    return await fetch(`${API_URL}${endpointWithTimezone}`, mergedOptions);
  };

  let res = await doFetch(baseHeaders);

  if (res.status === 401) {
    console.info("[fetchWithAutoRefresh] 401 received, attempting token refresh");
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error("Access token expired. Please login again.");

    const retryHeaders = { ...baseHeaders, Authorization: `Bearer ${newToken}` };
    res = await doFetch(retryHeaders);
  }

  const text = await res.text();
  let data: T;
  try {
    data = text ? JSON.parse(text) : ({} as T);
  } catch {
    console.warn("[fetchWithAutoRefresh] response is not valid JSON:", text);
    throw new Error("API did not return valid JSON");
  }

  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;

    if (typeof data === "object" && data !== null) {
      const d = data as Record<string, unknown>;
      if (typeof d.error === "string") errMsg = d.error;
      else if (typeof d.message === "string") errMsg = d.message;
    }

    throw new Error(errMsg);
  }

  return data;
}

/**
 * POST FormData wrapper with auto-refresh (works for file uploads).
 * Does not set Content-Type (browser will set boundary).
 */
export async function postFormDataWithAutoRefresh<T = unknown>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  let token = localStorage.getItem("accessToken") ?? null;

  const doFetch = async (authToken: string | null) => {
    const headers: Record<string, string> = {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      // DO NOT set Content-Type; browser will handle FormData
    };
    return await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      body: formData,
      headers,
    });
  };

  let res = await doFetch(token);

  if (res.status === 401) {
    console.info("[postFormDataWithAutoRefresh] 401 received, attempting token refresh");
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error("Access token expired. Please login again.");

    token = newToken;
    res = await doFetch(token);
  }

  const text = await res.text();
  let data: T;
  try {
    data = text ? JSON.parse(text) : ({} as T);
  } catch {
    console.warn("[postFormDataWithAutoRefresh] response is not valid JSON:", text);
    throw new Error("API did not return valid JSON");
  }

  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;

    if (typeof data === "object" && data !== null) {
      const d = data as Record<string, unknown>;
      if (typeof d.error === "string") errMsg = d.error;
      else if (typeof d.message === "string") errMsg = d.message;
    }

    throw new Error(errMsg);
  }

  return data;
}

// API Calls
export async function loginTrainer(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: 1 }), // hardcoded trainer role
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

// ✅ New function to fetch clients for the logged-in trainer
export async function getTrainerClients() {
  try {
    const data = await fetchWithAutoRefresh("/trainers/get-trainer-clients-full-data/");
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[getTrainerClients] error:", err);
      throw err;
    } else {
      console.error("[getTrainerClients] unknown error:", err);
      throw new Error("Unknown error fetching trainer clients");
    }
  }
}

export async function getTrainerWorkouts() {
  try {
    const data = await fetchWithAutoRefresh("/trainers/trainer-workouts/");
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[getTrainerWorkouts] error:", err);
      throw err;
    } else {
      console.error("[getTrainerWorkouts] unknown error:", err);
      throw new Error("Unknown error fetching trainer workouts");
    }
  }
}

interface LogoutResponse {
  detail?: string;
  error?: string;
}

export async function logoutTrainer(refreshToken: string, accessToken?: string) {
  try {
    const res = await fetch(`${API_URL}/api/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    let data: LogoutResponse = {};
    try { 
      data = await res.json(); 
    } catch {}

    if (!res.ok && res.status !== 401) {
      // Only throw if it’s not an already-unauthorized token
      throw new Error(data.detail || data.error || "Logout failed");
    }

    return data;
  } catch (err) {
    console.error("logoutTrainer error:", err);
    throw err;
  }
}

interface ChatHistory {
  room_name: string;
  recipient_user_id: string;
  trainer_data: {
    id: number;
    name: string;
  } | null;
  last_message: string;
  timestamp: string;
}

export async function getTrainerChatHistory(): Promise<ChatHistory[]> {
  try {
    const data = await fetchWithAutoRefresh("/chat/trainer_chat_history/");
    console.log("Fetched chat history:", data);
    return data as ChatHistory[]; // assert the type
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[getTrainerChatHistory] error:", err);
      throw err;
    } else {
      console.error("[getTrainerChatHistory] unknown error:", err);
      throw new Error("Unknown error fetching trainer chat history");
    }
  }
}
interface DailyMetric {
  date: string; 
  total: number;
}

interface TrainerMetrics {
  total_clients: number;
  total_workouts_today: number;
  workouts_per_client_daily: Record<string, DailyMetric[]>; // client name → array of daily workouts
  calories_per_client_daily: Record<string, DailyMetric[]>; // client name → array of daily calories
}

export async function getTrainerDashboardMetrics(): Promise<TrainerMetrics> {
  try {
    const data = await fetchWithAutoRefresh("/trainers/get-trainer-metrics/") as TrainerMetrics;
    console.log("Fetched Trainer Dashboard Metrics Data:", data);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[getTrainerDashboardMetrics] error:", err);
      throw err;
    } else {
      console.error("[getTrainerDashboardMetrics] unknown error:", err);
      throw new Error("Unknown error fetching trainer dashboard metrics");
    }
  }
}

interface ProgramWorkoutSet {
  reps?: number | null;
  weight?: number | null;
  rir?: number | null;
  duration?: number | null;
  sets_order?: number | null;
  weight_unit?: string | null;
  duration_or_velocity?: string | null;
  rir_or_rpe?: number | null;
  completed_at?: string | null;
}

interface ProgramWorkoutExercise {
  id: number;
  name: string;
  description?: string | null;
  duration?: number | null;
  sets: ProgramWorkoutSet[];
  set_structure?: string | null;
  group_id?: number | null;
  exercise_order?: number | null;
}

interface Workout {
  id: number;
  workout_name: string;
  workout_date?: string | null;
  duration?: number | null;
  heart_rate?: number | null;
  calories_burned?: number | null;
  notes?: string | null;
  workout_type?: string | null;
  trainer_id?: number | null;
  client_id?: number | null;
  prebuilt_workout?: boolean;
  session_data: ProgramWorkoutExercise[];
}

interface ProgramWorkout {
  id: number;
  program: number;
  week_index?: number | null;
  day_index?: number | null;
  order?: number | null;
  date?: string | null;
  workout: Workout;
}

interface Program {
  id: number;
  name: string;
  client_id?: number | null;
  client_name?: string | null;
  is_template: boolean;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  workout_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  program_workouts: ProgramWorkout[];
}

export async function getTrainerPrograms(): Promise<Program[]> {
  try {
    const data = await fetchWithAutoRefresh("/trainers/get-programs/");
    console.log("Fetched programs:", data);
    return data as Program[]; // assert type
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[getTrainerPrograms] error:", err);
      throw err;
    } else {
      console.error("[getTrainerPrograms] unknown error:", err);
      throw new Error("Unknown error fetching programs");
    }
  }
}
interface CaloriesPerWeek {
  week: string; // ISO date string
  total_calories: number;
}

interface AvgMacrosPerWeek {
  week: string; // ISO date string
  avg_protein: number;
  avg_carbs: number;
  avg_fat: number;
}

interface CaloriesPerMealType {
  meal_type: string;
  total_calories: number;
}

interface NutritionMetadata {
  calories_per_week: CaloriesPerWeek[];
  avg_macros_per_week: AvgMacrosPerWeek[];
  calories_per_meal_type: CaloriesPerMealType[];
  total_entries: number;
}
export async function getClientNutritionData(
  client_id: number
): Promise<{ data: NutritionMetadata }> {
  try {
    const data = await fetchWithAutoRefresh(
      `/trainers/get-client-nutrition-data/${client_id}/`
    ) as { data: NutritionMetadata };
    console.log("Fetched client nutrition:", data);
    return data;
  } catch (err: unknown) {
    console.error("[getClientNutritionData] error:", err);
    throw err;
  }
}

interface WorkoutPerWeek {
  week: string; // ISO date string
  total: number;
}

interface AvgDurationByMonth {
  month: string; // ISO date string
  avg_duration: number;
}

interface ExercisesPerWorkout {
  workout_date: string; // ISO date string
  workout_name: string;
  total_exercises: number;
}

interface MuscleOrEquipmentStat {
  name: string;
  count: number;
}

interface DifficultyStat {
  difficulty: string;
  total: number;
}

interface WeightsMeta {
  workouts_per_week: WorkoutPerWeek[];
  avg_duration: AvgDurationByMonth[];
  exercises_per_workout: ExercisesPerWorkout[];
  muscle_group_stats: MuscleOrEquipmentStat[];
  equipment_stats: MuscleOrEquipmentStat[];
  difficulty_stats: DifficultyStat[];
}

export async function getClientWeightsMetaData(client_id: number): Promise<{ data: WeightsMeta }> {
  try {
    const data = await fetchWithAutoRefresh(
      `/trainers/get-client-weights-metadata/${client_id}/`
    );
    console.log("Fetched client weights metadata:", data);
    return data as { data: WeightsMeta };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[getClientWeightsMetaData] error:", err);
      throw err;
    } else {
      console.error("[getClientWeightsMetaData] unknown error:", err);
      throw new Error("Unknown error fetching client weights metadata");
    }
  }
}
interface VolumePerExercise {
  workout_id: number;
  exercise__name: string;
  total_session_load: number;
}

interface AvgEffortPerExercise {
  workout_id: number;
  exercise_name: string;
  effort: number;
}

interface AvgRepsPerExercise {
  [exercise_name: string]: number; // avg reps per exercise
}

interface WeightProgression {
  exercise__name: string;
  workout__workout_date: string; // ISO date string
  avg_weight: number;
}

interface SetsPerExercise {
  exercise__name: string;
  total_sets: number;
}

interface WeightsSessionInsights {
  volume_per_exercise: VolumePerExercise[];
  avg_effort_per_exercise: AvgEffortPerExercise[];
  avg_reps_per_exercise: AvgRepsPerExercise;
  weight_progression: WeightProgression[];
  sets_per_exercise: SetsPerExercise[];
}

export async function getClientWeightsSessionData(client_id: number): Promise<{ data: WeightsSessionInsights }> {
  try {
    const data = await fetchWithAutoRefresh(
      `/trainers/get-client-weights-session-insights/${client_id}/`
    ) as { data: WeightsSessionInsights };
    console.log("Fetched client weights session data:", data);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[getClientWeightsSessionData] error:", err);
      throw err;
    } else {
      console.error("[getClientWeightsSessionData] unknown error:", err);
      throw new Error("Unknown error fetching client weights session data");
    }
  }
}
interface CardioTypeStat {
  cardio_type: string;
  count: number;
}

interface WeekStat {
  week: string; // ISO date string from TruncWeek
  total?: number;             // for sessions_per_week
  total_distance?: number;    // for distance_per_week
  avg_pace?: number;          // for avg_pace_per_week
  avg_hr?: number;            // for avg_hr_per_week
  total_calories?: number;    // for calories_per_week
}
interface CardioMetadata {
  sessions_per_week: WeekStat[];
  distance_per_week: WeekStat[];
  avg_pace_per_week: WeekStat[];
  avg_hr_per_week: WeekStat[];
  calories_per_week: WeekStat[];
  cardio_types: CardioTypeStat[];
}

export async function getClientCardioMetaData(client_id: number): Promise<{ data: CardioMetadata }> {
  try {
    const data = await fetchWithAutoRefresh(`/trainers/get-client-cardio-metadata/${client_id}/`) as { data: CardioMetadata };
    console.log("Fetched client cardio metadata:", data);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[getClientCardioMetaData] error:", err);
      throw err;
    } else {
      console.error("[getClientCardioMetaData] unknown error:", err);
      throw new Error("Unknown error fetching client cardio metadata");
    }
  }
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

export async function getClientCardioSessionData(client_id: number): Promise<{ data: CardioSessionInsights }> {
  try {
    const data = await fetchWithAutoRefresh(`/trainers/get-client-cardio-session-insights/${client_id}/`) as { data: CardioSessionInsights };
    console.log("Fetched client cardio session data:", data);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[getClientCardioSessionData] error:", err.message);
    } else {
      console.error("[getClientCardioSessionData] unexpected error:", err);
    }
    throw err;
  }
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
  body_measurements?: BodyMeasurement;
  health_metrics?: HealthMetric;
  body_fat_skinfolds?: Skinfold;
  fitness_test?: FitnessTest;
  activity_metrics?: Record<string, unknown>; // instead of any
  alerts?: Array<Record<string, unknown>>; 
  cardio_sessions?: CardioSession[];
  weight_workouts?: WeightWorkout[];
}

// Metrics
export async function getClientMetricsData(client_id: number): Promise<{ data: Client }> {
  try {
    const data = await fetchWithAutoRefresh(`/trainers/get-specific-client-metrics/${client_id}/`) as { data: Client };
    console.log("Fetched client metrics:", data);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[getClientMetricsData] error:", err.message);
      throw err;
    } else {
      console.error("[getClientMetricsData] unknown error:", err);
      throw new Error("Unknown error occurred while fetching client metrics");
    }
  }
}

interface AlertItem {
  id: number | null;
  time: string;
  alert_message: string;
  icon: string;
}

interface DayAlerts {
  date: string;
  alerts: AlertItem[];
}

// Fetch Alerts for Trainer
export async function getTrainerAlerts(): Promise<DayAlerts[]> {
  try {
    const data = await fetchWithAutoRefresh(`/trainers/get-trainer-alerts/`) as DayAlerts[];
    console.log("Fetched trainer alerts:", data);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[getTrainerAlerts] error:", err.message);
      throw err;
    } else {
      console.error("[getTrainerAlerts] unknown error:", err);
      throw new Error("Unknown error occurred while fetching trainer alerts");
    }
  }
}
// Post Body Measurements
export async function sendBodyMeasurementData(
  payload: { client_id?: number; [key: string]: unknown }
) {
  try {
    const data = await postWithAutoRefresh(
      "/clients/add-body-measurement/",
      payload
    );
    console.log("Send body measurement metrics:", data);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[sendBodyMeasurementData] error:", err.message);
      throw err;
    } else {
      console.error("[sendBodyMeasurementData] unknown error:", err);
      throw new Error("Unknown error occurred while sending body measurement data");
    }
  }
}
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
interface SendHealthMetricsPayload extends HealthMetric {
  client_id?: number;
}
// Post Health Metrics
export async function sendHealthMetricsData(payload: SendHealthMetricsPayload) {
  try {
    const data = await postWithAutoRefresh("/clients/add-health-metric/", payload);
    console.log("Send health metrics:", data);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[sendHealthMetricsData] error:", err.message);
    } else {
      console.error("[sendHealthMetricsData] unexpected error:", err);
    }
    throw err;
  }
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
interface SendBodyFatPayload extends Skinfold {
  client_id?: number;
}
// Post Body Fat Skinfolds
export async function sendBodyFatData(payload: SendBodyFatPayload) {
  try {
    const data = await postWithAutoRefresh("/clients/add-body-fat-skinfolds/", payload);
    console.log("Send Body Fat Skinfolds:", data);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[sendBodyFatData] error:", err.message);
    } else {
      console.error("[sendBodyFatData] unexpected error:", err);
    }
    throw err;
  }
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
interface SendFitnessTestPayload extends FitnessTest {
  client_id?: number;
}

// Post Fitness Tests Data
export async function sendFitnessTestsData(payload: SendFitnessTestPayload) {
  try {
    const data = await postWithAutoRefresh("/clients/add-fitness-test/", payload);
    console.log("Send Fitness Tests Data:", data);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[sendFitnessTestsData] error:", err.message);
    } else {
      console.error("[sendFitnessTestsData] unexpected error:", err);
    }
    throw err;
  }
}
interface CreateClientPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string; // ISO date string or yyyy-mm-dd
  city: string;
  home_state: string;
  country: string;
  height: string;      // could use number if parsed
  body_weight: string; // could use number if parsed
}

// Crete Client
export async function createClient(payload: CreateClientPayload) {
  try {
    const data = await postWithAutoRefresh("/trainers/add-client/", payload);
    console.log("Client created successfully:", data);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[createClient] error:", err.message);
    } else {
      console.error("[createClient] unexpected error:", err);
    }
    throw err;
  }
}
export interface Exercise {
  id: number;
  name: string;
  category: string;
  equipment: string;
  description: string;
  instructions: string;
  image?: string | null;
}


export async function searchExerciseLibrary(
  query: string,
  muscleGroup?: string | null,
  equipment?: string | null
): Promise<Exercise[]> {
  try {
    const body: Record<string, unknown> = { query: query || "" };
    if (muscleGroup) body.muscle_group = muscleGroup;
    if (equipment) body.equipment = equipment;

    const data = await fetchWithAutoRefresh<Exercise[]>(
      `/trainers/search-exercise-library/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    console.log("Fetched exercises:", data);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("[searchExerciseLibrary] error:", err.message);
      throw err;
    } else {
      console.error("[searchExerciseLibrary] unknown error:", err);
      throw new Error("Unknown error occurred while fetching exercises");
    }
  }
}
