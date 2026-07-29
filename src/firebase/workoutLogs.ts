import { collection, doc, onSnapshot, setDoc, type Unsubscribe } from "firebase/firestore";
import { requireDb } from "./config";
import type { Person, WorkoutLogEntry } from "../data/types";

const COLLECTION = "workoutLogs";

export function subscribeAllWorkoutLogs(callback: (logs: WorkoutLogEntry[]) => void): Unsubscribe {
  return onSnapshot(collection(requireDb(), COLLECTION), (snapshot) => {
    const logs = snapshot.docs.map((d) => d.data() as WorkoutLogEntry);
    callback(logs);
  });
}

export async function saveWorkoutLog(entry: Omit<WorkoutLogEntry, "id">): Promise<void> {
  const docId = `${entry.owner}_${entry.dateKey}`;
  await setDoc(doc(requireDb(), COLLECTION, docId), { ...entry, id: docId });
}

export function entryForDate(logs: WorkoutLogEntry[], dateKey: string, owner: Person): WorkoutLogEntry | undefined {
  return logs.find((l) => l.dateKey === dateKey && l.owner === owner);
}
