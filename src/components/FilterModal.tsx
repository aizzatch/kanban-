import { useState } from "react";
import DateTimePicker from "./DateTimePicker";
import { TAG_COLORS, decodeTag } from "./tagUtils";
import { decodeMember, initials } from "./teamMemberUtils";

export type FilterState = {
  dueDateMode: "none" | "lt24h" | "custom";
  customDate: string | null;
  priorities: ("low" | "normal" | "high")[];
  tags: string[];
  members: string[];
};

export const EMPTY_FILTER: FilterState = {
  dueDateMode: "none",
  customDate: null,
  priorities: [],
  tags: [],
  members: [],
};

type Props = {
  allTags: string[];
  allMembers: string[];
  applied: FilterState;
  onApply: (filters: FilterState) => void;
  onClose: () => void;
};

const PRIORITY_STYLES = {
  low:    { bg: "#f0fdf4", color: "#16a34a", border: "#86efac", label: "Low" },
  normal: { bg: "#eff6ff", color: "#2563eb", border: "#93c5fd", label: "Normal" },
  high:   { bg: "#fff7ed", color: "#ea580c", border: "#fdba74", label: "High" },
};

const SECTION_LABEL: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: "0.6875rem",
  fontWeight: 500,
  color: "#8492a6",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

export default function FilterModal({ allTags, allMembers, applied, onApply, onClose }: Props) {
  const [dueDateMode, setDueDateMode] = useState<FilterState["dueDateMode"]>(applied.dueDateMode);
  const [customDate, setCustomDate] = useState<string | null>(applied.customDate);
  const [priorities, setPriorities] = useState<FilterState["priorities"]>([...applied.priorities]);
  const [tags, setTags] = useState<string[]>([...applied.tags]);
  const [tagSearch, setTagSearch] = useState("");
  const [tagInputFocused, setTagInputFocused] = useState(false);
  const [members, setMembers] = useState<string[]>([...applied.members]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberInputFocused, setMemberInputFocused] = useState(false);

  const togglePriority = (p: "low" | "normal" | "high") => {
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  // Tags logic
  const selectedTagNames = new Set(tags.map((t) => decodeTag(t).name));
  const trimmedTagSearch = tagSearch.trim();
  const seenTagNames = new Set<string>();
  const tagSuggestions = allTags.filter((t) => {
    const { name } = decodeTag(t);
    if (seenTagNames.has(name)) return false;
    seenTagNames.add(name);
    if (selectedTagNames.has(name)) return false;
    if (trimmedTagSearch && !name.toLowerCase().includes(trimmedTagSearch.toLowerCase())) return false;
    return true;
  });
  const addTag = (encoded: string) => {
    const { name } = decodeTag(encoded);
    if (!selectedTagNames.has(name)) setTags((prev) => [...prev, encoded]);
    setTagSearch("");
  };
  const removeTag = (i: number) => setTags((prev) => prev.filter((_, idx) => idx !== i));

  // Members logic
  const selectedMemberSet = new Set(members);
  const trimmedMemberSearch = memberSearch.trim();
  const seenMemberNames = new Set<string>();
  const memberSuggestions = allMembers.filter((enc) => {
    const { name } = decodeMember(enc);
    if (seenMemberNames.has(name)) return false;
    seenMemberNames.add(name);
    if (selectedMemberSet.has(enc)) return false;
    if (trimmedMemberSearch && !name.toLowerCase().includes(trimmedMemberSearch.toLowerCase())) return false;
    return true;
  });
  const addMember = (encoded: string) => {
    if (!selectedMemberSet.has(encoded)) setMembers((prev) => [...prev, encoded]);
    setMemberSearch("");
  };
  const removeMember = (i: number) => setMembers((prev) => prev.filter((_, idx) => idx !== i));

  const handleClear = () => {
    onApply(EMPTY_FILTER);
    onClose();
  };

  const handleApply = () => {
    onApply({ dueDateMode, customDate, priorities, tags, members });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "32px",
          width: "500px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "#1a2332", letterSpacing: "-0.02em" }}>Filter Tasks</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#727B8C", lineHeight: 1, padding: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Due Date */}
        <div>
          <p style={SECTION_LABEL}>Due Date</p>
          <div style={{ display: "flex", gap: "8px", marginBottom: dueDateMode === "custom" ? "12px" : 0 }}>
            {(["lt24h", "custom"] as const).map((mode) => {
              const label = mode === "lt24h" ? "< 24 Hours" : "Custom";
              const active = dueDateMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setDueDateMode(active ? "none" : mode)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "6px",
                    border: `1px solid ${active ? "#0f172a" : "#e2e8f0"}`,
                    background: active ? "#0f172a" : "#fff",
                    color: active ? "#fff" : "#727B8C",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {dueDateMode === "custom" && (
            <DateTimePicker value={customDate} onChange={setCustomDate} />
          )}
        </div>

        {/* Priority */}
        <div>
          <p style={SECTION_LABEL}>Priority</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["low", "normal", "high"] as const).map((p) => {
              const s = PRIORITY_STYLES[p];
              const active = priorities.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePriority(p)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "6px",
                    border: `1px solid ${active ? s.color : s.border}`,
                    background: active ? s.bg : "#fff",
                    color: s.color,
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <p style={SECTION_LABEL}>Tags</p>

          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {tags.map((encoded, i) => {
                const { name, color } = decodeTag(encoded);
                const c = TAG_COLORS[color];
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: c.bg,
                      color: c.text,
                      border: `1px solid ${c.border}`,
                      borderRadius: "12px",
                      padding: "2px 10px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => removeTag(i)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: c.text, fontSize: "0.75rem" }}
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div style={{ position: "relative" }}>
            <input
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              onFocus={() => setTagInputFocused(true)}
              onBlur={() => setTagInputFocused(false)}
              placeholder="Search tags…"
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "0.8125rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {tagInputFocused && tagSuggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 2px)",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  zIndex: 10,
                  maxHeight: "160px",
                  overflowY: "auto",
                }}
              >
                {tagSuggestions.map((encoded, i) => {
                  const { name, color } = decodeTag(encoded);
                  const c = TAG_COLORS[color];
                  return (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); addTag(encoded); }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "7px 12px",
                        background: "none",
                        border: "none",
                        borderBottom: i < tagSuggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: "12px", padding: "2px 10px", fontSize: "0.75rem", fontWeight: 500 }}>
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div>
          <p style={SECTION_LABEL}>Team Members</p>

          {members.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {members.map((encoded, i) => {
                const { name, avatar } = decodeMember(encoded);
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: "20px",
                      padding: "2px 10px 2px 4px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "#1e293b",
                    }}
                  >
                    <div
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: avatar ? "transparent" : "#94a3b8",
                        overflow: "hidden", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "0.5rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                      }}
                    >
                      {avatar
                        ? <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : initials(name)
                      }
                    </div>
                    {name}
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: "#94a3b8", fontSize: "0.75rem" }}
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div style={{ position: "relative" }}>
            <input
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              onFocus={() => setMemberInputFocused(true)}
              onBlur={() => setMemberInputFocused(false)}
              placeholder="Search team members…"
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "0.8125rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            {memberInputFocused && memberSuggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 2px)",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  zIndex: 10,
                  maxHeight: "160px",
                  overflowY: "auto",
                }}
              >
                {memberSuggestions.map((encoded, i) => {
                  const { name, avatar } = decodeMember(encoded);
                  return (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); addMember(encoded); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        textAlign: "left",
                        padding: "7px 12px",
                        background: "none",
                        border: "none",
                        borderBottom: i < memberSuggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: avatar ? "transparent" : "#4f6d8a",
                          overflow: "hidden", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: "0.55rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                        }}
                      >
                        {avatar
                          ? <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : initials(name)
                        }
                      </div>
                      <span style={{ fontSize: "0.8125rem", color: "#1e293b" }}>{name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={handleClear}
            style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff", color: "#727B8C", fontSize: "0.8125rem", cursor: "pointer" }}
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            style={{ padding: "8px 20px", border: "none", borderRadius: "6px", background: "#0f172a", color: "#fff", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer" }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
