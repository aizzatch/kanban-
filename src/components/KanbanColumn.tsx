import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";
import type { Task } from "./FetchTasks";
type Props = {
  id: string;
  label: string;
  tasks: Task[];
  onCardClick: (task: Task) => void;
  onPriorityChange: (taskId: string, priority: string) => void;
  onDueDateChange: (taskId: string, due_date: string | null) => void;
  onDelete: (taskId: string) => void;
  onComment: (task: Task) => void;
};

export default function KanbanColumn({ id, label, tasks, onCardClick, onPriorityChange, onDueDateChange, onDelete, onComment }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "16px",
        padding: "16px",
        border: isOver ? "1.5px dashed #94a3b8" : "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
        transition: "border 0.2s"
      }}
    >
      <h3 style={{ margin: "0 0 16px", fontSize: "0.75rem", fontWeight: 700, color: "#475569", flexShrink: 0, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center" }}>
        {label}
        <span style={{ marginLeft: "8px", background: "#e2e8f0", color: "#475569", borderRadius: "12px", padding: "2px 8px", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0" }}>
          {tasks.length}
        </span>
      </h3>

      <div ref={setNodeRef} style={{ flex: 1, overflowY: "auto", minHeight: "60px" }}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={() => onCardClick(task)} onPriorityChange={onPriorityChange} onDueDateChange={onDueDateChange} onDelete={onDelete} onComment={onComment} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
