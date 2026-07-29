import type { Person } from "./data/types";

/**
 * Personalize this file to make the app yours. Everything a user needs to
 * change to rebrand the app for their own two-person accountability pair
 * lives here — the rest of the code just reads from this config.
 *
 * To personalize:
 * 1. Change the `name` fields below to your own names.
 * 2. Change `color` if you want a different accent color per person (used
 *    for their initials avatar). Any CSS color value works.
 * 3. Change `appName` to whatever you want the app to be called.
 */
export const appName = "Duo Tracker";

export const PEOPLE: Record<Person, { name: string; color: string }> = {
  personA: { name: "Alex", color: "#c9679f" },
  personB: { name: "Sam", color: "#7c6fb0" },
};

export function otherPerson(person: Person): Person {
  return person === "personA" ? "personB" : "personA";
}
