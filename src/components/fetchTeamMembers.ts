import { supabase } from "../supabase";

type TeamMember = { id: string; user_id: string; name: string; avatar?: string | null; [key: string]: unknown };

export const fetchTeamMembers = async (
  userId: string,
  setMembers: (members: TeamMember[]) => void
) => {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("user_id", userId)
    .order("name");

  if (error) console.error("Error fetching team members:", error);
  else setMembers(data as TeamMember[]);
};
