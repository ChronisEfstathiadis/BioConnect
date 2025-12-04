import { API_URL } from "../config/api";
import type { SocialLinksTypes } from "../Types/SocialLinksTypes";

export const getSocialLinks = async (profile_id: string) => {
  const response = await fetch(`${API_URL}/social-links/${profile_id}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch social links");
  }
  return response.json();
};

export const createSocialLink = async (socialLink: SocialLinksTypes) => {
  const response = await fetch(`${API_URL}/social-links`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(socialLink),
  });
  if (!response.ok) {
    throw new Error("Failed to create social link");
  }
  return response.json();
};

export const updateSocialLink = async (socialLink: SocialLinksTypes) => {
  const response = await fetch(`${API_URL}/social-links/${socialLink.id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(socialLink),
  });
  if (!response.ok) {
    throw new Error("Failed to update social link");
  }
  return response.json();
};

export const deleteSocialLink = async (id: number) => {
  const response = await fetch(`${API_URL}/social-links/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete social link");
  }
  return response.json();
};
