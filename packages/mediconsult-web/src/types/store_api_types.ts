// packages/.../src/store/types.ts
// Shared types for RTK Query API surface (adjust fields to match your backend)

export type Role = "ADMIN" | "DOCTOR" | "PATIENT";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  approved?: boolean;
  phone?: string | null;
  graduation_date?: string | null; // ISO date
  year_qualified?: number | null;
  licence_number?: string | null;
  medical_registration_number?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: Role | "PATIENT" | "DOCTOR";
  phone?: string | null;
  graduationDate?: string | null;
  year_qualified?: number | null;
  license_number?: string | null;
  medical_registration_number?: string | null;
  specializationIds?: number[]; // IDs-only flow
}

export interface Specialization {
  id: number;
  name: string;
}

export type AppointmentStatus =
  | "PENDING"
  | "ACCEPTED"
  | "CANCELLED"
  | "COMPLETED";

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string; // ISO
  duration_minutes: number;
  status: AppointmentStatus;
  reason?: string | null;
  created_at?: string;
  updated_at?: string;
}
