import { useState } from "react";

type Props = {
  value: string | null;
  onChange: (iso: string | null) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const selectStyle: React.CSSProperties = {
  padding: "4px 6px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  fontSize: "0.875rem",
  outline: "none",
  background: "#fff",
  cursor: "pointer",
  textAlign: "center",
};

function parseIso(iso: string) {
  const d = new Date(iso);
  const rawHour = d.getHours();
  return {
    dateStr: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    hour: rawHour === 0 ? 12 : rawHour > 12 ? rawHour - 12 : rawHour,
    minute: d.getMinutes(),
    ampm: rawHour >= 12 ? "PM" : "AM",
  };
}

export default function DateTimePicker({ value, onChange }: Props) {
  const init = value ? parseIso(value) : null;

  const [dateStr, setDateStr] = useState(init?.dateStr ?? "");
  const [hour, setHour] = useState(init?.hour ?? 12);
  const [minute, setMinute] = useState(init?.minute ?? 0);
  const [ampm, setAmpm] = useState<"AM" | "PM">((init?.ampm as "AM" | "PM") ?? "AM");

  const emit = (d: string, h: number, m: number, ap: "AM" | "PM") => {
    if (!d) { onChange(null); return; }
    const h24 = ap === "AM" ? (h === 12 ? 0 : h) : (h === 12 ? 12 : h + 12);
    onChange(new Date(`${d}T${pad(h24)}:${pad(m)}:00`).toISOString());
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <input
        type="date"
        value={dateStr}
        onChange={(e) => { setDateStr(e.target.value); emit(e.target.value, hour, minute, ampm); }}
        style={{ padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box" }}
      />

      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <select value={hour} onChange={(e) => { const h = Number(e.target.value); setHour(h); emit(dateStr, h, minute, ampm); }} style={selectStyle}>
          {HOURS.map((h) => <option key={h} value={h}>{pad(h)}</option>)}
        </select>

        <span style={{ color: "#94a3b8", fontWeight: 600 }}>:</span>

        <select value={minute} onChange={(e) => { const m = Number(e.target.value); setMinute(m); emit(dateStr, hour, m, ampm); }} style={selectStyle}>
          {MINUTES.map((m) => <option key={m} value={m}>{pad(m)}</option>)}
        </select>

        <select value={ampm} onChange={(e) => { const ap = e.target.value as "AM" | "PM"; setAmpm(ap); emit(dateStr, hour, minute, ap); }} style={selectStyle}>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}
