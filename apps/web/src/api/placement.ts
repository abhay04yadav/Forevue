import { apiClient } from "./client";

export interface PlacementDrive {
  id: string;
  title: string;
  company_name: string;
  status: string;
  drive_date: string | null;
  location: string | null;
  created_at: string;
}

export interface PlacementSummary {
  active_drives: number;
  draft_drives: number;
  closed_drives: number;
  headline: string;
  note: string;
}

export async function getPlacementSummary(): Promise<PlacementSummary> {
  const { data } = await apiClient.get<PlacementSummary>("/placement/summary");
  return data;
}

export async function listPlacementDrives(): Promise<PlacementDrive[]> {
  const { data } = await apiClient.get<PlacementDrive[]>("/placement/drives");
  return data;
}
