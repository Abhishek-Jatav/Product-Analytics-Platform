export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "member";
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export interface Project {
  id: string;
  name: string;
  workspace_id: string;
}

export interface ApiKey {
  id: string;
  key: string;
  label: string;
}

export interface ProjectWithKey {
  project: Project;
  api_key: ApiKey;
}
