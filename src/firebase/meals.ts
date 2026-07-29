import { collection, doc, onSnapshot, addDoc, deleteDoc, type Unsubscribe } from "firebase/firestore";
import { requireDb } from "./config";
import type { MealEntry, Person } from "../data/types";

const COLLECTION = "meals";

export function subscribeAllMeals(callback: (meals: MealEntry[]) => void): Unsubscribe {
  return onSnapshot(collection(requireDb(), COLLECTION), (snapshot) => {
    const meals = snapshot.docs.map((d) => ({ ...(d.data() as Omit<MealEntry, "id">), id: d.id }));
    callback(meals);
  });
}

export async function addMeal(meal: Omit<MealEntry, "id">): Promise<void> {
  await addDoc(collection(requireDb(), COLLECTION), meal);
}

export async function deleteMeal(id: string): Promise<void> {
  await deleteDoc(doc(requireDb(), COLLECTION, id));
}

export function mealsForDate(meals: MealEntry[], dateKey: string, owner: Person): MealEntry[] {
  return meals.filter((m) => m.dateKey === dateKey && m.owner === owner).sort((a, b) => a.createdAt - b.createdAt);
}
