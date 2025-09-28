// src/models.ts
export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export interface Patient {
  local_id: string; // UUIDv4 on client
  server_id?: number | null;
  name: string;
  dob?: string | null;
  meta?: string | null;
  updated_at?: number;
  sync_status?: SyncStatus;
}

export interface Consultation {
  local_id: string;
  server_id?: number | null;
  patient_local_id: string;
  title: string;
  scheduled_at?: number | null;
  updated_at?: number;
  sync_status?: SyncStatus;
}

export interface Message {
  local_id: string;
  server_id?: number | null;
  consultation_local_id: string;
  author_id?: string;
  body: string;
  created_at?: number;
  sync_status?: SyncStatus;
}
