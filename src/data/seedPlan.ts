import type { Exercise, WorkoutTemplate } from "./types";

/**
 * This is the shared list of workout options both people pick from when
 * logging a workout. It's an example split — replace it with your own
 * routine. Each WorkoutTemplate is one selectable "day" (e.g. "Push Day"),
 * made up of a list of exercises.
 *
 * `ex(templateId, index, name, targetArea, location, sets, repsOrDuration, notes?)`
 * is just a shorthand for building an Exercise with a stable id
 * (`${templateId}-e${index}`).
 */
function ex(
  templateId: string,
  index: number,
  name: string,
  targetArea: string,
  location: "Home" | "Gym" | "Rest",
  sets: string,
  repsOrDuration: string,
  notes?: string
): Exercise {
  return { id: `${templateId}-e${index}`, name, targetArea, location, sets, repsOrDuration, notes };
}

export const seedPlan: WorkoutTemplate[] = [
  {
    id: "t1",
    order: 1,
    name: "Push Day",
    location: "Gym",
    exercises: [
      ex("t1", 1, "Bench Press", "Chest", "Gym", "4", "8-10"),
      ex("t1", 2, "Overhead Press", "Shoulders", "Gym", "3", "8-10"),
      ex("t1", 3, "Incline Dumbbell Press", "Upper chest", "Gym", "3", "10"),
      ex("t1", 4, "Lateral Raises", "Shoulders (side delts)", "Gym", "3", "12-15"),
      ex("t1", 5, "Tricep Pushdown", "Triceps", "Gym", "3", "12"),
    ],
  },
  {
    id: "t2",
    order: 2,
    name: "Pull Day",
    location: "Gym",
    exercises: [
      ex("t2", 1, "Deadlift", "Back/posterior chain", "Gym", "3", "5"),
      ex("t2", 2, "Pull-Ups", "Back (lats)", "Gym", "4", "8-10"),
      ex("t2", 3, "Barbell Row", "Mid-back", "Gym", "3", "10"),
      ex("t2", 4, "Face Pulls", "Rear delts/upper back", "Gym", "3", "15"),
      ex("t2", 5, "Bicep Curls", "Biceps", "Gym", "3", "12"),
    ],
  },
  {
    id: "t3",
    order: 3,
    name: "Leg Day",
    location: "Gym",
    exercises: [
      ex("t3", 1, "Squat", "Quads/glutes", "Gym", "4", "6-8"),
      ex("t3", 2, "Romanian Deadlift", "Hamstrings", "Gym", "3", "10"),
      ex("t3", 3, "Walking Lunges", "Quads/glutes", "Gym", "3", "12 each side"),
      ex("t3", 4, "Leg Press", "Quads", "Gym", "3", "10-12"),
      ex("t3", 5, "Calf Raises", "Calves", "Gym", "4", "15"),
    ],
  },
  {
    id: "t4",
    order: 4,
    name: "Full-Body (Home)",
    location: "Home",
    exercises: [
      ex("t4", 1, "Push-ups", "Chest/full body", "Home", "4", "15-20"),
      ex("t4", 2, "Bodyweight Squats", "Legs", "Home", "4", "20"),
      ex("t4", 3, "Plank", "Core", "Home", "3", "45-60 sec"),
      ex("t4", 4, "Lunges", "Legs", "Home", "3", "12 each side"),
      ex("t4", 5, "Superman Back Extension", "Lower back", "Home", "3", "15"),
    ],
  },
  {
    id: "t5",
    order: 5,
    name: "Cardio Day",
    location: "Gym",
    exercises: [
      ex("t5", 1, "Run / Row / Bike", "Cardio", "Gym", "1", "25-30 min"),
      ex("t5", 2, "Hanging Leg Raises", "Abs", "Gym", "3", "12-15"),
      ex("t5", 3, "Russian Twists", "Obliques", "Gym", "3", "12 each side"),
    ],
  },
  {
    id: "t6",
    order: 6,
    name: "Mobility & Recovery",
    location: "Rest",
    exercises: [
      ex("t6", 1, "Cat-Cow Stretch", "Spine mobility", "Rest", "3", "10"),
      ex("t6", 2, "Doorway Chest Stretch", "Chest", "Rest", "3", "30 sec"),
      ex("t6", 3, "Hip Flexor Stretch", "Hips", "Rest", "3", "30 sec each side"),
      ex("t6", 4, "Foam Rolling", "Full body", "Rest", "1", "10 min"),
    ],
  },
];

export function templateById(id: string): WorkoutTemplate | undefined {
  return seedPlan.find((t) => t.id === id);
}
