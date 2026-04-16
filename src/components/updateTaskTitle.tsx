import { supabase } from "../supabase";

export const updateTaskTitle = async (
  taskId: string,
  newTitle: string,
  onUpdated: () => void
): Promise<void> => {
  const { error } = await supabase
    .from("tasks")
    .update({ title: newTitle })
    .eq("id", taskId);

  if (error) {
    console.error("Error updating task title:", error);
  } else {
    onUpdated();
  }
};
