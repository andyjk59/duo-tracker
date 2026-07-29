import { useNavigate } from "react-router-dom";
import type { Person } from "../data/types";
import { PEOPLE, otherPerson } from "../config";
import Avatar from "../components/Avatar";

export default function ProfileHome({ person }: { person: Person }) {
  const navigate = useNavigate();
  const other = PEOPLE[otherPerson(person)].name;

  return (
    <div className="page" style={{ alignItems: "stretch", paddingTop: 48 }}>
      <div className="page-header">
        <button className="icon-button" onClick={() => navigate("/")}>‹</button>
        <div style={{ flex: 1 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Avatar name={PEOPLE[person].name} color={PEOPLE[person].color} size={78} />
        <h1 style={{ fontSize: 28, margin: 0 }}>Hi, {PEOPLE[person].name}</h1>
      </div>

      <div className="button-stack">
        <button className="card-row" onClick={() => navigate(`/${person}/logs`)}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>My Logs</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Log your workouts and diet</div>
          </div>
          <span style={{ color: "var(--color-text-tertiary)", fontSize: 20 }}>›</span>
        </button>

        <button className="card-row" onClick={() => navigate(`/${person}/view`)}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{other}'s Log</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>See {other}'s day, read-only</div>
          </div>
          <span style={{ color: "var(--color-text-tertiary)", fontSize: 20 }}>›</span>
        </button>
      </div>
    </div>
  );
}
