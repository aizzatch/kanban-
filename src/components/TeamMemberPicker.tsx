import { useRef, useState } from "react";
import { initials, encodeMember, decodeMember, resizeAvatar } from "./teamMemberUtils";

type Props = {
  selected: string[];          // encoded member strings assigned to this task
  onChange: (v: string[]) => void;
  allMembers: string[];        // all unique encoded member strings across all tasks
};

export function MemberAvatar({ encoded, size = 26 }: { encoded: string; size?: number }) {
  const { name, avatar } = decodeMember(encoded);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: avatar ? "transparent" : "#485F86",
        overflow: "hidden", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: size * 0.38, fontWeight: 700,
        color: "#fff", flexShrink: 0,
      }}
    >
      {avatar
        ? <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : initials(name)
      }
    </div>
  );
}

export default function TeamMemberPicker({ selected, onChange, allMembers }: Props) {
  const [name, setName] = useState("");
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedSet = new Set(selected);
  const trimmed = name.trim();

  const suggestions = Array.from(new Set(allMembers)).filter(
    (enc) =>
      !selectedSet.has(enc) &&
      (!trimmed || decodeMember(enc).name.toLowerCase().includes(trimmed.toLowerCase()))
  );

  const add = (encoded: string) => {
    if (!selectedSet.has(encoded)) onChange([...selected, encoded]);
    setName("");
    setPendingAvatar(null);
  };

  const addNew = () => {
    if (!trimmed) return;
    add(encodeMember(trimmed, pendingAvatar));
  };

  const remove = (enc: string) => onChange(selected.filter((s) => s !== enc));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingAvatar(await resizeAvatar(file));
    e.target.value = "";
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addNew(); }
  };

  return (
    <div>
      {/* Selected member chips */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
          {selected.map((enc) => {
            const { name: mName } = decodeMember(enc);
            return (
              <span
                key={enc}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "2px 10px 2px 4px", fontSize: "0.78rem", color: "#212F49" }}
              >
                <MemberAvatar encoded={enc} size={22} />
                {mName}
                <button
                  type="button"
                  onClick={() => remove(enc)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: "#94a3b8", fontSize: "0.75rem" }}
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Input row: photo button + name input + add button */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        {/* Photo upload circle */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Upload photo"
          style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: pendingAvatar ? "transparent" : "#f1f5f9",
            border: "1px solid #e2e8f0", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 0,
          }}
        >
          {pendingAvatar
            ? <img src={pendingAvatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="preview" />
            : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )
          }
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

        {/* Name input with suggestions dropdown */}
        <div style={{ flex: 1, position: "relative" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKey}
            placeholder="Add team member…"
            style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
          />

          {focused && suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 20, maxHeight: "180px", overflowY: "auto" }}>
              {suggestions.map((enc, i) => {
                const { name: mName } = decodeMember(enc);
                return (
                  <button
                    key={enc}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); add(enc); }}
                    style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 12px", background: "none", border: "none", borderBottom: i < suggestions.length - 1 ? "1px solid #f1f5f9" : "none", cursor: "pointer", textAlign: "left" }}
                  >
                    <MemberAvatar encoded={enc} size={24} />
                    <span style={{ fontSize: "0.875rem", color: "#212F49" }}>{mName}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Add button */}
        <button
          type="button"
          onClick={addNew}
          disabled={!trimmed}
          style={{ padding: "7px 12px", border: "none", borderRadius: "6px", background: trimmed ? "#485F86" : "#b0bfd0", color: "#fff", cursor: trimmed ? "pointer" : "not-allowed", fontSize: "0.875rem", fontWeight: 600, flexShrink: 0 }}
        >
          +
        </button>
      </div>
    </div>
  );
}
