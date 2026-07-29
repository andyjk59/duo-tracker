import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../data/AppDataContext";
import { dateKey, addDays, startOfWeek, todayKey } from "../data/dateUtils";
import type { Person } from "../data/types";

function computeStreak(loggedKeys: Set<string>): number {
  let streak = 0;
  let cursor = new Date();
  while (loggedKeys.has(dateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export default function CalendarHome({ person }: { person: Person }) {
  const navigate = useNavigate();
  const { workoutLogs } = useAppData();
  const myLogs = useMemo(() => workoutLogs.filter((l) => l.owner === person), [workoutLogs, person]);
  const [displayedMonth, setDisplayedMonth] = useState(new Date());
  const [showingProgress, setShowingProgress] = useState(false);

  const loggedKeys = useMemo(() => new Set(myLogs.map((l) => l.dateKey)), [myLogs]);

  const monthDates = useMemo(() => {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const gridStart = startOfWeek(firstOfMonth);
    const dates: (Date | null)[] = [];
    let cursor = gridStart;
    while (cursor.getMonth() === month || dates.length % 7 !== 0 || cursor <= new Date(year, month + 1, 0)) {
      if (cursor.getMonth() === month) {
        dates.push(new Date(cursor));
      } else {
        dates.push(null);
      }
      cursor = addDays(cursor, 1);
      if (cursor.getMonth() !== month && dates.length % 7 === 0) break;
    }
    return dates;
  }, [displayedMonth]);

  const thisWeekCount = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = addDays(weekStart, 7);
    return myLogs.filter((l) => {
      const d = new Date(l.dateKey);
      return d >= weekStart && d < weekEnd;
    }).length;
  }, [myLogs]);

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return myLogs.filter((l) => {
      const d = new Date(l.dateKey);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [myLogs]);

  const streak = useMemo(() => computeStreak(loggedKeys), [loggedKeys]);

  const monthTitle = displayedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const today = todayKey();
  const weekdaySymbols = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="page">
      <div className="page-header">
        <button className="icon-button" onClick={() => navigate(`/${person}`)}>‹</button>
        <h1 style={{ fontSize: 26, margin: 0 }}>My Logs</h1>
        <button className="icon-button" onClick={() => setShowingProgress(true)}>📊</button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <div className="stat-block">
          <div className="stat-value">{thisWeekCount}/7</div>
          <div className="stat-label">This Week</div>
        </div>
        <div className="stat-block">
          <div className="stat-value">{thisMonthCount}</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="stat-block">
          <div className="stat-value">{streak}</div>
          <div className="stat-label">Streak</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1))}>‹</button>
          <strong>{monthTitle}</strong>
          <button onClick={() => setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1))}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginTop: 12, fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center" }}>
          {weekdaySymbols.map((s, i) => (
            <div key={i}>{s}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginTop: 8 }}>
          {monthDates.map((date, i) => {
            if (!date) return <div key={i} />;
            const key = dateKey(date);
            const isToday = key === today;
            return (
              <button
                key={i}
                onClick={() => navigate(`/${person}/logs/day/${key}`)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: isToday ? 700 : 400,
                    fontSize: 13,
                    background: isToday ? "rgba(217,185,155,0.4)" : "transparent",
                    border: isToday ? "1.5px solid var(--color-accent)" : "none",
                  }}
                >
                  {date.getDate()}
                </div>
                <div style={{ display: "flex", gap: 2, height: 5 }}>
                  {loggedKeys.has(key) && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-orange)" }} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 12, color: "var(--color-text-secondary)" }}>
        <span>🟠 Workout</span>
        <span>🔵 Diet</span>
      </div>

      {showingProgress && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", zIndex: 10 }}
          onClick={() => setShowingProgress(false)}
        >
          <div
            style={{ background: "var(--color-background)", width: "100%", maxHeight: "80vh", overflowY: "auto", borderRadius: "20px 20px 0 0", padding: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>History</h2>
            {myLogs.length === 0 && <p style={{ color: "var(--color-text-secondary)" }}>No workouts logged yet.</p>}
            {[...myLogs].sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1)).map((log) => (
              <div key={log.id} className="card-row" style={{ marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{log.dateKey}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{log.templateName} • {log.location}</div>
                </div>
              </div>
            ))}
            <button className="secondary-button" style={{ marginTop: 12 }} onClick={() => setShowingProgress(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
