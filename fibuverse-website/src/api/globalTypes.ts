
export interface AIWorkoutResponse {
  difficulty: string | null;
  equipment: string[];
  limitation: string | null;
  muscle_groups: string[];
  notes: string;
  num_exercises: number;
  session_data: AIExerciseData[];
  trainer: string;
  workout_date: string;
  workout_name: string;
  workout_type: string;
}

export interface AIExerciseData {
  name: string;
  original_order: number | null;
  token_index: number;
  exercise_order: number;
  set_structure: number;
  id?: number;
  exercise_id?: number;
  group_id?: number;
  sets?: AIExerciseSet[];
  category?: string;
  equipment?: string;
}

export interface AIExerciseSet {
  setsOrder: number;
  reps: string;
  rir: number;
  rirOrRpe: 0 | 1;
  weight: number | string;
  weightUnit: 0 | 1;
  duration?: number | null;
  durationOrVelocity: 0 | 1;
}