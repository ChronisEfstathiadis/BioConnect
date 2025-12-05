export interface Profile {
  FirstName: string;
  LastName: string;
  avatar_url: string;
  phone: string;
  email: string;
  id: string;
  created_at: string;
}

export interface ProfileId {
  FirstName: string;
  LastName: string;
  avatar_url: string;
  phone: string;
  email: string;
  id: string;
  created_at: string;
  jobs: Job[];
  services: Service[];
  projects: Project[];
  social_links: SocialLink[];
}

export interface Job {
  title: string;
  description: string;
  id: number;
  profile_id: string;
}

export interface Service {
  title: string;
  description: string;
  sort_order: number;
  id: number;
  profile_id: string;
}

export interface Project {
  title: string;
  description: string;
  project_link: string;
  sort_order: number;
  id: number;
  profile_id: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  id: number;
  profile_id: string;
}
