export default function Avatar({ name, color, size }: { name: string; color: string; size: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "#fff",
        fontWeight: 800,
        fontSize: size * 0.42,
      }}
    >
      {initial}
    </div>
  );
}
