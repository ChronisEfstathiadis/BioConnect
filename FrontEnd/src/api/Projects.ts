import { API_URL } from "../config/api";
import type { Project } from "../types/ProjectsTypes";

export const getProjects = async (profile_id: string) => {
  console.log("profile_id", profile_id);
  const response = await fetch(`${API_URL}/projects/${profile_id}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  const data = await response.json();
  // Convert IDs to strings and filter out any null values
  return Array.isArray(data)
    ? data.map((project) => ({
        ...project,
        id: String(project.id),
      }))
    : [];
};

export const createProject = async (project: Project) => {
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create project");
  }
  const data = await response.json();

  // ✅ Backend returns project directly, convert id to string
  return {
    ...data,
    id: String(data.id),
  };
};

export const updateProject = async (project: Project) => {
  const response = await fetch(`${API_URL}/projects/${project.id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    throw new Error("Failed to update project");
  }
  const data = await response.json();
  return data;
};

export const deleteProject = async (id: number) => {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete project");
  }
  return response.ok;
};
