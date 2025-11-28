import authService from "./AuthService";
import type {
  Profile,
  Service,
  SocialLink,
  Project,
} from "../types/DatabaseTypes";

const API_URL = "http://localhost:8000";

class DataService {
  private async authFetch(endpoint: string, options: RequestInit = {}) {
    // Don't send token in header - backend will read from cookie
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
      credentials: "include", // Add this - removes Authorization header
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `HTTP error! status: ${res.status}`);
    }

    return res.json();
  }

  // --- Profile Operations ---

  async getProfile(userId: string): Promise<Profile | null> {
    return this.authFetch(`/api/profile/${userId}`);
  }

  async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<Profile> {
    return this.authFetch(`/api/profile/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async upsertProfile(profile: Profile): Promise<Profile> {
    return this.authFetch("/api/profile", {
      method: "POST",
      body: JSON.stringify(profile),
    });
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const token = await authService.getToken();
    const res = await fetch(`${API_URL}/api/profile/${userId}/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.avatarUrl;
  }

  async deleteAvatar(avatarUrl: string): Promise<void> {
    return this.authFetch("/api/profile/avatar", {
      method: "DELETE",
      body: JSON.stringify({ avatarUrl }),
    });
  }

  // --- Services Operations ---

  async getServices(userId: string): Promise<Service[]> {
    return this.authFetch(`/api/services?profile_id=${userId}`);
  }

  async createService(service: Omit<Service, "id">): Promise<Service> {
    return this.authFetch("/api/services", {
      method: "POST",
      body: JSON.stringify(service),
    });
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service> {
    return this.authFetch(`/api/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteService(id: number): Promise<void> {
    return this.authFetch(`/api/services/${id}`, {
      method: "DELETE",
    });
  }

  // --- SocialLinks Operations ---

  async getSocialLinks(userId: string): Promise<SocialLink[]> {
    return this.authFetch(`/api/social-links?profile_id=${userId}`);
  }

  async createSocialLink(link: Omit<SocialLink, "id">): Promise<SocialLink> {
    return this.authFetch("/api/social-links", {
      method: "POST",
      body: JSON.stringify(link),
    });
  }

  async updateSocialLink(
    id: number,
    updates: Partial<SocialLink>
  ): Promise<SocialLink> {
    return this.authFetch(`/api/social-links/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteSocialLink(id: number): Promise<void> {
    return this.authFetch(`/api/social-links/${id}`, {
      method: "DELETE",
    });
  }

  // --- Projects Operations ---

  async getProjects(userId: string): Promise<Project[]> {
    return this.authFetch(`/api/projects?profile_id=${userId}`);
  }

  async createProject(project: Omit<Project, "id">): Promise<Project> {
    return this.authFetch("/api/projects", {
      method: "POST",
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
    return this.authFetch(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(id: number): Promise<void> {
    return this.authFetch(`/api/projects/${id}`, {
      method: "DELETE",
    });
  }
}

export const dataService = new DataService();
export default dataService;
