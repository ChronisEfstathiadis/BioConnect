import type { Service } from "../Types/ServicesTypes";
import { API_URL } from "../config/api";

export const getServices = async (profile_id: string) => {
  const response = await fetch(`${API_URL}/services/${profile_id}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }
  const data = await response.json();
  return data;
};

export const createService = async (service: Service) => {
  const response = await fetch(`${API_URL}/services`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(service),
  });
  const data = await response.json();
  return data;
};

export const updateService = async (service: Service) => {
  const response = await fetch(`${API_URL}/services/${service.id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(service),
  });
  const data = await response.json();
  return data;
};

export const deleteService = async (id: number) => {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete service");
  }
  const data = await response.json();
  return data;
};
