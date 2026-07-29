import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../data/AppDataContext";
import { templateById } from "../data/seedPlan";
import { entryForDate, saveWorkoutLog } from "../firebase/workoutLogs";
import { uploadPhoto } from "../firebase/storage";
import { dateFromKey, formatFullDate } from "../data/dateUtils";
import { prescription, type Exercise, type ExerciseLogEntry, type Person } from "../data/types";

export default function WorkoutSession({ person }: { person: Person }) {
  const { ready } = useAppData();
  if (!ready) {
    return <div className="page" />;
  }
  return <WorkoutSessionForm person={person} />;
}

function WorkoutSessionForm({ person }: { person: Person }) {
  const { dateKey = "", templateId = "" } = useParams();
  const navigate = useNavigate();
  const { workoutLogs } = useAppData();

  const template = templateById(templateId);
  const existing = entryForDate(workoutLogs, dateKey, person);
  const date = dateFromKey(dateKey);
  const sameSession = existing?.templateId === templateId;

  const initialLogs = useMemo<Record<string, ExerciseLogEntry>>(() => {
    const map: Record<string, ExerciseLogEntry> = {};
    if (sameSession) {
      for (const el of existing!.exerciseLogs) map[el.exerciseId] = el;
    }
    return map;
  }, [existing, templateId]);

  const [exerciseLogs, setExerciseLogs] = useState(initialLogs);
  const [customExercises, setCustomExercises] = useState<Exercise[]>(
    sameSession ? (existing!.customExercises ?? []) : []
  );
  const [addingExercise, setAddingExercise] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExTargetArea, setNewExTargetArea] = useState("");
  const [newExSets, setNewExSets] = useState("");
  const [newExReps, setNewExReps] = useState("");
  const [note, setNote] = useState(sameSession ? existing!.note : "");
  const photoURL = sameSession ? existing!.photoURL : undefined;
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  if (!template) {
    return (
      <div className="page">
        <p>Workout not found.</p>
        <button className="secondary-button" onClick={() => navigate(-1)}>Back</button>
      </div>
    );
  }

  function toggleExercise(exerciseId: string) {
    setExerciseLogs((prev) => ({
      ...prev,
      [exerciseId]: { exerciseId, completed: !prev[exerciseId]?.completed, note: prev[exerciseId]?.note ?? "" },
    }));
  }

  function setExerciseNote(exerciseId: string, noteText: string) {
    setExerciseLogs((prev) => ({
      ...prev,
      [exerciseId]: { exerciseId, completed: prev[exerciseId]?.completed ?? false, note: noteText },
    }));
  }

  function handleAddExercise() {
    if (!template || !newExName.trim()) return;
    const custom: Exercise = {
      id: `${template.id}-custom-${crypto.randomUUID()}`,
      name: newExName.trim(),
      targetArea: newExTargetArea.trim() || "—",
      location: template.location,
      sets: newExSets.trim() || "1",
      repsOrDuration: newExReps.trim() || "—",
    };
    setCustomExercises((prev) => [...prev, custom]);
    setNewExName("");
    setNewExTargetArea("");
    setNewExSets("");
    setNewExReps("");
    setAddingExercise(false);
  }

  function removeCustomExercise(exerciseId: string) {
    setCustomExercises((prev) => prev.filter((e) => e.id !== exerciseId));
    setExerciseLogs((prev) => {
      const { [exerciseId]: _removed, ...rest } = prev;
      return rest;
    });
  }

  async function handleSave() {
    if (!template) return;
    setSaving(true);
    try {
      let finalPhotoURL = photoURL;
      if (photoFile) {
        finalPhotoURL = await uploadPhoto(photoFile, "workouts");
      }
      const allExercises = [...template.exercises, ...customExercises];
      const exLogs: ExerciseLogEntry[] = allExercises.map(
        (e) => exerciseLogs[e.id] ?? { exerciseId: e.id, completed: false, note: "" }
      );
      await saveWorkoutLog({
        owner: person,
        dateKey,
        templateId: template.id,
        templateName: template.name,
        location: template.location,
        exerciseLogs: exLogs,
        customExercises,
        photoURL: finalPhotoURL,
        note,
      });
      navigate(`/${person}/logs/day/${dateKey}`);
    } catch (err) {
      console.error("Failed to save workout:", err);
      alert("Couldn't save this workout. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const allExercises = [...template.exercises, ...customExercises];
  const completedCount = allExercises.filter((e) => exerciseLogs[e.id]?.completed).length;

  return (
    <div className="page">
      <div className="page-header">
        <button className="icon-button" onClick={() => navigate(-1)}>‹</button>
        <h1 style={{ fontSize: 17, margin: 0, textAlign: "center", flex: 1 }}>{template.name}</h1>
        <div style={{ width: 40 }} />
      </div>
      <p style={{ margin: 0, color: "var(--color-text-secondary)", textAlign: "center" }}>{formatFullDate(date)}</p>

      {template.isRestDay ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p>Rest day — no exercises scheduled. Feel free to add a note below.</p>
        </div>
      ) : (
        <>
          <p className="section-title" style={{ marginTop: 0 }}>
            {completedCount}/{allExercises.length} completed
          </p>
          <div className="card-list">
            {template.exercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                log={exerciseLogs[ex.id]}
                onToggle={() => toggleExercise(ex.id)}
                onNoteChange={(text) => setExerciseNote(ex.id, text)}
              />
            ))}
            {customExercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                log={exerciseLogs[ex.id]}
                onToggle={() => toggleExercise(ex.id)}
                onNoteChange={(text) => setExerciseNote(ex.id, text)}
                onRemove={() => removeCustomExercise(ex.id)}
              />
            ))}
          </div>

          {addingExercise ? (
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                className="text-field"
                placeholder="Exercise name"
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
              />
              <input
                className="text-field"
                placeholder="Target area (optional)"
                value={newExTargetArea}
                onChange={(e) => setNewExTargetArea(e.target.value)}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="text-field"
                  placeholder="Sets"
                  value={newExSets}
                  onChange={(e) => setNewExSets(e.target.value)}
                />
                <input
                  className="text-field"
                  placeholder="Reps/Duration"
                  value={newExReps}
                  onChange={(e) => setNewExReps(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="secondary-button" style={{ flex: 1 }} onClick={() => setAddingExercise(false)}>Cancel</button>
                <button className="primary-button" style={{ flex: 1 }} disabled={!newExName.trim()} onClick={handleAddExercise}>
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button className="secondary-button" onClick={() => setAddingExercise(true)}>+ Add your own exercise</button>
          )}
        </>
      )}

      <p className="section-title">Overall Note</p>
      <textarea className="textarea-field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="How did it go?" />

      <p className="section-title">Photo</p>
      {photoURL && !photoFile && <img src={photoURL} alt="" style={{ width: "100%", borderRadius: 12 }} />}
      <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />

      <button className="primary-button" disabled={saving} onClick={handleSave}>
        {saving ? "Saving…" : "Save Workout"}
      </button>
    </div>
  );
}

function ExerciseCard({
  exercise,
  log,
  onToggle,
  onNoteChange,
  onRemove,
}: {
  exercise: Exercise;
  log: ExerciseLogEntry | undefined;
  onToggle: () => void;
  onNoteChange: (text: string) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <button
          onClick={onToggle}
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "2px solid var(--color-accent)",
            background: log?.completed ? "var(--color-accent)" : "transparent",
            flexShrink: 0,
            marginTop: 2,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{exercise.name}</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {exercise.targetArea} • {prescription(exercise)}
          </div>
          {exercise.notes && <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 2 }}>{exercise.notes}</div>}
        </div>
        {onRemove && (
          <button className="icon-button" onClick={onRemove} style={{ width: 28, height: 28, fontSize: 14 }}>✕</button>
        )}
      </div>
      <input
        className="text-field"
        placeholder="Note (optional)"
        value={log?.note ?? ""}
        onChange={(e) => onNoteChange(e.target.value)}
      />
    </div>
  );
}
