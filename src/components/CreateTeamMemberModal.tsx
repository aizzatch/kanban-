import { useRef, useState } from "react";
import { supabase } from "../supabase";
import { resizeAvatar, initials } from "./teamMemberUtils";

type Props = {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateTeamMemberModal({ userId, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeAvatar(file);
      setAvatar(resized);
    } catch {
      setError("Could not process image.");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from("team_members").insert([
      { user_id: userId, name: name.trim(), avatar },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      onCreated();
      onClose();
    }
    setSaving(false);
  };

  const avatarSize = 80;
  const ini = initials(name || "?");

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: "10px", padding: "24px", width: "400px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#0f172a" }}>Add Team Member</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b", lineHeight: 1 }}>✕</button>
        </div>

        {/* Avatar upload */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: "50%",
              background: avatar ? "transparent" : "#e2e8f0",
              border: "2px dashed #cbd5e1",
              cursor: "pointer",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#64748b",
              flexShrink: 0,
            }}
          >
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : ini
            }
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{ fontSize: "0.8rem", color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
          >
            {avatar ? "Change photo" : "Upload photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        </div>

        {/* Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "#475569" }}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team member name"
            style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.95rem", outline: "none" }}
          />
        </div>

        {error && <p style={{ margin: 0, fontSize: "0.78rem", color: "#ef4444" }}>{error}</p>}

        {/* Footer */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff", cursor: "pointer", fontSize: "0.875rem" }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: name.trim() ? "#6366f1" : "#c7d2fe", color: "#fff", cursor: name.trim() ? "pointer" : "not-allowed", fontSize: "0.875rem", fontWeight: 500 }}
          >
            {saving ? "Saving…" : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
