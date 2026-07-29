import personAIcon from "./assets/icons/person-a.png";
import personBIcon from "./assets/icons/person-b.png";
import type { Person } from "./data/types";

/**
 * Personalize this file to make the app yours. Everything a user needs to
 * change to rebrand the app for their own two-person accountability pair
 * lives here — the rest of the code just reads from this config.
 *
 * To personalize:
 * 1. Change the `name` fields below to your own names.
 * 2. Replace src/assets/icons/person-a.png and person-b.png with your own
 *    avatar images (square, ~200x200px works well).
 * 3. Change `appName` to whatever you want the app to be called.
 */
export const appName = "Duo Tracker";

export const PEOPLE: Record<Person, { name: string; icon: string }> = {
  personA: { name: "Alex", icon: personAIcon },
  personB: { name: "Sam", icon: personBIcon },
};

export function otherPerson(person: Person): Person {
  return person === "personA" ? "personB" : "personA";
}
