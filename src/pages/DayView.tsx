import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../data/AppDataContext";
import { seedPlan } from "../data/seedPlan";
import { entryForDate as workoutForDate } from "../firebase/workoutLogs";
import { mealsForDate, addMeal, deleteMeal } from "../firebase/meals";
import { uploadPhoto } from "../firebase/storage";
import { dateFromKey, formatFullDate } from "../data/dateUtils";
import type { Person } from "../data/types";
import emptyStateIcon from "../assets/icons/empty-state.png";
import workoutCompleteIcon from "../assets/icons/workout-complete.png";
import dietCompleteIcon from "../assets/icons/diet-complete.png";

type Tab = "workout" | "diet";

export default function DayView({ person }: { person: Person }) {
  const { ready } = useAppData();
  if (!ready) {
    return <div className="page" />;
  }
  return <DayViewContent person={person} />;
}

function DayViewContent({ person }: { person: Person }) {
  const { dateKey = "" } = useParams();
  const navigate = useNavigate();
  const { workoutLogs, meals } = useAppData();
  const [tab, setTab] = useState<Tab>("workout");

  const date = dateFromKey(dateKey);
  const workoutLog = workoutForDate(workoutLogs, dateKey, person);
  const dayMeals = mealsForDate(meals, dateKey, person);

  return (
    <div className="page">
      <div className="page-header">
        <button className="icon-button" onClick={() => navigate(`/${person}/logs`)}>‹</button>
        <h1 style={{ fontSize: 18, margin: 0, textAlign: "center", flex: 1 }}>{formatFullDate(date)}</h1>
        <div style={{ width: 40 }} />
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "workout" ? "active" : ""}`} onClick={() => setTab("workout")}>Workout</button>
        <button className={`tab ${tab === "diet" ? "active" : ""}`} onClick={() => setTab("diet")}>Diet</button>
      </div>

      {tab === "workout" && (
        <WorkoutTab dateKey={dateKey} person={person} log={workoutLog} emptyIcon={emptyStateIcon} completeIcon={workoutCompleteIcon} />
      )}
      {tab === "diet" && <DietTab dateKey={dateKey} person={person} meals={dayMeals} emptyIcon={emptyStateIcon} completeIcon={dietCompleteIcon} />}
    </div>
  );
}

function WorkoutTab({
  dateKey,
  person,
  log,
  emptyIcon,
  completeIcon,
}: {
  dateKey: string;
  person: Person;
  log: ReturnType<typeof workoutForDate>;
  emptyIcon: string;
  completeIcon: string;
}) {
  const navigate = useNavigate();

  if (log) {
    const completedCount = log.exerciseLogs.filter((e) => e.completed).length;
    return (
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={completeIcon} alt="" style={{ width: 48, height: 48 }} />
          <div>
            <div style={{ fontWeight: 700 }}>{log.templateName}</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              {log.location} • {completedCount}/{log.exerciseLogs.length} exercises completed
            </div>
          </div>
        </div>
        {log.note && <p style={{ margin: 0 }}>{log.note}</p>}
        {log.photoURL && <img src={log.photoURL} alt="" style={{ width: "100%", borderRadius: 12 }} />}
        <button className="secondary-button" onClick={() => navigate(`/${person}/logs/day/${dateKey}/workout/${log.templateId}`)}>
          Edit Log
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="empty-state">
        <img src={emptyIcon} alt="" style={{ width: "33vw", maxWidth: 160 }} />
        <p>No workout logged for this day yet.</p>
      </div>
      <p className="section-title" style={{ marginTop: 0 }}>Choose a workout</p>
      <div className="card-list">
        {seedPlan.map((t) => (
          <button key={t.id} className="card-row" onClick={() => navigate(`/${person}/logs/day/${dateKey}/workout/${t.id}`)}>
            <div>
              <div style={{ fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                {t.isRestDay ? "Rest Day" : `${t.location} • ${t.exercises.length} exercises`}
              </div>
            </div>
            <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DietTab({
  dateKey,
  person,
  meals,
  emptyIcon,
  completeIcon,
}: {
  dateKey: string;
  person: Person;
  meals: ReturnType<typeof mealsForDate>;
  emptyIcon: string;
  completeIcon: string;
}) {
  const [adding, setAdding] = useState(false);
  const [mealType, setMealType] = useState("Breakfast");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    if (!description.trim()) return;
    setSaving(true);
    try {
      let photoURL: string | undefined;
      if (photoFile) {
        photoURL = await uploadPhoto(photoFile, "meals");
      }
      await addMeal({ owner: person, dateKey, mealType, description: description.trim(), photoURL, createdAt: Date.now() });
      setAdding(false);
      setDescription("");
      setPhotoFile(null);
      setMealType("Breakfast");
    } catch (err) {
      console.error("Failed to save meal:", err);
      alert("Couldn't save this meal. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {meals.length === 0 && !adding && (
        <div className="empty-state">
          <img src={emptyIcon} alt="" style={{ width: "33vw", maxWidth: 160 }} />
          <p>No meals logged for this day yet.</p>
        </div>
      )}

      <div className="card-list">
        {meals.map((m) => (
          <div key={m.id} className="card" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <img src={completeIcon} alt="" style={{ width: 36, height: 36, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{m.mealType}</div>
              <p style={{ margin: "4px 0" }}>{m.description}</p>
              {m.photoURL && <img src={m.photoURL} alt="" style={{ width: "100%", borderRadius: 12 }} />}
            </div>
            <button className="icon-button" onClick={() => deleteMeal(m.id)}>✕</button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <select className="text-field" value={mealType} onChange={(e) => setMealType(e.target.value)}>
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
            <option>Snack</option>
          </select>
          <textarea
            className="textarea-field"
            placeholder="What did you eat?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="secondary-button" style={{ flex: 1 }} onClick={() => setAdding(false)}>Cancel</button>
            <button className="primary-button" style={{ flex: 1 }} disabled={saving || !description.trim()} onClick={handleSave}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <button className="primary-button" onClick={() => setAdding(true)}>+ Add Meal</button>
      )}
    </div>
  );
}
