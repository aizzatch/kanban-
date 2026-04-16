import { supabase } from "../supabase";

export type Task = {
  id: string;
  title: string;
  status: string;
  description: string | null;
  priority: "low" | "normal" | "high";
  due_date: string | null;
  tags: string[] | null;
  team_members: string[] | null;
  comments: string[] | null;
  user_id: string;
  created_at: string;
};

export const fetchTasks = async (
  userId: string,
  setTasks: (tasks: Task[]) => void
) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error(error);
  } else {
    setTasks(data as Task[]);
  }
};
