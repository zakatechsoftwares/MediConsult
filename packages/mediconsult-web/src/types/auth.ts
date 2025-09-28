// src/types/auth.ts
export type UserRole = "DOCTOR" | "PATIENT";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  graduationDate?: string; // optional for PATIENT
  yearQualified?: number; // optional for PATIENT
  licenseNumber?: string; // optional for PATIENT
  medicalRegistrationNumber?: string; // optional for PATIENT
}
