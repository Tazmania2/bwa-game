export interface Usuario {
  user_id: string;
  created_at: string;
  email: string;
  avatar_url: string;
  full_name: string;
  deactivated_at: string | null;
  roles: string[];
  team_id: number;
}
