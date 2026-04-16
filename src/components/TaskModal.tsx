import { useState } from "react";
import type { Task } from "./FetchTasks";
import DateTimePicker from "./DateTimePicker";
import TagInput from "./TagInput";
import TeamMemberPicker from "./TeamMemberPicker";

type Props = {
  task: Task;
  onClose: () => void;
  onSave: (taskId: string, title: string, description: string, priority: string, due_date: string | null, tags: string[], team_members: string[]) => void;
  allTags?: string[];
  allMembers?: string[];
};

const WORD_LIMIT = 100;
const countWords = (text: string) =>
  text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

export default function TaskModal({ task, onClose, onSave, allTags = [], allMembers = [] }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<"low" | "normal" | "high">(task.priority ?? "normal");
  const [dueDate, setDueDate] = useState<string | null>(task.due_date ?? null);
  const [tags, setTags] = useState<string[]>(task.tags ?? []);
  const [teamMembers, setTeamMembers] = useState<string[]>(task.team_members ?? []);
  const [descError, setDescError] = useState<string | null>(null);

  const wordCount = countWords(description);
  const atLimit = wordCount >= WORD_LIMIT;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(task.id, title.trim(), description, priority, dueDate, tags, teamMembers);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "520px", maxWidth: "90vw", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "20px", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "#1a2332", letterSpacing: "-0.02em" }}>Edit Task</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#727B8C", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#8492a6", letterSpacing: "0.02em", textTransform: "uppercase" as const }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.95rem", outline: "none" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#8492a6", letterSpacing: "0.02em", textTransform: "uppercase" as const }}>Due Date</label>
          <DateTimePicker value={dueDate} onChange={setDueDate} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#8492a6", letterSpacing: "0.02em", textTransform: "uppercase" as const }}>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as "low" | "normal" | "high")} style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.95rem", outline: "none", background: "#fff" }}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#8492a6", letterSpacing: "0.02em", textTransform: "uppercase" as const }}>Tags</label>
          <TagInput tags={tags} onChange={setTags} allTags={allTags} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#8492a6", letterSpacing: "0.02em", textTransform: "uppercase" as const }}>Team Members</label>
          <TeamMemberPicker selected={teamMembers} onChange={setTeamMembers} allMembers={allMembers} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#8492a6", letterSpacing: "0.02em", textTransform: "uppercase" as const }}>Description</label>
            <span style={{ fontSize: "0.75rem", color: atLimit ? "#ef4444" : "#94a3b8" }}>{wordCount} / {WORD_LIMIT} words</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => {
              const next = e.target.value;
              if (countWords(next) <= WORD_LIMIT) { setDescription(next); setDescError(null); }
              else setDescError("Description cannot exceed 100 words.");
            }}
            rows={4}
            placeholder="Add a description..."
            style={{ padding: "8px 10px", border: `1px solid ${atLimit || descError ? "#ef4444" : "#e2e8f0"}`, borderRadius: "6px", fontSize: "0.95rem", resize: "vertical", outline: "none", fontFamily: "inherit" }}
          />
          {descError && <p style={{ margin: 0, fontSize: "0.78rem", color: "#ef4444" }}>{descError}</p>}
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff", cursor: "pointer", fontSize: "0.8125rem" }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "8px 16px", border: "none", borderRadius: "6px", background: "#0f172a", color: "#fff", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500 }}>Save</button>
        </div>
      </div>
    </div>
  );
}
