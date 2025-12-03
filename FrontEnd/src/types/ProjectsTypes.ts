export interface Project {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  project_link: string; // Change from project_url to project_link
  sort_order: number;
}
