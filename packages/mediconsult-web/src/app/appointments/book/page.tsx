// src/app/appointments/book/page.tsx
"use client";

import { useState } from "react";
import type {
  AppointmentForm,
  Doctor,
  Specialization,
} from "../../../types/appointments";

export default function BookAppointmentPage() {
  const [form, setForm] = useState<AppointmentForm>({
    patientName: "",
    doctorId: "",
    specialization: "Cardiology",
    scheduledAt: "",
    notes: "",
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  function handleChange<T extends keyof AppointmentForm>(
    field: T,
    value: AppointmentForm[T]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to book appointment");
      alert("Appointment booked successfully!");
    } catch (err) {
      console.error(err);
      alert("Error booking appointment");
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Book Appointment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Name */}
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border p-2 rounded"
          value={form.patientName}
          onChange={(e) => handleChange("patientName", e.target.value)}
        />

        {/* Specialization */}
        <select
          className="w-full border p-2 rounded"
          value={form.specialization}
          onChange={(e) =>
            handleChange("specialization", e.target.value as Specialization)
          }
        >
          {(
            [
              "Addiction Medicine",
              "Allergy & Immunology",
              "Anesthesiology",
              "Cardiology",
              "Cardiothoracic Surgery",
              "Critical Care Medicine (Intensive Care)",
              "Dermatology",
              "Emergency Medicine",
              "Endocrinology",
              "Family Medicine",
              "Gastroenterology",
              "General Surgery",
              "Geriatric Medicine",
              "Geriatric Psychiatry",
              "Hematology",
              "Hematology–Oncology",
              "Hospital Medicine",
              "Infectious Disease",
              "Internal Medicine",
              "Medical Genetics / Genomic Medicine",
              "Neonatology",
              "Nephrology",
              "Neurology",
              "Neurosurgery",
              "Nuclear Medicine",
              "Obstetrics & Gynecology (OB/GYN)",
              "Oncology (Medical Oncology)",
              "Ophthalmology",
              "Orthopedic Surgery",
              "Otolaryngology (ENT)",
              "Pathology",
              "Pediatrics",
              "Pediatric Cardiology",
              "Pediatric Endocrinology",
              "Physical Medicine & Rehabilitation (PM&R)",
              "Plastic Surgery",
              "Preventive Medicine",
              "Psychiatry",
              "Pulmonology / Pulmonary & Critical Care",
              "Radiation Oncology",
              "Radiology (Diagnostic Radiology)",
              "Rheumatology",
              "Sleep Medicine",
              "Sports Medicine",
              "Urology",
              "Vascular Surgery",
            ] as Specialization[]
          ).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Doctor */}
        <select
          className="w-full border p-2 rounded"
          value={form.doctorId}
          onChange={(e) => handleChange("doctorId", e.target.value)}
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.name} ({doc.specialization})
            </option>
          ))}
        </select>

        {/* Date */}
        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={form.scheduledAt}
          onChange={(e) => handleChange("scheduledAt", e.target.value)}
        />

        {/* Notes */}
        <textarea
          placeholder="Notes (optional)"
          className="w-full border p-2 rounded"
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Book Appointment
        </button>
      </form>
    </div>
  );
}
