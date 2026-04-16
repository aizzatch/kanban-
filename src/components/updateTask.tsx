import { supabase } from "../supabase";

export const updateTask = async (
  taskId: string,
  updates: { title?: string; description?: string; priority?: string; due_date?: string | null; tags?: string[] | null; team_members?: string[] | null; comments?: string[] | null },
  onUpdated: () => void
): Promise<void> => {
  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId);

  if (error) {
    console.error("Error updating task:", error);
  } else {
    onUpdated();
  }
};
