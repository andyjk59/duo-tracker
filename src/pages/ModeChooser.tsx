import { useNavigate } from "react-router-dom";
import { appName, PEOPLE } from "../config";
import Avatar from "../components/Avatar";

function ModeButton({ name, color, onClick }: { name: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card-row" style={{ background: "rgba(240, 213, 230, 0.8)" }}>
      <Avatar name={name} color={color} size={56} />
      <span style={{ flex: 1, fontSize: 22, fontWeight: 700, textAlign: "left", marginLeft: 8 }}>{name}</span>
      <span style={{ color: "var(--color-text-tertiary)", fontSize: 20 }}>›</span>
    </button>
  );
}

export default function ModeChooser() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ alignItems: "stretch", paddingTop: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h1 style={{ fontSize: 40, margin: 0, fontWeight: 800 }}>{appName}</h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: 6 }}>Hey! Who are you?</p>
      </div>

      <div className="button-stack">
        <ModeButton name={PEOPLE.personA.name} color={PEOPLE.personA.color} onClick={() => navigate("/personA")} />
        <ModeButton name={PEOPLE.personB.name} color={PEOPLE.personB.color} onClick={() => navigate("/personB")} />
      </div>
    </div>
  );
}
