import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../data/AppDataContext";
import { entryForDate as workoutForDate } from "../firebase/workoutLogs";
import { mealsForDate } from "../firebase/meals";
import { dateFromKey, formatFullDate, addDays, dateKey as toDateKey, todayKey } from "../data/dateUtils";
import { templateById } from "../data/seedPlan";
import { PEOPLE, otherPerson } from "../config";
import type { Person, WorkoutLogEntry } from "../data/types";

function completedExerciseNames(workoutLog: WorkoutLogEntry): string[] {
  const template = templateById(workoutLog.templateId);
  const allExercises = [...(template?.exercises ?? []), ...(workoutLog.customExercises ?? [])];
  const nameById = new Map(allExercises.map((e) => [e.id, e.name]));
  return workoutLog.exerciseLogs
    .filter((e) => e.completed)
    .map((e) => nameById.get(e.exerciseId) ?? e.exerciseId);
}

type Tab = "workout" | "diet";

export default function ViewOtherProfile({ viewing }: { viewing: Person }) {
  const navigate = useNavigate();
  const viewer = otherPerson(viewing);
  const { workoutLogs, meals } = useAppData();
  const name = PEOPLE[viewing].name;

  const [selectedKey, setSelectedKey] = useState(() => todayKey());
  const [tab, setTab] = useState<Tab>("workout");

  const date = dateFromKey(selectedKey);
  const today = todayKey();
  const isToday = selectedKey === today;

  const workoutLog = workoutForDate(workoutLogs, selectedKey, viewing);
  const dayMeals = mealsForDate(meals, selectedKey, viewing);

  function goToDay(delta: number) {
    const next = addDays(date, delta);
    const nextKey = toDateKey(next);
    if (nextKey > today) return;
    setSelectedKey(nextKey);
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="icon-button" onClick={() => navigate(`/${viewer}`)}>‹</button>
        <h1 style={{ fontSize: 20, margin: 0 }}>{name}'s Log</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button className="icon-button" onClick={() => goToDay(-1)}>‹</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700 }}>{formatFullDate(date)}</div>
          {isToday && <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Today</div>}
        </div>
        <button className="icon-button" onClick={() => goToDay(1)} disabled={isToday} style={{ opacity: isToday ? 0.3 : 1 }}>
          ›
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "workout" ? "active" : ""}`} onClick={() => setTab("workout")}>Workout</button>
        <button className={`tab ${tab === "diet" ? "active" : ""}`} onClick={() => setTab("diet")}>Diet</button>
      </div>

      {tab === "workout" && (
        <div className="card">
          {workoutLog ? (
            <>
              <p style={{ margin: 0 }}>
                {(() => {
                  const names = completedExerciseNames(workoutLog);
                  if (names.length === 0) {
                    return `${name} logged ${workoutLog.templateName} today (${workoutLog.location}) but didn't mark any exercises complete.`;
                  }
                  return `${name} completed ${workoutLog.templateName} today (${workoutLog.location}): ${names.join(", ")}.`;
                })()}
              </p>
              {workoutLog.note && <p>{workoutLog.note}</p>}
              {workoutLog.photoURL && <img src={workoutLog.photoURL} alt="" style={{ width: "100%", borderRadius: 12, marginTop: 10 }} />}
            </>
          ) : (
            <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>No workout logged for this day yet.</p>
          )}
        </div>
      )}

      {tab === "diet" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {dayMeals.length === 0 ? (
            <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>No meals logged for this day yet.</p>
          ) : (
            dayMeals.map((m) => (
              <div key={m.id}>
                <p style={{ margin: 0 }}>
                  For {m.mealType.toLowerCase()}, {name} had {m.description}.
                </p>
                {m.photoURL && <img src={m.photoURL} alt="" style={{ width: "100%", borderRadius: 12, marginTop: 6 }} />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
