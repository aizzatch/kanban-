import { useState } from "react";
import type { Task } from "./FetchTasks";

type Comment = { text: string; created_at: string };

function parseComment(raw: string): Comment | null {
  try { return JSON.parse(raw); } catch { return null; }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

type Props = {
  task: Task;
  onClose: () => void;
  onAddComment: (taskId: string, comments: string[]) => void;
};

export default function CommentModal({ task, onClose, onAddComment }: Props) {
  const [text, setText] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);

  const comments = (task.comments ?? [])
    .map(parseComment)
    .filter(Boolean) as Comment[];

  comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Find original index in task.comments by created_at
  const originalIndex = (c: Comment) =>
    (task.comments ?? []).findIndex((raw) => {
      const parsed = parseComment(raw);
      return parsed?.created_at === c.created_at;
    });

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newComment: Comment = { text: trimmed, created_at: new Date().toISOString() };
    const updated = [...(task.comments ?? []), JSON.stringify(newComment)];
    onAddComment(task.id, updated);
    setText("");
  };

  const handleAddKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); }
  };

  const handleDelete = (c: Comment) => {
    const idx = originalIndex(c);
    if (idx === -1) return;
    const updated = (task.comments ?? []).filter((_, i) => i !== idx);
    onAddComment(task.id, updated);
    setConfirmDeleteIdx(null);
  };

  const handleSaveEdit = (c: Comment) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    const idx = originalIndex(c);
    if (idx === -1) return;
    const updated = [...(task.comments ?? [])];
    updated[idx] = JSON.stringify({ text: trimmed, created_at: c.created_at });
    onAddComment(task.id, updated);
    setEditingIdx(null);
    setEditText("");
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "16px",
          width: "520px",
          maxWidth: "90vw",
          maxHeight: "85vh",
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "24px 28px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h2 style={{ margin: "0 0 3px", fontSize: "0.9375rem", fontWeight: 600, color: "#1a2332", letterSpacing: "-0.02em" }}>Comments</h2>
            <p style={{ margin: 0, fontSize: "0.6875rem", color: "#8492a6", fontWeight: 400, lineHeight: 1.5 }}>{task.title}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#727B8C", lineHeight: 1, padding: 0, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Comment list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {comments.length === 0 ? (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#8492a6", fontWeight: 400, textAlign: "center", paddingTop: "24px", lineHeight: 1.6 }}>
              No comments yet. Be the first to add one.
            </p>
          ) : (
            comments.map((c, i) => (
              <div
                key={c.created_at}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  position: "relative",
                }}
              >
                {editingIdx === i ? (
                  /* Edit mode */
                  <>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      autoFocus
                      style={{
                        padding: "6px 8px",
                        border: "1px solid #0f172a",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                        lineHeight: 1.5,
                        boxSizing: "border-box",
                        width: "100%",
                      }}
                    />
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => { setEditingIdx(null); setEditText(""); }}
                        style={{ padding: "4px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff", cursor: "pointer", fontSize: "0.8rem", color: "#727B8C" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(c)}
                        disabled={!editText.trim()}
                        style={{ padding: "4px 12px", border: "none", borderRadius: "6px", background: editText.trim() ? "#0f172a" : "#94a3b8", color: "#fff", cursor: editText.trim() ? "pointer" : "not-allowed", fontSize: "0.8rem", fontWeight: 500 }}
                      >
                        Save
                      </button>
                    </div>
                  </>
                ) : confirmDeleteIdx === i ? (
                  /* Delete confirmation */
                  <>
                    <p style={{ margin: 0, fontSize: "0.8125rem", color: "#1a2332", fontWeight: 500, letterSpacing: "-0.01em" }}>
                      Delete this comment?
                    </p>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => setConfirmDeleteIdx(null)}
                        style={{ padding: "4px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff", cursor: "pointer", fontSize: "0.8rem", color: "#727B8C" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        style={{ padding: "4px 12px", border: "none", borderRadius: "6px", background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  /* Normal view */
                  <>
                    {/* Action buttons top-right */}
                    <div style={{ position: "absolute", top: "8px", right: "10px", display: "flex", gap: "4px", alignItems: "center" }}>
                      <button
                        onClick={() => { setEditingIdx(i); setEditText(c.text); }}
                        title="Edit comment"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "#727B8C", lineHeight: 1, fontSize: "0.7rem", fontWeight: 500 }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setConfirmDeleteIdx(i)}
                        title="Delete comment"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "#ef4444", lineHeight: 1 }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <p style={{ margin: 0, fontSize: "0.8125rem", color: "#1a2332", fontWeight: 400, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", paddingRight: "40px" }}>
                      {c.text}
                    </p>
                    <span style={{ fontSize: "0.6875rem", color: "#8492a6", fontWeight: 400 }}>
                      {formatTimestamp(c.created_at)}
                    </span>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div style={{ padding: "16px 28px 24px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "10px" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleAddKey}
            placeholder="Write a comment"
            rows={3}
            style={{
              padding: "8px 10px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "0.875rem",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              lineHeight: 1.5,
              boxSizing: "border-box",
              width: "100%",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleAdd}
              disabled={!text.trim()}
              style={{
                padding: "8px 20px",
                border: "none",
                borderRadius: "6px",
                background: text.trim() ? "#0f172a" : "#94a3b8",
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: text.trim() ? "pointer" : "not-allowed",
              }}
            >
              Add Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
