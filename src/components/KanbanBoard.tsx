import { useState } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import KanbanColumn from "./KanbanColumn";
import TaskModal from "./TaskModal";
import CommentModal from "./CommentModal";
import { cardStyle } from "./KanbanCard";
import type { Task } from "./FetchTasks";
import { updateTaskStatus } from "./updateTaskStatus";
import { updateTask } from "./updateTask";

const COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "in-review", label: "In Review" },
  { id: "done", label: "Done" },
];

type Props = {
  tasks: Task[];
  onRefresh: () => void;
  allMembers?: string[];
};

export default function KanbanBoard({ tasks, onRefresh, allMembers = [] }: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [commentTask, setCommentTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    let newStatus = over.id as string;

    const isColumn = COLUMNS.some((col) => col.id === newStatus);
    if (!isColumn) {
      const targetTask = tasks.find((t) => t.id === newStatus);
      if (!targetTask) return;
      newStatus = targetTask.status;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateTaskStatus(taskId, newStatus, onRefresh);
    }
  };

  const handleModalSave = (taskId: string, title: string, description: string, priority: string, due_date: string | null, tags: string[], team_members: string[]) => {
    updateTask(taskId, { title, description, priority, due_date, tags, team_members }, onRefresh);
  };

  const handlePriorityChange = (taskId: string, priority: string) => {
    updateTask(taskId, { priority }, onRefresh);
  };

  const handleDueDateChange = (taskId: string, due_date: string | null) => {
    updateTask(taskId, { due_date }, onRefresh);
  };

  const handleDelete = async (taskId: string) => {
    const { supabase } = await import("../supabase");
    await supabase.from("tasks").delete().eq("id", taskId);
    onRefresh();
  };

  const handleAddComment = (taskId: string, comments: string[]) => {
    updateTask(taskId, { comments }, onRefresh);
    setCommentTask((prev) => prev ? { ...prev, comments } : null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", gap: "16px", height: "100%", width: "100%" }}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              tasks={tasks.filter((t) => t.status === col.id)}
              onCardClick={setSelectedTask}
              onPriorityChange={handlePriorityChange}
              onDueDateChange={handleDueDateChange}
              onDelete={handleDelete}
              onComment={setCommentTask}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div style={{ ...cardStyle, cursor: "grabbing", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", transform: "rotate(1.5deg)" }}>
              {activeTask.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleModalSave}
          allTags={Array.from(new Set(tasks.flatMap((t) => t.tags ?? [])))}
          allMembers={allMembers}
        />
      )}

      {commentTask && (
        <CommentModal
          task={commentTask}
          onClose={() => setCommentTask(null)}
          onAddComment={handleAddComment}
        />
      )}
    </>
  );
}
