import type { Job } from "../Types/JobTypes";
import { API_URL } from "../config/api";

export const getJobs = async (profile_id: string): Promise<Job[]> => {
  const response = await fetch(`${API_URL}/jobs/${profile_id}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }
  return response.json();
};

export const createJob = async (job: Job): Promise<Job> => {
  const response = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(job),
  });
  if (!response.ok) {
    throw new Error("Failed to create job");
  }
  return response.json();
};

export const updateJob = async (job: Job): Promise<Job> => {
  const response = await fetch(`${API_URL}/jobs/${job.id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(job),
  });
  if (!response.ok) {
    throw new Error("Failed to update job");
  }
  return response.json();
};

export const deleteJob = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/jobs/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete job");
  }
  return response.json();
};
