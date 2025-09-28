# MediConsult — Project Brief & Technical Specification
This document summarizes the purpose, features, architecture, what we’ve already built, what’s left, and the current challenge you asked me to capture. It’s written so you can paste it into your repo (e.g., docs/PROJECT_PLAN.md) and use it as the single source of truth for working with GitHub Co-Pilot, PRs and collaborators.

1 — Project purpose (one paragraph)
MediConsult is a telehealth platform that lets patients register and book appointments with doctors, while admins manage doctor approvals and user moderation. The product includes a mobile app (Expo / React Native), a web app (Next.js App Router + Tailwind), and a shared backend (Node/Express using Supabase/Postgres). The goal is a professional, mobile-first telehealth MVP with role-based authorization, appointment booking with conflict checking, doctor profiles with specializations and credentials, admin moderation, and a pathway to add messaging, notifications, and offline sync.

2 — Target users
Patients — find doctors by specialization, book appointments, view appointments.

Doctors — manage profile (specializations, license, graduation), view & accept/cancel appointments, see booked patients.

Admins — approve/reject doctor registrations, delete accounts, moderate platform.

3 — Core features (intended / planned)
Authentication & Roles
Register / Login (Patient, Doctor, Admin)

Doctor registration requires admin approval

JWT-based sessions

Doctor profile
Name, phone, email

Date of graduation, year qualified

Medical registration number & licence number

One-to-many specializations (many-to-many mapping table)

Specializations
Master list of medical specializations

Doctors can have multiple specializations

Patients can search by specialization then select specific doctor

Appointments
Patient books appointment: choose specialization → list doctors → choose doctor → pick date/time

Appointment lifecycle: PENDING → ACCEPTED / CANCELLED / COMPLETED

Server-side conflict detection and scheduling window checks

Doctor can accept/cancel/complete appointment via API/UI

Admin
Admin UI (web) to view pending doctor registrations

Approve / delete user accounts

Other planned
Messaging between patient & doctor (messages table)

Sync/offline support for mobile (push/pull sync + conflict resolution)

Email / push notifications for approvals and appointment changes

4 — Tech stack (current / recommended)
Monorepo: packages/* with workspaces
packages/mediconsult-web — Next.js (App Router + TypeScript) + Tailwind CSS v4

packages/MediConsult-mobile — Expo / React Native

packages/MediConsult-backend — Node.js (Express) + TypeScript

Optional: packages/shared for shared types and helpers

Backend
Database: Supabase (Postgres) — tables created via SQL (we moved away from Prisma due to issues)

Auth: JWT tokens generated in backend, stored in client (cookie or local store)

Password hashing: bcrypt (server-side)

DB access: @supabase/supabase-js in server controllers or server-side Postgres client

API server: Express with controllers for auth, specializations, appointments, admin

Frontend
Web: Next.js (App Router), React (client components where needed), TypeScript, Tailwind CSS v4.

State & data fetching: Redux Toolkit + RTK Query (you chose Redux); auth slice + RTK Query for API endpoints

Mobile: Redux + RTK Query, persisted via redux-persist and AsyncStorage

Dev tooling
ts-node-dev for backend dev

concurrently for running multiple services locally

Linting: ESLint + @typescript-eslint rules (no any)

Deploy: Vercel for web & backend (serverless or Node server), EAS + Google Play for mobile

5 — Database schema (summary)
(Use snake_case field names on Supabase; adjust in types if you want camelCase client-side.)
users
id (uuid) PK, email, password (hashed), name, role ENUM(‘PATIENT’,‘DOCTOR’,‘ADMIN’), approved boolean, phone, graduation_date (date), year_qualified (int), licence_number (text), medical_registration_number (text)

specializations
id (serial) PK, name (text, unique)

doctor_specializations (many-to-many)
doctor_id (uuid) FK -> users(id), specialization_id (int) FK -> specializations(id), PK(doctor_id, specialization_id)

appointments
id (uuid) PK, patient_id (uuid), doctor_id (uuid), scheduled_at (timestamptz), duration_minutes (int), status ENUM(‘PENDING’,‘ACCEPTED’,‘CANCELLED’,‘COMPLETED’), reason (text), created_at, updated_at

messages (planned)
id, consultation_id, sender_id, body, created_at

6 — API contract (key endpoints & payloads)
Auth
POST /auth/register

 Request body (IDs-only flow for specializations for doctors):

{ 
  "name":"Dr Example",
  "email":"dr@example.com",
  "password":"plaintext",
  "role":"DOCTOR",
  "phone":"+234...",
  "graduationDate":"2010-06-15",
  "yearQualified":2018,
  "licenseNumber":"LIC-123",
  "medicalRegistrationNumber":"MR-987",
  "specializationIds":[1,4]
}
Response: 201 { user: { id, email, role, approved } } (for doctors: approved=false — no token)

POST /auth/login

 Request: { email, password }

 Response: { accessToken, user }

Specializations
GET /specializations → [ { id, name } ]

GET /specializations/:id/doctors → list of approved doctors for specialization

Appointments
POST /appointments (patient):

 { doctorId, scheduledAt (ISO), durationMinutes?, reason? }

 Server validates scheduling window and conflicts and returns 201 or 409 on conflict.

GET /appointments/doctor (doctor) → list of appointments for authenticated doctor

PATCH /appointments/:id (doctor or admin) → { action: 'ACCEPT'|'CANCEL'|'COMPLETE' }

Admin
GET /admin/pending-doctors → list pending doctors

PATCH /admin/users/:id/approve → approve doctor

DELETE /admin/users/:id → delete user

7 — What we’ve achieved so far (✔ Done)
Monorepo structure and workspace scripts adjusted

Backend implemented with Supabase client instead of Prisma; auth/register/login routes exist

Admin endpoints created to list pending doctors, approve, delete users

Specializations table and doctor_specializations M:N mapping created and seeded

Appointments table and endpoints implemented (create, list, patch)

Server-side appointment conflict validation implemented (prevent overlaps)

Web frontend (Next.js App Router) pages:

Register page with doctor fields (specializations, graduation, license, med reg no)

Login page working

Booking page (select specialization → doctor → schedule)

Doctor appointments page with Accept/Cancel/Complete buttons

TypeScript types added for many entities (User, Appointment, Specialization)

Switched to Redux Toolkit + RTK Query for data fetching and caching; auth stored in Redux slice

Removed Prisma dependency issues and used Supabase SQL for schema and seeding

Resolved many dev errors: circular import identification and mitigation instructions (we identified the real culprit and a fix), any eslint fixes, and PowerShell-friendly curl instructions

8 — Remaining / incomplete items (⚠️ Partial / ⛔ Not done)
Priority ordered:
⚠️ Current runtime bug — circular import / client-server mismatch causing RSC error on /doctor/appointments page (we identified root cause and provided a simple fix: ensure api.ts does not import store and use getState in prepareHeaders, plus adding 'use client' at top of the page).

Status: Identified; patch provided. Needs to be applied, tested, and committed.

⚠️ Admin UI pages — backend endpoints are present; web admin pages still need final UI and wiring.

⚠️ Messaging & consultations — messages/consultation flows were discussed but not implemented (DB + controllers + UI).

⛔ Mobile app integration — mobile client screen equivalents and sync features still to implement.

⛔ Notifications (email/push) — not implemented.

⛔ Tests & CI — unit/integration tests and CI pipeline not configured.

⛔ Production readiness — logging, monitoring, DB backups, secret management, refresh tokens, rate-limiting.

⛔ Atomic user + specialization create transaction — we have rollback pattern; a DB transaction / RPC would be stronger.

⛔ Real-time / offline — optional advanced features for mobile sync.

9 — Current principal challenge (simple language)
The immediate blocker you reported is a runtime error when the doctor appointments page loads:
This function is not supported in React Server Components...