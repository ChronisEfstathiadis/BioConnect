import type { Profile } from "../Types/ProfileTypes";
import { apiFetch } from "../utils/apiClient";

export const getProfile = async () => {
  const response = await apiFetch("/profile/me", {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to get profile");
  }

  return response.json() as Promise<Profile>;
};

export const getProfileById = async (id: string) => {
  const response = await apiFetch(`/profile/${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to get profile");
  }

  return response.json() as Promise<Profile>;
};

export const createProfile = async (profileData: {
  FirstName: string;
  LastName: string;
  phone?: string;
  avatar_url?: string;
}) => {
  const response = await apiFetch("/profile", {
    method: "POST",
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to create profile");
  }

  return response.json();
};

export const DeleteProfile = async (id: string) => {
  console.log("Deleting profile with ID:", id);
  const response = await apiFetch(`/profile/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to delete profile");
  }

  return response.json();
};

export const uploadAvatar = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch(`/profile/${userId}/avatar`, {
    method: "POST",
    headers: {}, // Don't set Content-Type for FormData, browser will set it with boundary
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to upload avatar");
  }

  return response.json();
};

export const updateProfile = async (id: string, updates: Partial<Profile>) => {
  const response = await apiFetch(`/profile/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "Failed to update profile");
  }

  return response.json();
};
