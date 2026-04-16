import { useState } from "react";
import { createPortal } from "react-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "./FetchTasks";
import pencilIcon from "../assets/pencil.svg";
import circleXIcon from "../assets/circle-x.svg";
import DateTimePicker from "./DateTimePicker";
import { initials, decodeMember } from "./teamMemberUtils";

const priorityStyles: Record<string, { background: string; color: string; label: string }> = {
  low: { background: "#f0fdf4", color: "#16a34a", label: "Low" },
  normal: { background: "#eff6ff", color: "#2563eb", label: "Normal" },
  high: { background: "#fff7ed", color: "#ea580c", label: "High" },
};


function getTimeUntil(iso: string): { label: string; color: string; cardBg: string } {
  const diff = new Date(iso).getTime() - Date.now();
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  if (diff < 0) return { label: "Overdue", color: "#dc2626", cardBg: "#fee2e2" };
  if (minutes < 60) return { label: `${minutes}m left`, color: "#dc2626", cardBg: "#fff1f2" };
  if (hours < 24) return { label: `${hours}h left`, color: "#dc2626", cardBg: "#fff1f2" };
  if (days === 1) return { label: "Tomorrow", color: "#b45309", cardBg: "#fef9c3" };
  if (days < 7) return { label: `${days}d left`, color: "#b45309", cardBg: "#fef9c3" };
  if (days < 30) return { label: `${Math.floor(days / 7)}w left`, color: "#1d4ed8", cardBg: "#dbeafe" };
  return { label: `${Math.floor(days / 30)}mo left`, color: "#1d4ed8", cardBg: "#eff6ff" };
}

type Props = {
  task: Task;
  onClick: () => void;
  onPriorityChange: (taskId: string, priority: string) => void;
  onDueDateChange: (taskId: string, due_date: string | null) => void;
  onDelete: (taskId: string) => void;
  onComment: (task: Task) => void;
};

export const cardStyle = {
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "12px",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)",
  position: "relative" as const,
};

export default function KanbanCard({ task, onClick, onPriorityChange, onDueDateChange, onDelete, onComment }: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [glowState, setGlowState] = useState({ x: 50, y: 50 });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const customTransform = CSS.Transform.toString(transform)
    ? CSS.Transform.toString(transform)
    : (isHovered && !isDragging ? "translateY(-3px)" : undefined);

  // Get urgency card background tint
  const isDone = task.status === "done";
  const dueTint = !isDone && task.due_date ? getTimeUntil(task.due_date) : null;
  const cardBg = isDone ? "#dcfce7" : (dueTint ? dueTint.cardBg : "#ffffff");

  const style = {
    ...cardStyle,
    background: cardBg,
    transform: customTransform,
    transition: isDragging ? undefined : (transition || "transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease"),
    boxShadow: isHovered && !isDragging
      ? "0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)"
      : cardStyle.boxShadow,
    opacity: isDragging ? 0 : 1,
    cursor: "grab",
    "--glow-x": `${glowState.x}%`,
    "--glow-y": `${glowState.y}%`,
    "--glow-intensity": isHovered ? "1" : "0",
  } as React.CSSProperties;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlowState({ x, y });
  };

  const p = priorityStyles[task.priority] ?? priorityStyles.normal;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card-glow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      {...attributes}
      {...listeners}
    >
      {/* Title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        {/* Delete button — back inline, left of title */}
        <button
          onClick={() => setConfirmDelete(true)}
          onPointerDown={(e) => e.stopPropagation()}
          title="Delete task"
          style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center", opacity: 0.65, transition: "opacity 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.65")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </button>
        <span style={{ fontSize: "0.99rem", color: "#1a2332", flex: 1, fontWeight: 850, lineHeight: 1.3, letterSpacing: "-0.01em" }}>{task.title}</span>
        <button
          onClick={() => onComment(task)}
          onPointerDown={(e) => e.stopPropagation()}
          title="Comments"
          style={{ flexShrink: 0, background: "none", border: "1px solid #0f172a", borderRadius: "4px", cursor: "pointer", padding: "2px 6px", color: "#0f172a", lineHeight: 1.4, display: "flex", alignItems: "center", gap: "3px" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {(task.comments?.length ?? 0) > 0 && (
            <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#0f172a" }}>
              {task.comments!.length}
            </span>
          )}
        </button>
        <button
          onClick={onClick}
          onPointerDown={(e) => e.stopPropagation()}
          title="Edit task"
          style={{ flexShrink: 0, background: "none", border: "1px solid #0f172a", borderRadius: "4px", cursor: "pointer", padding: "2px 6px", color: "#0f172a", lineHeight: 1.4 }}
        >
          <img src={pencilIcon} alt="Edit" style={{ width: "12px", height: "12px" }} />
        </button>
      </div>

      {/* Delete confirmation dialog */}
      {confirmDelete && typeof document !== "undefined" && createPortal(
        <div
          onClick={() => setConfirmDelete(false)}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              width: "320px",
              maxWidth: "90vw",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#1a2332" }}>
              Delete Task
            </h3>

            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              Are you sure you want to delete this task? This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setConfirmDelete(false);
                  onDelete(task.id);
                }}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#ef4444",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Team member avatars */}
      {task.team_members && task.team_members.length > 0 && (() => {
        const visible = task.team_members.slice(0, 5);
        const overflow = task.team_members.length - visible.length;
        return (
          <div style={{ display: "flex", alignItems: "center", marginTop: "8px" }}>
            {visible.map((enc, i) => {
              const { name, avatar } = decodeMember(enc);
              return (
                <div
                  key={enc}
                  title={name}
                  style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: avatar ? "transparent" : "#94a3b8",
                    border: "2px solid #fff",
                    marginLeft: i === 0 ? 0 : -6,
                    overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.6rem", fontWeight: 700, color: "#fff",
                    flexShrink: 0, zIndex: visible.length - i,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                >
                  {avatar
                    ? <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : initials(name)
                  }
                </div>
              );
            })}
            {overflow > 0 && (
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#e2e8f0", border: "2px solid #fff", marginLeft: -6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: "#64748b", flexShrink: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                +{overflow}
              </div>
            )}
          </div>
        );
      })()}

      {/* Footer: priority left, due date right */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
        {/* Priority Dropdown */}
        <div style={{ position: "relative" }} onPointerDown={(e) => e.stopPropagation()}>
          <select
            value={task.priority ?? "normal"}
            onChange={(e) => onPriorityChange(task.id, e.target.value)}
            style={{
              appearance: "none",
              padding: "4px 22px 4px 8px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 600,
              background: p.background,
              color: p.color,
              border: "1px solid transparent",
              cursor: "pointer",
              outline: "none",
              lineHeight: 1.2,
            }}
          >
            <option value="low">Low Priority</option>
            <option value="normal">Normal Priority</option>
            <option value="high">High Priority</option>
          </select>
          <svg style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        {/* Due date trigger + popover */}
        <div style={{ position: "relative" }} onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setPendingDate(task.due_date ?? null); setShowDatePicker((v) => !v); }}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            {task.status === "done" && task.due_date ? (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 600, color: "#16a34a", background: "#ffffff", border: "1px solid #0f172a", borderRadius: "6px", padding: "3px 8px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Done
              </span>
            ) : task.due_date ? (() => {
              const t = getTimeUntil(task.due_date);
              return (
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 600, color: "#0f172a", background: "#ffffff", border: "1px solid #0f172a", borderRadius: "6px", padding: "3px 8px" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {t.label}
                </span>
              );
            })() : (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontWeight: 500, color: "#94a3b8", border: "1px dashed #cbd5e1", borderRadius: "6px", padding: "3px 8px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Add date
              </span>
            )}
          </button>

          {showDatePicker && typeof document !== "undefined" && createPortal(
            <div onPointerDown={(e) => e.stopPropagation()}>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                onClick={() => setShowDatePicker(false)}
              />
              <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 9999, width: "220px", maxWidth: "90vw", boxSizing: "border-box" }}>
                <DateTimePicker
                  value={pendingDate}
                  onChange={setPendingDate}
                />
                <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    style={{ flex: 1, padding: "5px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff", cursor: "pointer", fontSize: "0.8rem", color: "#64748b" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { onDueDateChange(task.id, pendingDate); setShowDatePicker(false); }}
                    style={{ flex: 1, padding: "6px", border: "none", borderRadius: "6px", background: "#0f172a", color: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
}
