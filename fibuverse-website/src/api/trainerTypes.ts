
export interface Client {
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
  body_measurements?: BodyMeasurement[];
  health_metrics?: HealthMetric[];
  body_fat_skinfolds?: Skinfold[];
  fitness_test?: FitnessTest[];
  activity_metrics?: Record<string, unknown>; // instead of any
  alerts?: Array<Record<string, unknown>>; 
  cardio_sessions?: CardioSession[];
  weight_workouts?: WeightWorkout[];
}

export interface ClientProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  gender?: string;
  date_of_birth?: string;
  city?: string;
  home_state?: string;
  country?: string;
  height?: number;        // Backend returns number, not string
  body_weight?: number;   // Backend returns number, not string
  fitness_goal?: string;
  profile_image?: string; // URL string, not File object
}

export interface CreateClientPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string; // ISO date string or yyyy-mm-dd
  city: string;
  home_state: string;
  country: string;
  height: string;
  body_weight: string;
  fitness_goal?: string; // New field
  profile_image?: File; // New field for image upload
}

export interface HealthMetric {
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

export interface BodyMeasurement {
  created_at: string; // ISO date string
  weight_kg: number;
  height_cm: number;
  bmi: number;
  waist_cm: number;
  hip_cm: number;
  waist_to_height_ratio: number;
  body_fat_percentage: number;
}
export interface Skinfold {
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
export interface FitnessTest {
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

export interface CardioSession {
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

export interface WeightWorkout {
  id: number;
  workout_name: string;
  workout_date?: string | null;
  duration?: number | null;
  num_exercises?: number | null;
  notes?: string | null;
  created_at: string;
}


export interface VolumePerExercise {
  workout_id: number;
  exercise__name: string;
  total_session_load: number;
}

export interface AvgEffortPerExercise {
  workout_id: number;
  exercise_name: string;
  effort: number;
}

export interface AvgRepsPerExercise {
  [exercise_name: string]: number; // avg reps per exercise
}

export interface WeightProgression {
  exercise__name: string;
  workout__workout_date: string; // ISO date string
  avg_weight: number;
}

export interface SetsPerExercise {
  exercise__name: string;
  total_sets: number;
}

export interface Recent3Weeks {
  cutoff_date: string;
  total_workouts: number;
  workouts_per_week: number;
  sets_per_muscle_group: { exercise__muscle_group: string; total_sets: number }[];
  sets_per_exercise: { exercise__name: string; total_sets: number }[];
  equipment_usage: { exercise__equipment: string; usage_count: number }[];
  volume_per_muscle_group: { muscle_group: string; total_volume: number }[];
  weight_progression: { exercise_name: string; workout_date: string | null; avg_weight: number }[];
}

export interface WeightsSessionInsights {
  volume_per_exercise: VolumePerExercise[];
  avg_effort_per_exercise: AvgEffortPerExercise[];
  avg_reps_per_exercise: AvgRepsPerExercise;
  weight_progression: WeightProgression[];
  sets_per_exercise: SetsPerExercise[];
  recent_3_weeks: Recent3Weeks;  // Add this
}

export interface WeightsMeta {
  workouts_per_week: WorkoutPerWeek[];
  avg_duration: AvgDurationByMonth[];
  exercises_per_workout: ExercisesPerWorkout[];
  muscle_group_stats: MuscleOrEquipmentStat[];
  equipment_stats: MuscleOrEquipmentStat[];
  difficulty_stats: DifficultyStat[];
}
export interface WorkoutPerWeek {
  week: string; // ISO date string
  total: number;
}

export interface AvgDurationByMonth {
  month: string; // ISO date string
  avg_duration: number;
}

export interface ExercisesPerWorkout {
  workout_date: string; // ISO date string
  workout_name: string;
  total_exercises: number;
}

export interface MuscleOrEquipmentStat {
  name: string;
  count: number;
}

export interface DifficultyStat {
  difficulty: string;
  total: number;
}

export interface CaloriesPerWeek {
  week: string; // ISO date string
  total_calories: number;
}

export interface AvgMacrosPerWeek {
  week: string; // ISO date string
  avg_protein: number;
  avg_carbs: number;
  avg_fat: number;
}

export interface CaloriesPerMealType {
  meal_type: string;
  total_calories: number;
}

export interface NutritionMetadata {
  calories_per_week: CaloriesPerWeek[];
  avg_macros_per_week: AvgMacrosPerWeek[];
  calories_per_meal_type: CaloriesPerMealType[];
  total_entries: number;
}

// --------------- Weights -------------------------
export interface SessionData {
  id: number; // frontend ID
  exerciseId: Exercise; // reference to Exercise model
  exerciseName: string | null;
  workoutId?: number; // optional if saving new session data
  exerciseOrder: number;
  setStructure?: number | null;
  groupId?: number | null;
  weight?: number | string;
  sets: ExerciseSet[];
}
export interface Workout {
  workoutId?: number; // optional if editing existing workout
  clientId?: number | null;
  trainerId?: number | null;
  workoutName: string;
  workoutDate?: string; // ISO date string
  workoutStartTime?: string; // ISO datetime string
  workoutEndTime?: string;
  workoutType?: string;
  duration?: number; // minutes
  heartRate?: number;
  caloriesBurned?: number;
  notes?: string;
  summary?: string;
  prebuiltWorkout?: number;
  difficulty?: string;
  muscleGroups?: string[];
  equipment?: string[];
  numExercises?: number;
  limitation?: string;

  exercises: SessionData[]; // maps to session_data
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
export interface ExerciseSet {
  setsOrder: number;
  reps: string;
  rir: number;
  rirOrRpe: 0 | 1;
  weight: number | string;
  weightUnit: 0 | 1;
  duration?: number | null;
  durationOrVelocity: 0 | 1; // 0 = Duration, 1 = Velocity
}
export interface WorkoutPayload {
  workout_data: {
    client_id: number | null;
    workout_name: string;
    workout_date: string;
    workout_start_time: string;
    workout_end_time: string;
    workout_type: string;
    duration: number;
    prebuilt_workout?: number; // Add this line, make it optional
    exercises: {
      id: number; // Exercise ID
      exercise_name: string | null;
      exercise_order: number;
      group_id: number;
      set_structure: number;
      sets: {
        sets_order: number;
        weight: number | string;
        reps: string;
        rir: number | null;
        weight_unit: 0 | 1 | null;
        duration_or_velocity: 0 | 1 | null;
        rir_or_rpe: 0 | 1 | null;
        duration: number | null;
      }[];
    }[];
  };
}
export interface Program {
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
export interface ProgramWorkoutSet {
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

export interface ProgramWorkoutExercise {
  id: number;
  name: string;
  description?: string | null;
  duration?: number | null;
  sets: ProgramWorkoutSet[];
  set_structure?: string | null;
  group_id?: number | null;
  exercise_order?: number | null;
}

export interface ProgramWorkout {
  id: number;
  program: number;
  week_index?: number | null;
  day_index?: number | null;
  order?: number | null;
  date?: string | null;
  workout: Workout;
}

export interface WorkoutListItem {
  id: number;
  client_id: number | null;
  trainer_id: number;
  workout_name: string;
  workout_date: string;
  workout_start_time: string;
  workout_end_time: string;
  workout_type: string;
  duration: number;
  heart_rate?: number;
  calories_burned?: number;
  notes?: string;
  summary?: string;
  prebuilt_workout: 0 | 1;
  difficulty?: string;
  muscle_groups?: string[];
  equipment?: string[];
  num_exercises?: number;
  limitation?: string;
}

export interface CardioSession {
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

export interface WeightWorkout {
  id: number;
  workout_name: string;
  workout_date?: string | null;
  duration?: number | null;
  num_exercises?: number | null;
  notes?: string | null;
  created_at: string;
}

export interface BodyMeasurement {
  created_at: string; // ISO date string
  weight_kg: number;
  height_cm: number;
  bmi: number;
  waist_cm: number;
  hip_cm: number;
  waist_to_height_ratio: number;
  body_fat_percentage: number;
}

export interface ClientMetricsData {
  body_measurements?: BodyMeasurement[];  // <-- array
  health_metrics?: HealthMetric[];        // <-- array
  body_fat_skinfolds?: Skinfold[];       // <-- array
  fitness_tests?: FitnessTest[];         // <-- array
  cardio_sessions?: CardioSession[];
  weight_workouts?: WeightWorkout[];
}

export interface TrainerProfile {
  id: number;
  user: number;
  name: string;
  email: string;
  city?: string;
  state?: string;
  specialization: string;
  bio?: string;
  experience_years: number;
  certifications?: string;
  hourly_rate?: string;
  profile_picture?: string;
  instagram_url?: string;
  youtube_url?: string;
  podcast_url?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

// Add this interface for the response type
export interface ProgressPhotoResponse {
  message: string;
  photo: {
    id: number;
    image_url: string;
    date_taken: string;
    weight?: number;
    body_fat_percentage?: number;
    notes?: string;
    body_part?: string;
    is_private: boolean;
  };
}
