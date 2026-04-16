import { supabase } from "../supabase";

export const updateTaskStatus = async (
  taskId: string,
  newStatus: string,
  onUpdated: () => void
): Promise<void> => {
  const { error } = await supabase
    .from("tasks")
    .update({ status: newStatus })
    .eq("id", taskId);

  if (error) {
    console.error("Error updating task:", error);
  } else {
    onUpdated();
  }
};
