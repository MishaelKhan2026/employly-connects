export type AdminAccount = {
  id: string;
  name: string;
  account_role: string;
  location: string;
  skills: string[];
  about: string;
  looking_for: string;
  status: string;
  created_at: string;
  email: string | null;
  salary: string;
  is_admin: boolean;
};
