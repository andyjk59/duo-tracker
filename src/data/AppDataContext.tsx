import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ensureSignedIn, firebaseConfigured } from "../firebase/config";
import { subscribeAllWorkoutLogs } from "../firebase/workoutLogs";
import { subscribeAllMeals } from "../firebase/meals";
import type { WorkoutLogEntry, MealEntry } from "./types";

interface AppData {
  ready: boolean;
  workoutLogs: WorkoutLogEntry[];
  meals: MealEntry[];
}

const AppDataContext = createContext<AppData>({
  ready: false,
  workoutLogs: [],
  meals: [],
});

const COLLECTIONS = ["workoutLogs", "meals"] as const;

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);

  useEffect(() => {
    let unsubLogs: (() => void) | undefined;
    let unsubMeals: (() => void) | undefined;
    let cancelled = false;

    // `ready` must mean "the first real snapshot from every collection has
    // arrived", not just "subscriptions were started" — components read this
    // data straight into useState() on mount, so if they mount while a
    // collection is still empty, they lock in stale/empty state forever even
    // after the real data shows up moments later.
    const loaded = new Set<(typeof COLLECTIONS)[number]>();
    function markLoaded(name: (typeof COLLECTIONS)[number]) {
      loaded.add(name);
      if (!cancelled && loaded.size === COLLECTIONS.length) setReady(true);
    }

    ensureSignedIn().then(() => {
      if (cancelled) return;
      if (!firebaseConfigured) {
        setReady(true);
        return;
      }
      unsubLogs = subscribeAllWorkoutLogs((data) => {
        setWorkoutLogs(data);
        markLoaded("workoutLogs");
      });
      unsubMeals = subscribeAllMeals((data) => {
        setMeals(data);
        markLoaded("meals");
      });
    });

    return () => {
      cancelled = true;
      unsubLogs?.();
      unsubMeals?.();
    };
  }, []);

  return <AppDataContext.Provider value={{ ready, workoutLogs, meals }}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  return useContext(AppDataContext);
}
