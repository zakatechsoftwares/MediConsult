// src/app/register/page.tsx
"use client";

import { useState } from "react";
import api from "../../lib/api";
import type { RegisterPayload, UserRole } from "../../types/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("PATIENT");
  const [phone, setPhone] = useState("");
  const [graduationDate, setGraduationDate] = useState("");
  const [yearQualified, setYearQualified] = useState<number | "">("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [medicalRegistrationNumber, setMedicalRegistrationNumber] =
    useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload: RegisterPayload = {
      name,
      email,
      password,
      role,
      phone,
      graduationDate: graduationDate || undefined,
      yearQualified: yearQualified === "" ? undefined : Number(yearQualified),
      licenseNumber: licenseNumber || undefined,
      medicalRegistrationNumber: medicalRegistrationNumber || undefined,
    };

    try {
      await api.post("/auth/register", payload);
      alert("Registration successful!");
    } catch (err) {
      console.error("Registration failed", err);
      alert("Error registering user");
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="w-full border p-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
        </select>
        <input
          type="tel"
          placeholder="Phone Number"
          className="w-full border p-2 rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {role === "DOCTOR" && (
          <>
            <input
              type="date"
              placeholder="Graduation Date"
              className="w-full border p-2 rounded"
              value={graduationDate}
              onChange={(e) => setGraduationDate(e.target.value)}
            />
            <input
              type="number"
              placeholder="Year Qualified"
              className="w-full border p-2 rounded"
              value={yearQualified}
              onChange={(e) => setYearQualified(Number(e.target.value))}
            />
            <input
              type="text"
              placeholder="License Number"
              className="w-full border p-2 rounded"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
            <input
              type="text"
              placeholder="Medical Registration Number"
              className="w-full border p-2 rounded"
              value={medicalRegistrationNumber}
              onChange={(e) => setMedicalRegistrationNumber(e.target.value)}
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
