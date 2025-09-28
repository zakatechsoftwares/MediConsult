// scripts/seed.mjs
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

async function ensureAdmin() {
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123";
  const hashed = await bcrypt.hash(adminPassword, 10);

  // check if user already exists
  const { data: existing, error: selErr } = await supabase
    .from("users")
    .select("id,email")
    .eq("email", adminEmail)
    .limit(1)
    .maybeSingle();

  if (selErr) {
    console.error("Error checking admin existence:", selErr);
    throw selErr;
  }

  if (existing) {
    console.log("Admin already exists:", adminEmail);
    return existing;
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      email: adminEmail,
      password: hashed,
      name: "Admin",
      role: "ADMIN",
      approved: true,
    })
    .select("id,email,name,role,approved")
    .single();

  if (error) {
    console.error("Error creating admin:", error);
    throw error;
  }

  console.log("Created admin:", data.email);
  return data;
}

async function ensureDoctor() {
  const doctorEmail = "doctor1@example.com";
  const doctorPassword = "doctor123";
  const hashed = await bcrypt.hash(doctorPassword, 10);

  const { data: existing, error: selErr } = await supabase
    .from("users")
    .select("id,email,approved")
    .eq("email", doctorEmail)
    .limit(1)
    .maybeSingle();

  if (selErr) {
    console.error("Error checking doctor existence:", selErr);
    throw selErr;
  }

  if (existing) {
    console.log(
      "Doctor already exists:",
      doctorEmail,
      "approved=",
      existing.approved
    );
    return existing;
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      email: doctorEmail,
      password: hashed,
      name: "Dr Example",
      role: "DOCTOR",
      approved: false,
      medical_registration_number: "MR-987",
      licence_number: "LIC-123",
    })
    .select(
      "id,email,name,role,approved,medical_registration_number,licence_number"
    )
    .single();

  if (error) {
    console.error("Error creating doctor:", error);
    throw error;
  }

  console.log("Created doctor (unapproved):", data.email);
  return data;
}

async function ensurePatientRecord() {
  const patientName = "Demo Patient";

  // check by name (or change to a unique identifier you prefer)
  const { data: existing, error: selErr } = await supabase
    .from("patients")
    .select("id,name")
    .ilike("name", patientName)
    .limit(1)
    .maybeSingle();

  if (selErr) {
    console.error("Error checking patient existence:", selErr);
    throw selErr;
  }

  if (existing) {
    console.log("Patient record already exists:", existing.name);
    return existing;
  }

  const { data, error } = await supabase
    .from("patients")
    .insert({
      name: patientName,
      dob: "1990-01-01",
      meta: { demo: true },
      owner_id: null,
    })
    .select("id,name,dob,meta")
    .single();

  if (error) {
    console.error("Error creating patient record:", error);
    throw error;
  }

  console.log("Created patient record:", data.name);
  return data;
}

(async function main() {
  try {
    console.log("Starting Supabase seed...");

    // Optional: quick existence check for expected tables
    // Try a simple query to users; if it errors likely tables are missing
    const test = await supabase.from("users").select("id").limit(1);
    if (test.error) {
      console.error(
        "Error accessing users table. Make sure your DB has the expected tables. Error:",
        test.error
      );
      process.exit(1);
    }

    await ensureAdmin();
    await ensureDoctor();
    await ensurePatientRecord();

    console.log("Seed completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed", err);
    process.exit(1);
  }
})();
