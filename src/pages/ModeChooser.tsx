import { useNavigate } from "react-router-dom";
import { appName, PEOPLE } from "../config";

function ModeButton({ title, imageSrc, onClick }: { title: string; imageSrc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card-row" style={{ background: "rgba(228, 213, 183, 0.8)" }}>
      <div
        style={{
          width: 78,
          height: 78,
          borderRadius: "50%",
          background: "var(--color-background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "visible",
        }}
      >
        <img src={imageSrc} alt="" style={{ width: 93, height: 93, objectFit: "contain" }} />
      </div>
      <span style={{ flex: 1, fontSize: 22, fontWeight: 700, textAlign: "left", marginLeft: 8 }}>{title}</span>
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
        <ModeButton title={PEOPLE.personA.name} imageSrc={PEOPLE.personA.icon} onClick={() => navigate("/personA")} />
        <ModeButton title={PEOPLE.personB.name} imageSrc={PEOPLE.personB.icon} onClick={() => navigate("/personB")} />
      </div>
    </div>
  );
}
