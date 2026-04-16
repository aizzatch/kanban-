import { useState } from "react";
import { supabase } from "../supabase";
import DateTimePicker from "./DateTimePicker";
import TagInput from "./TagInput";
import TeamMemberPicker from "./TeamMemberPicker";

type Props = {
  userId: string;
  onTaskCreated: () => void;
  allTags?: string[];
  allMembers?: string[];
};

const WORD_LIMIT = 100;

const countWords = (text: string) =>
  text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

export default function CreateTask({ userId, onTaskCreated, allTags = [], allMembers = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [descError, setDescError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wordCount = countWords(description);
  const atLimit = wordCount >= WORD_LIMIT;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("normal");
    setDueDate(null);
    setTags([]);
    setTeamMembers([]);
    setDescError(null);
    setError(null);
  };

  const handleOpen = () => {
    resetForm();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setError(null);

    const { error: insertError } = await supabase.from("tasks").insert([
      {
        title: title.trim(),
        description,
        status: "todo",
        priority,
        due_date: dueDate,
        tags,
        team_members: teamMembers,
        user_id: userId,
      },
    ]);

    if (insertError) {
      console.error("Error creating task:", insertError);
      setError(insertError.message);
    } else {
      handleClose();
      onTaskCreated();
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        style={{
          padding: "9px 18px",
          border: "none",
          borderRadius: "8px",
          background: "#0f172a",
          color: "#ffffff",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: 500,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}
      >
        Create New Task
      </button>

      {open && (
        <div
          onClick={handleClose}
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
              width: "520px",
              maxWidth: "90vw",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "#1a2332", letterSpacing: "-0.02em" }}>Create New Task</h2>
              <button
                onClick={handleClose}
                style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#8492a6", letterSpacing: "0.02em", textTransform: "uppercase" as const }}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.95rem", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#8492a6", letterSpacing: "0.02em", textTransform: "uppercase" as const }}>Due Date</label>
              <DateTimePicker value={dueDate} onChange={setDueDate} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#8492a6", letterSpacing: "0.02em", textTransform: "uppercase" as const }}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "normal" | "high")}
                style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.95rem", outline: "none", background: "#fff" }}
              >
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
                <span style={{ fontSize: "0.75rem", color: atLimit ? "#ef4444" : "#94a3b8" }}>
                  {wordCount} / {WORD_LIMIT} words
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => {
                  const next = e.target.value;
                  if (countWords(next) <= WORD_LIMIT) {
                    setDescription(next);
                    setDescError(null);
                  } else {
                    setDescError("Description cannot exceed 100 words.");
                  }
                }}
                rows={4}
                placeholder="Add a description..."
                style={{
                  padding: "8px 10px",
                  border: `1px solid ${atLimit || descError ? "#ef4444" : "#e2e8f0"}`,
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              {descError && (
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#ef4444" }}>{descError}</p>
              )}
            </div>

            {error && <p style={{ margin: 0, fontSize: "0.78rem", color: "#ef4444" }}>Error: {error}</p>}

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={handleClose}
                style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff", cursor: "pointer", fontSize: "0.8125rem" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  background: title.trim() ? "#0f172a" : "#94a3b8",
                  color: "#fff",
                  cursor: title.trim() ? "pointer" : "not-allowed",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                }}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
