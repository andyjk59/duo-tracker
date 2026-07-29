export type Person = "personA" | "personB";

export type WorkoutLocation = "Home" | "Gym" | "Rest";

export interface Exercise {
  id: string;
  name: string;
  targetArea: string;
  location: WorkoutLocation;
  sets: string;
  repsOrDuration: string;
  notes?: string;
}

export function prescription(exercise: Exercise): string {
  return exercise.sets === "1" ? exercise.repsOrDuration : `${exercise.sets} x ${exercise.repsOrDuration}`;
}

export interface WorkoutTemplate {
  id: string;
  order: number;
  name: string;
  location: WorkoutLocation;
  isRestDay?: boolean;
  exercises: Exercise[];
}

export interface ExerciseLogEntry {
  exerciseId: string;
  completed: boolean;
  note: string;
}

export interface WorkoutLogEntry {
  id: string;
  owner: Person;
  dateKey: string; // yyyy-MM-dd
  templateId: string;
  templateName: string;
  location: WorkoutLocation;
  exerciseLogs: ExerciseLogEntry[];
  customExercises?: Exercise[];
  photoURL?: string;
  note: string;
}

export interface MealEntry {
  id: string;
  owner: Person;
  dateKey: string;
  mealType: string;
  description: string;
  photoURL?: string;
  createdAt: number;
}
