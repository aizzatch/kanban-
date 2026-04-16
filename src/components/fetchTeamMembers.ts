import { supabase } from "../supabase";
import type { TeamMember } from "./teamMemberUtils";

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
