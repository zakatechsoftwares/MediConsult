// src/types/appointments.ts

export type Specialization =
  | "Addiction Medicine"
  | "Allergy & Immunology"
  | "Anesthesiology"
  | "Cardiology"
  | "Cardiothoracic Surgery"
  | "Critical Care Medicine (Intensive Care)"
  | "Dermatology"
  | "Emergency Medicine"
  | "Endocrinology"
  | "Family Medicine"
  | "Gastroenterology"
  | "General Surgery"
  | "Geriatric Medicine"
  | "Geriatric Psychiatry"
  | "Hematology"
  | "Hematology–Oncology"
  | "Hospital Medicine"
  | "Infectious Disease"
  | "Internal Medicine"
  | "Medical Genetics / Genomic Medicine"
  | "Neonatology"
  | "Nephrology"
  | "Neurology"
  | "Neurosurgery"
  | "Nuclear Medicine"
  | "Obstetrics & Gynecology (OB/GYN)"
  | "Oncology (Medical Oncology)"
  | "Ophthalmology"
  | "Orthopedic Surgery"
  | "Otolaryngology (ENT)"
  | "Pathology"
  | "Pediatrics"
  | "Pediatric Cardiology"
  | "Pediatric Endocrinology"
  | "Physical Medicine & Rehabilitation (PM&R)"
  | "Plastic Surgery"
  | "Preventive Medicine"
  | "Psychiatry"
  | "Pulmonology / Pulmonary & Critical Care"
  | "Radiation Oncology"
  | "Radiology (Diagnostic Radiology)"
  | "Rheumatology"
  | "Sleep Medicine"
  | "Sports Medicine"
  | "Urology"
  | "Vascular Surgery";

export interface Doctor {
  id: string;
  name: string;
  specialization: Specialization;
}

export interface AppointmentForm {
  patientName: string;
  doctorId: string;
  specialization: Specialization;
  scheduledAt: string; // ISO datetime string
  notes?: string;
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
